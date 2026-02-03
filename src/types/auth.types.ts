

import { User } from "./user.types";

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Register data
export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    preferredLanguage?: "vi" | "en" | "lo";
}

// Auth response from API
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken?: string;
    };
}

// Profile response
export interface ProfileResponse {
    success: boolean;
    message: string;
    data: User;
}

// Change password data
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword?: string;
}

// Forgot password data
export interface ForgotPasswordData {
    email: string;
}

// Reset password data
export interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword?: string;
}

// Update profile data
export interface UpdateProfileData {
    fullName?: string;
    avatar?: string;
    preferredLanguage?: "vi" | "en" | "lo";
}
