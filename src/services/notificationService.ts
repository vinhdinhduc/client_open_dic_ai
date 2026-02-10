import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";

export interface Notification {
    _id: string;
    recipient: string;
    type:
    | "contribution_approved"
    | "contribution_rejected"
    | "contribution_new"
    | "comment_reply"
    | "comment_moderated"
    | "report_resolved"
    | "report_rejected"
    | "report_new"
    | "system";
    title: string;
    message: string;
    relatedId?: string;
    relatedModel?: "Contribution" | "Comment" | "Term" | "Report";
    isRead: boolean;
    actionUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    unreadCount: number;
}

export interface GetNotificationsParams {
    page?: number;
    limit?: number;
    isRead?: boolean;
}

/**
 * Lấy danh sách thông báo
 */
const getNotifications = async (
    params: GetNotificationsParams = {}
): Promise<NotificationsResponse> => {
    try {
        const res = await axiosInstance.get<ApiResponse<NotificationsResponse>>(
            "/notifications",
            { params }
        );
        return res.data.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

/**
 * Đánh dấu thông báo đã đọc
 */
const markAsRead = async (notificationId: string): Promise<Notification> => {
    try {
        const res = await axiosInstance.put<ApiResponse<Notification>>(
            `/notifications/${notificationId}/read`
        );
        return res.data.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

/**
 * Đánh dấu tất cả đã đọc
 */
const markAllAsRead = async (): Promise<void> => {
    try {
        await axiosInstance.put("/notifications/read-all");
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};

/**
 * Xóa thông báo
 */
const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/notifications/${notificationId}`);
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};

const notificationService = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};

export default notificationService;
