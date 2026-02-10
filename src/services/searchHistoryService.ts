import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";

export interface SearchHistoryItem {
    _id: string;
    query: string;
    resultCount: number;
    createdAt: string;
}

export interface SearchHistoryResponse {
    history: SearchHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Lấy lịch sử tìm kiếm
export const getSearchHistory = async (
    page: number = 1,
    limit: number = 20
): Promise<ApiResponse<SearchHistoryResponse>> => {
    const res = await axiosInstance.get<ApiResponse<SearchHistoryResponse>>(
        "/terms/search-history",
        { params: { page, limit } }
    );
    return res.data;
};

// Xóa một mục lịch sử
export const deleteSearchHistoryItem = async (
    id: string
): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
        `/terms/search-history/${id}`
    );
    return res.data;
};

// Xóa toàn bộ lịch sử
export const clearAllSearchHistory = async (): Promise<
    ApiResponse<{ message: string }>
> => {
    const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
        "/terms/search-history/all"
    );
    return res.data;
};

export default {
    getSearchHistory,
    deleteSearchHistoryItem,
    clearAllSearchHistory,
};
