import axiosInstance from "@/lib/axios";

// Types
interface Comment {
    _id: string;
    content: string;
    term: {
        _id: string;
        term: { vi: string; en?: string };
        category?: { name: { vi: string } };
    };
    author: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    status: "pending" | "approved" | "rejected";
    moderator?: {
        _id: string;
        fullName: string;
    };
    moderatorNote?: string;
    createdAt: string;
    updatedAt?: string;
}

interface GetCommentsResponse {
    comments: Comment[];
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface GetCommentsParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

/**
 * Lấy tất cả bình luận cho admin
 */
const getAllComments = async (
    params: GetCommentsParams = {}
): Promise<GetCommentsResponse> => {
    try {
        const res = await axiosInstance.get<ApiResponse<GetCommentsResponse>>(
            "/comments",
            { params }
        );
        return res.data.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

/**
 * Lấy bình luận theo term
 */
const getCommentsByTerm = async (
    termId: string,
    page: number = 1,
    limit: number = 10
) => {
    try {
        const res = await axiosInstance.get(`/comments/term/${termId}`, {
            params: { page, limit },
        });
        return res.data.data;
    } catch (error) {
        console.error("Error fetching comments by term:", error);
        throw error;
    }
};

/**
 * Tạo bình luận mới
 */
const createComment = async (termId: string, content: string) => {
    try {
        const res = await axiosInstance.post("/comments", {
            term: termId,
            content,
        });
        return res.data.data;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

/**
 * Cập nhật bình luận
 */
const updateComment = async (commentId: string, content: string) => {
    try {
        const res = await axiosInstance.put(`/comments/${commentId}`, { content });
        return res.data.data;
    } catch (error) {
        console.error("Error updating comment:", error);
        throw error;
    }
};

/**
 * Xóa bình luận
 */
const deleteComment = async (commentId: string) => {
    try {
        const res = await axiosInstance.delete(`/comments/${commentId}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
};

/**
 * Kiểm duyệt bình luận (phê duyệt/từ chối)
 */
const moderateComment = async (
    commentId: string,
    data: { status: "approved" | "rejected"; moderatorNote?: string }
) => {
    try {
        const res = await axiosInstance.post(`/comments/${commentId}/moderate`, data);
        return res.data.data;
    } catch (error) {
        console.error("Error moderating comment:", error);
        throw error;
    }
};

const commentService = {
    getAllComments,
    getCommentsByTerm,
    createComment,
    updateComment,
    deleteComment,
    moderateComment,
};

export default commentService;
export type { Comment, GetCommentsResponse, GetCommentsParams };