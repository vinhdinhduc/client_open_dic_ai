export type UserRole = "user" | "moderator" | "admin";
export type UserStatus = "active" | "inactive" | "banned";
export type PreferredLanguage = "vi" | "en" | "lo";

export interface User {
    _id: string;
    email: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    preferredLanguage: PreferredLanguage;
    emailVerified: boolean;
    contributionCount: number;
    lastLogin?: string;
    commentCount: number;
    moderationPermissions?: {
        categories: string[];
        permissions: string[];
    };
    createdAt: string;
    updatedAt: string;
}

// Request types
export interface GetUsersParams {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
}

export interface UpdateUserData {
    fullName?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    preferredLanguage?: PreferredLanguage;
    moderationPermissions?: {
        categories: string[];
        permissions: string[];
    };
}

export interface ToggleStatusData {
    status: UserStatus;
}

// Response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedData<T> {
    users: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    usersByRole: {
        user: number;
        moderator: number;
        admin: number;
    };
}
