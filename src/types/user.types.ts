

import { BaseEntity, Language } from "./common.types";

// User roles
export type UserRole = "user" | "moderator" | "admin";

// User status
export type UserStatus = "active" | "inactive" | "banned";

// Preferred language
export type PreferredLanguage = Language;

// Base User interface
export interface User extends BaseEntity {
    fullName: string;
    email: string;
    emailVerified?: boolean;
    role: UserRole;
    status: UserStatus;
    avatar?: string;
    preferredLanguage?: PreferredLanguage;
    contributedTermsCount?: number;
    contributionCount?: number;
    commentCount?: number;
    lastLogin?: string;
    moderationPermissions?: ModerationPermissions;
    authProvider?: "local" | "google";
    hasPassword?: boolean;
}

// Simplified User for references (in comments, terms, etc.)
export interface UserRef {
    _id: string;
    fullName: string;
    email?: string;
    avatar?: string;
}

// Moderation permissions for moderators
export interface ModerationPermissions {
    categories: string[];
    permissions: ("reports" | "suggestions" | "contributions" | "comments")[];
}

// API Parameters
export interface GetUsersParams {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// Create user data
export interface CreateUserData {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
    preferredLanguage?: PreferredLanguage;
}

// Update user data
export interface UpdateUserData {
    fullName?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    preferredLanguage?: PreferredLanguage;
    avatar?: string;
    moderationPermissions?: ModerationPermissions;
}

// Toggle status data
export interface ToggleStatusData {
    status: UserStatus;
}

// User statistics
export interface UserStats {
    total: number;
    active: number;
    inactive: number;
    banned: number;
    byRole: {
        admin: number;
        moderator: number;
        user: number;
    };
    newThisMonth?: number;
}

// Paginated users response
export interface PaginatedUsers {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// For backward compatibility - alias
export interface PaginatedData<T> {
    users?: T[];
    items?: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
