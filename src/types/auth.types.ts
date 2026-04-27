

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

// Phản hồi xác thực từ API
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken?: string;
    };
}

// Phản hồi hồ sơ
export interface ProfileResponse {
    success: boolean;
    message: string;
    data: User;
}

// Dữ liệu đổi mật khẩu
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword?: string;
}

// Quên mật khẩu data
export interface ForgotPasswordData {
    email: string;
}

// Dữ liệu đặt lại mật khẩu
export interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword?: string;
}

// Dữ liệu cập nhật hồ sơ
export interface UpdateProfileData {
    fullName?: string;
    avatar?: string;
    preferredLanguage?: "vi" | "en" | "lo";
}
