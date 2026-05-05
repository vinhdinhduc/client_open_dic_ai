import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";

export type LeaderboardPeriod = "all_time" | "monthly" | "quarterly" | "yearly";
export type TermLeaderboardType = "most_favorited" | "most_viewed";
export type UserLeaderboardType = "most_liked" | "most_attractive";

export interface LeaderboardTerm {
    rank: number;
    _id: string;
    term: { vi?: string; en?: string; lo?: string };
    definition?: { vi?: string; en?: string; lo?: string };
    partOfSpeech?: string;
    category?: { _id: string; name: { vi: string; en?: string; lo?: string } };
    viewCount: number;
    favoriteCount: number;
    periodFavoriteCount?: number;
    createdBy?: { _id: string; fullName: string; avatar?: string };
}

export interface LeaderboardUser {
    rank: number;
    _id?: string;
    user?: { _id: string; fullName: string; avatar?: string; contributionCount?: number };
    fullName?: string;
    avatar?: string;
    contributionCount?: number;
    profileViewCount?: number;
    totalFavorites?: number;
    termCount?: number;
}

export interface PublicProfileData {
    user: {
        _id: string;
        fullName: string;
        avatar?: string;
        role: string;
        contributionCount: number;
        profileViewCount: number;
        joinedAt: string;
    };
    stats: {
        approvedTermCount: number;
        approvedContributionCount: number;
        totalContributions: number;
    };
    recentTerms: Array<{
        _id: string;
        term: { vi?: string; en?: string; lo?: string };
        definition?: { vi?: string; en?: string; lo?: string };
        viewCount: number;
        favoriteCount: number;
        createdAt: string;
    }>;
    reputation: {
        totalPoints: number;
        level: number;
        badges: string[];
        currentStreak: number;
    } | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

const leaderboardService = {
    getTermsLeaderboard: async (
        type: TermLeaderboardType = "most_viewed",
        period: LeaderboardPeriod = "all_time",
        page = 1,
        limit = 10,
    ): Promise<ApiResponse<{ terms: LeaderboardTerm[]; pagination: Pagination }>> => {
        const res = await axiosInstance.get("/leaderboard/terms", {
            params: { type, period, page, limit },
        });
        return res.data;
    },

    getUsersLeaderboard: async (
        type: UserLeaderboardType = "most_liked",
        page = 1,
        limit = 10,
        from?: string,
        to?: string,
    ): Promise<ApiResponse<{ users: LeaderboardUser[]; pagination: Pagination }>> => {
        const params: any = { type, page, limit };
        if (from) params.from = from;
        if (to) params.to = to;
        const res = await axiosInstance.get("/leaderboard/users", {
            params,
        });
        return res.data;
    },

    getReputationLeaderboard: async (
        page = 1,
        limit = 10,
    ): Promise<ApiResponse<{ leaderboard: any[]; pagination: Pagination }>> => {
        const res = await axiosInstance.get("/reputation/leaderboard", {
            params: { page, limit },
        });
        return res.data;
    },

    getPublicProfile: async (
        userId: string,
    ): Promise<ApiResponse<PublicProfileData>> => {
        const res = await axiosInstance.get(`/leaderboard/public-profile/${userId}`);
        return res.data;
    },
};

export default leaderboardService;
