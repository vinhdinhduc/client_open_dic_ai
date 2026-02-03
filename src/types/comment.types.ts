

import { BaseEntity } from "./common.types";
import { UserRef } from "./user.types";

// Comment status
export type CommentStatus = "pending" | "approved" | "rejected";

// Comment interface
export interface Comment extends BaseEntity {
    term: string;
    author: UserRef;
    content: string;
    parentComment?: string;
    status: CommentStatus;
    replies?: Comment[];
}

// Create comment data
export interface CreateCommentData {
    termId: string;
    content: string;
    parentComment?: string;
}

// Update comment data
export interface UpdateCommentData {
    content?: string;
    status?: CommentStatus;
}

// API Parameters
export interface GetCommentsParams {
    termId?: string;
    status?: CommentStatus;
    page?: number;
    limit?: number;
}

// Paginated comments response
export interface PaginatedComments {
    comments: Comment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
