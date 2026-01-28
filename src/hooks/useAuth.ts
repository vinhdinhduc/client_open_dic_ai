"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "moderator" | "admin";
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator" || user?.role === "admin";

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isModerator,
    login,
    logout,
  };
}
