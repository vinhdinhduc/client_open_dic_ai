import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";

export interface FavoriteItem {
    _id: string;
    term: {
        _id: string;
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
        category?: {
            _id: string;
            name: {
                vi: string;
                en?: string;
                lo?: string;
            };
            icon?: string;
        };
        viewCount?: number;
        favoriteCount?: number;
    };
    note?: string;
    createdAt: string;
}

export interface FavoritesResponse {
    favorites: FavoriteItem[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Lấy danh sách yêu thích
export const getFavorites = async (
    page: number = 1,
    limit: number = 20,
    category?: string
): Promise<ApiResponse<FavoritesResponse>> => {
    const params: Record<string, unknown> = { page, limit };
    if (category) params.category = category;
    const res = await axiosInstance.get<ApiResponse<FavoritesResponse>>(
        "/favorites",
        { params }
    );
    return res.data;
};

// Thêm yêu thích
export const addFavorite = async (
    termId: string,
    note?: string
): Promise<ApiResponse<FavoriteItem>> => {
    const res = await axiosInstance.post<ApiResponse<FavoriteItem>>(
        "/favorites",
        { termId, note }
    );
    return res.data;
};

// Xóa yêu thích
export const removeFavorite = async (
    termId: string
): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(
        `/favorites/${termId}`
    );
    return res.data;
};

// Kiểm tra đã yêu thích chưa
export const checkFavorite = async (
    termId: string
): Promise<ApiResponse<{ isFavorited: boolean }>> => {
    const res = await axiosInstance.get<
        ApiResponse<{ isFavorited: boolean }>
    >(`/favorites/check/${termId}`);
    return res.data;
};

export default {
    getFavorites,
    addFavorite,
    removeFavorite,
    checkFavorite,
};
