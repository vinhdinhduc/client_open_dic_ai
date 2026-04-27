import axiosInstance from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";

export interface Contribution {
    _id: string;
    type: "new_term" | "edit_term";
    targetTerm?: {
        _id: string;
        term: {
            vi: string;
            lo?: string;
            en?: string;
        };
        slug: string;
        definition?: {
            vi?: string;
            lo?: string;
            en?: string;
        };
        detailedExplanation?: {
            vi?: string;
            lo?: string;
            en?: string;
        };
        examples?: Array<{
            vi?: string;
            lo?: string;
            en?: string;
        }>;
        partOfSpeech?: string;
        tags?: string[];
    };
    term: {
        vi: string;
        lo?: string;
        en?: string;
    };
    definition: {
        vi: string;
        lo?: string;
        en?: string;
    };
    detailedExplanation?: {
        vi?: string;
        lo?: string;
        en?: string;
    };
    examples?: Array<{
        vi?: string;
        lo?: string;
        en?: string;
    }>;
    category: {
        _id: string;
        name: {
            vi: string;
            lo?: string;
            en?: string;
        };
        slug: string;
    };
    partOfSpeech?: string;
    tags?: string[];
    contributor: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    contributorNote?: string;
    status: "pending" | "approved" | "rejected";
    isDeleted?: boolean;
    deletedAt?: string | null;
    deletedBy?: string | null;
    moderator?: {
        _id: string;
        fullName: string;
    };
    moderatorNote?: string;
    moderatedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContributionStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface CreateContributionData {
    type: "new_term" | "edit_term";
    targetTerm?: string; // ObjectId của thuật ngữ hiện có (cho edit_term)
    term: {
        vi?: string;
        lo?: string;
        en?: string;
    };
    definition: {
        vi?: string;
        lo?: string;
        en?: string;
    };
    detailedExplanation?: {
        vi?: string;
        lo?: string;
        en?: string;
    };
    examples?: Array<{
        vi?: string;
        lo?: string;
        en?: string;
    }>;
    category: string; // ObjectId
    partOfSpeech?: string;
    tags?: string[];
    contributorNote?: string;
}

export interface GetContributionsParams {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    category?: string;
    mine?: boolean;
    includeDeleted?: boolean;
    onlyDeleted?: boolean;
}

export interface ContributionOverrideData {
    term?: {
        vi?: string;
        lo?: string;
        en?: string;
    };
    definition?: {
        vi?: string;
        lo?: string;
        en?: string;
    };
    detailedExplanation?: {
        vi?: string;
        lo?: string;
        en?: string;
    };
    examples?: Array<{
        vi?: string;
        lo?: string;
        en?: string;
    }>;
    partOfSpeech?: string;
    tags?: string[];
    contributorNote?: string;
}

export interface ModerateContributionData {
    moderatorNote?: string;
    overrideData?: ContributionOverrideData;
}

// Kiểu phản hồi cho getContributions - khớp với backend
export interface ContributionsResponse {
    contributions: Contribution[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}


/**
 * Tạo đóng góp mới
 */
const createContribution = async (
    data: CreateContributionData
): Promise<ApiResponse<Contribution>> => {
    const response = await axiosInstance.post<ApiResponse<Contribution>>(
        "/contributions",
        data
    );
    return response.data;
}

/**
 * Lấy danh sách đóng góp
 */
const getContributions = async (
    params: GetContributionsParams = {}
): Promise<ApiResponse<ContributionsResponse>> => {
    const response = await axiosInstance.get<
        ApiResponse<ContributionsResponse>
    >("/contributions", { params });
    return response.data;
}

const getMyContributions = async (
    params: Omit<GetContributionsParams, "mine"> = {}
): Promise<ApiResponse<ContributionsResponse>> => {
    const response = await axiosInstance.get<
        ApiResponse<ContributionsResponse>
    >("/contributions/me", { params });
    return response.data;
}

/**
 * Lấy chi tiết đóng góp
 */
const getContributionById = async (id: string): Promise<ApiResponse<Contribution>> => {
    const response = await axiosInstance.get<ApiResponse<Contribution>>(
        `/contributions/${id}`
    );
    return response.data;
}

/**
 * Phê duyệt đóng góp
 */
const approveContribution = async (
    id: string,
    data: ModerateContributionData = {}
): Promise<ApiResponse<Contribution>> => {
    const response = await axiosInstance.post<ApiResponse<Contribution>>(
        `/contributions/${id}/approve`,
        data
    );
    return response.data;
}

/**
 * Từ chối đóng góp
 */
const rejectContribution = async (
    id: string,
    data: ModerateContributionData
): Promise<ApiResponse<Contribution>> => {
    const response = await axiosInstance.post<ApiResponse<Contribution>>(
        `/contributions/${id}/reject`,
        data
    );
    return response.data;
}

/**
 * Xóa đóng góp
 */
const deleteContribution = async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
        `/contributions/${id}`
    );
    return response.data;
}

const restoreContribution = async (id: string): Promise<ApiResponse<Contribution>> => {
    const response = await axiosInstance.put<ApiResponse<Contribution>>(
        `/contributions/${id}/restore`
    );
    return response.data;
}

const emptyContributionTrash = async (): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ deletedCount: number }>>(
        `/contributions/trash/empty`
    );
    return response.data;
}


const bulkApprove = async (
    ids: string[],
    moderatorNote?: string
): Promise<ApiResponse<{ approved: number; failed: number }>> => {
    const response = await axiosInstance.post<
        ApiResponse<{ approved: number; failed: number }>
    >("/contributions/bulk-approve", { ids, moderatorNote });
    return response.data;
};

const bulkReject = async (
    ids: string[],
    moderatorNote: string
): Promise<ApiResponse<{ rejected: number; failed: number }>> => {
    const response = await axiosInstance.post<
        ApiResponse<{ rejected: number; failed: number }>
    >("/contributions/bulk-reject", { ids, moderatorNote });
    return response.data;
};

export const contributionService = {
    createContribution,
    getContributions,
    getMyContributions,
    getContributionById,
    approveContribution,
    rejectContribution,
    deleteContribution,
    restoreContribution,
    emptyContributionTrash,
    bulkApprove,
    bulkReject,
};
export default contributionService;
