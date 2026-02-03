

import { BaseEntity } from "./common.types";

// Notification type
export type NotificationType =
    | "contribution_approved"
    | "contribution_rejected"
    | "comment_reply"
    | "term_updated"
    | "system"
    | "welcome";

// Notification interface
export interface Notification extends BaseEntity {
    user: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    readAt?: string;
}

// Mark notification as read
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

// Paginated notifications response
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
