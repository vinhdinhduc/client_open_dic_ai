import axiosInstance from "@/lib/axios";
import {
    User,
    GetUsersParams,
    UpdateUserData,
    UserStats,
    UserStatus,
    ToggleStatusData,
    CreateUserData,
    PaginatedData
} from "@/types";
import { ApiResponse } from "@/types/api.types";

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

export const exportUsersToExcel = async (): Promise<Blob> => {
    const response = await axiosInstance.get("/users/export/excel", {
        responseType: "blob",
    });
    return response.data;
}

/**
 * Reset password cho user (Admin)
 */
export const resetUserPassword = async (
    id: string,
    newPassword: string
): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.post(`/users/${id}/reset-password`, {
        newPassword,
    });
    return response.data;
};

/**
 * Gửi lại email xác thực
 */
export const resendVerificationEmail = async (
    id: string
): Promise<ApiResponse<{ message: string }>> => {
    const response = await axiosInstance.post(`/users/${id}/resend-verification`);
    return response.data;
};

/**
 * Batch update status cho nhiều user
 */
export const batchUpdateStatus = async (
    userIds: string[],
    status: UserStatus
): Promise<ApiResponse<{ message: string; updated: number }>> => {
    const response = await axiosInstance.post("/users/batch-update-status", {
        userIds,
        status,
    });
    return response.data;
};

/**
 * Lấy lịch sử hoạt động của user
 */
export const getUserActivity = async (
    id: string,
    params?: { page?: number; limit?: number }
): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get(`/users/${id}/activity`, { params });
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
    exportUsersToExcel,
    resetUserPassword,
    resendVerificationEmail,
    batchUpdateStatus,
    getUserActivity,
};

export default userService;