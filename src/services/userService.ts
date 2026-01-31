import axiosInstance from "@/lib/axios";
import { User, GetUsersParams, ApiResponse, PaginatedData, UpdateUserData, PreferredLanguage, UserStats, ToggleStatusData, } from "@/components/types/userTypes";

// Types for create user
export interface CreateUserData {
    fullName: string;
    email: string;
    password: string;
    role?: "user" | "moderator" | "admin";
    status?: "active" | "inactive";
    preferredLanguage?: "vi" | "en" | "lo";
}

export const getUsers = async (
    params: GetUsersParams = {}
): Promise<ApiResponse<PaginatedData<User>>> => {
    const response = await axiosInstance.get("/users", { params });
    return response.data;
};

/**
 * Lấy chi tiết người dùng theo ID
 */
export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
};

/**
 * Tạo người dùng mới (Admin)
 */
export const createUser = async (data: CreateUserData): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
};
/**
 * Cập nhật thông tin người dùng
 */
export const updateUser = async (
    id: string,
    data: UpdateUserData
): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
};

/**
 * Khóa/mở khóa tài khoản người dùng
 */
export const toggleUserStatus = async (
    id: string,
    data: ToggleStatusData
): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.put(`/users/${id}/status`, data);
    return response.data;
};

/**
 * Xóa người dùng
 */
export const deleteUser = async (
    id: string
): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
};

/**
 * Lấy thống kê người dùng
 */
export const getUserStats = async (): Promise<ApiResponse<UserStats>> => {
    const response = await axiosInstance.get("/users/stats");
    return response.data;
};

// Default export
const userService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getUserStats,
};

export default userService;