"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  authService,
  tokenUtils,
  User,
  LoginCredentials,
  RegisterData,
} from "@/services/authService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  googleLogin: (googleData: {
    googleId: string;
    email: string;
    fullName: string;
    avatar?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = tokenUtils.getUser();
        const token = tokenUtils.getToken();

        if (storedUser && token) {
          setUser(storedUser);

          // Optionally verify token with backend
          try {
            const response = await authService.getProfile();
            if (response.success && response.data) {
              setUser(response.data);
              tokenUtils.setUser(response.data);
            }
          } catch (error) {
            // Token invalid, clear auth
            console.error("Token verification failed:", error);
            tokenUtils.clearAuth();
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        tokenUtils.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        const response = await authService.login(credentials);

        if (response.success && response.data) {
          setUser(response.data.user);
          return true;
        }
        return false;
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message = err.response?.data?.message || "Đăng nhập thất bại";
        toast.error(message);
        throw error;
      }
    },
    [],
  );

  // Register function
  const register = useCallback(
    async (userData: RegisterData): Promise<boolean> => {
      try {
        const response = await authService.register(userData);

        // Không set user vào state sau khi đăng ký
        // User phải verify email trước khi đăng nhập
        if (response.success) {
          return true;
        }
        return false;
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message = err.response?.data?.message || "Đăng ký thất bại";
        toast.error(message);
        throw error;
      }
    },
    [],
  );

  // Google Login function
  const googleLogin = useCallback(
    async (googleData: {
      googleId: string;
      email: string;
      fullName: string;
      avatar?: string;
    }): Promise<boolean> => {
      try {
        const response = await authService.googleLogin(googleData);

        if (response.success && response.data) {
          setUser(response.data.user);
          return true;
        }
        return false;
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message =
          err.response?.data?.message || "Đăng nhập Google thất bại";
        toast.error(message);
        throw error;
      }
    },
    [],
  );

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    toast.success("Đăng xuất thành công");
  }, []);

  // Update user locally
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      tokenUtils.setUser(updated);
      return updated;
    });
  }, []);

  // Refresh profile from server
  const refreshProfile = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        tokenUtils.setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  }, []);

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator" || user?.role === "admin";

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isModerator,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { redirectTo?: string; requiredRole?: "admin" | "moderator" } = {},
) {
  const { redirectTo = "/login", requiredRole } = options;

  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated, isAdmin, isModerator } =
      useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push(redirectTo);
          return;
        }

        if (requiredRole === "admin" && !isAdmin) {
          router.push("/");
          toast.error("Bạn không có quyền truy cập trang này");
          return;
        }

        if (requiredRole === "moderator" && !isModerator) {
          router.push("/");
          toast.error("Bạn không có quyền truy cập trang này");
          return;
        }
      }
    }, [isLoading, isAuthenticated, isAdmin, isModerator, router]);

    if (!isLoading && !isAuthenticated) {
      return null; // Or a redirect component
    }
    if (!isLoading && requiredRole === "admin" && !isAdmin) {
      return null;
    }
    if (!isLoading && requiredRole === "moderator" && !isModerator) {
      return null;
    }
    if (isLoading) {
      return (
        <div className="auth-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Đang tải...</span>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export default AuthContext;
