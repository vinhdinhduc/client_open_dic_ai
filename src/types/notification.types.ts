

import { BaseEntity } from "./common.types";

// Loại thông báo
export type NotificationType =
    | "contribution_approved"
    | "contribution_rejected"
    | "comment_reply"
    | "term_updated"
    | "system"
    | "welcome";

// Kiểu dữ liệu thông báo
export interface Notification extends BaseEntity {
    user: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    readAt?: string;
}

// Đánh dấu thông báo đã đọc
export interface MarkNotificationReadData {
    notificationIds: string[];
}

// API Parameters
export interface GetNotificationsParams {
    isRead?: boolean;
    type?: NotificationType;
    page?: number;
    limit?: number;
}

// Phản hồi thông báo phân trang
export interface PaginatedNotifications {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    unreadCount: number;
}
