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
    targetTerm?: string; // ObjectId of existing term (for edit_term)
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
}

export interface ModerateContributionData {
    moderatorNote?: string;
}

// Response type for getContributions - matches backend response
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


export const contributionService = {
    createContribution,
    getContributions,
    getContributionById,
    approveContribution,
    rejectContribution,
    deleteContribution,
};
export default contributionService;
