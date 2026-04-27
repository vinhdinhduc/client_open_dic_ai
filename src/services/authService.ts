import axiosInstance from "@/lib/axios";

// Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: "user" | "moderator" | "admin";
    avatar?: string;
    emailVerified?: boolean;
    status?: "active" | "inactive" | "banned";
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken?: string;
        refreshToken?: string;
    };
}

export interface ProfileResponse {
    success: boolean;
    message: string;
    data: User;
}


const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const tokenUtils = {
    getToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(TOKEN_KEY);
    },

    getRefreshToken: (): string | null => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    removeRefreshToken: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    getUser: (): User | null => {
        if (typeof window === "undefined") return null;
        try {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },

    setUser: (user: User): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    removeUser: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(USER_KEY);
    },

    clearAuth: (): void => {
        tokenUtils.removeToken();
        tokenUtils.removeRefreshToken();
        tokenUtils.removeUser();
    },
};

// Validation utils
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Mật khẩu phải có ít nhất 8 ký tự");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Mật khẩu phải có ít nhất 1 chữ hoa");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Mật khẩu phải có ít nhất 1 chữ thường");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Mật khẩu phải có ít nhất 1 số");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// API calls
export const authService = {
    /**
     * Đăng nhập
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await axiosInstance.post<AuthResponse>(
            "/auth/login",
            credentials
        );

        const { data } = response.data;

        // Lưu token và user info
        if (data.accessToken) {
            tokenUtils.setToken(data.accessToken);
            tokenUtils.setUser(data.user);
        }
        if (data.refreshToken) {
            tokenUtils.setRefreshToken(data.refreshToken);
        }

        return response.data;

    },

    /**
     * Đăng ký
     */
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        // Xóa confirmPassword trước khi gửi lên API
        const { confirmPassword, ...registerData } = userData;

        const response = await axiosInstance.post<AuthResponse>(
            "/auth/register",
            registerData
        );

        // Không tự động đăng nhập sau khi đăng ký
        // User phải verify email trước
        return response.data;
    },

    /**
     * Lấy thông tin profile
     */
    getProfile: async (): Promise<ProfileResponse> => {
        const response = await axiosInstance.get<ProfileResponse>("/auth/profile");
        return response.data;
    },

    /**
     * Cập nhật profile
     */
    updateProfile: async (
        updates: Partial<User>
    ): Promise<ProfileResponse> => {
        const response = await axiosInstance.put<ProfileResponse>(
            "/auth/profile",
            updates
        );

        // Cập nhật user trong localStorage
        const currentUser = tokenUtils.getUser();
        if (currentUser && response.data.data) {
            tokenUtils.setUser({ ...currentUser, ...response.data.data });
        }

        return response.data;
    },

    /**
     * Đổi mật khẩu
     */
    changePassword: async (
        currentPassword: string | undefined,
        newPassword: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axiosInstance.put("/auth/change-password", {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    /**
     * Đăng xuất
     */
    logout: async (): Promise<void> => {
        try {
            // Gọi API logout để xóa refresh token trên server
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Xóa token và user khỏi localStorage
            tokenUtils.clearAuth();
            // Redirect to home page
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
        }
    },

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isAuthenticated: (): boolean => {
        return !!tokenUtils.getToken();
    },

    /**
     * Lấy current user
     */
    getCurrentUser: (): User | null => {
        return tokenUtils.getUser();
    },

    /**
     * Quên mật khẩu - gửi email reset
     */
    forgotPassword: async (
        email: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axiosInstance.post("/auth/forgot-password", {
            email,
        });
        return response.data;
    },

    /**
     * Đặt lại mật khẩu bằng token
     */
    resetPassword: async (
        token: string,
        password: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axiosInstance.post("/auth/reset-password", {
            token,
            password,
        });
        return response.data;
    },

    /**
     * Đăng nhập bằng Google
     */
    googleLogin: async (googleData: {
        googleId: string;
        email: string;
        fullName: string;
        avatar?: string;
    }): Promise<AuthResponse> => {
        const response = await axiosInstance.post<AuthResponse>(
            "/auth/google",
            googleData
        );

        const { data } = response.data;

        if (data.accessToken) {
            tokenUtils.setToken(data.accessToken);
            tokenUtils.setUser(data.user);
        }
        if (data.refreshToken) {
            tokenUtils.setRefreshToken(data.refreshToken);
        }

        return response.data;
    },

    /**
     * Xác thực email bằng token
     */
    verifyEmail: async (
        token: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axiosInstance.post("/auth/verify-email", {
            token,
        });
        return response.data;
    },

    /**
     * Refresh access token
     */
    refreshAccessToken: async (): Promise<string | null> => {
        try {
            const refreshToken = tokenUtils.getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await axiosInstance.post<AuthResponse>(
                "/auth/refresh-token",
                { refreshToken }
            );

            const { data } = response.data;
            if (data.accessToken) {
                tokenUtils.setToken(data.accessToken);
                if (data.user) {
                    tokenUtils.setUser(data.user);
                }
                return data.accessToken;
            }
            return null;
        } catch (error) {
            console.error("Refresh token error:", error);
            tokenUtils.clearAuth();
            return null;
        }
    },

    /**
     * Gửi lại email xác thực
     */
    resendVerificationEmail: async (): Promise<{
        success: boolean;
        message: string;
    }> => {
        const response = await axiosInstance.post("/auth/resend-verification");
        return response.data;
    },
};

export default authService;
