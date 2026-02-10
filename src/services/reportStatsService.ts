import axiosInstance from "@/lib/axios";

export interface SystemOverview {
    totalUsers: number;
    totalTerms: number;
    totalContributions: number;
    totalComments: number;
    totalCategories: number;
    totalReports: number;
    activeUsers: number;
    pendingContributions: number;
    approvedTerms: number;
    pendingTerms: number;
}

export interface TimeSeriesData {
    date: string;
    approved?: number;
    pending?: number;
    rejected?: number;
    total?: number;
    count?: number;
}

export interface CategoryData {
    _id: string;
    name: string;
    count: number;
}

export interface TopContributor {
    _id: string;
    fullName: string;
    email: string;
    count: number;
}

export interface TopViewedTerm {
    _id: string;
    term: {
        vi: string;
        en?: string;
        lo?: string;
    };
    viewCount: number;
    favoriteCount: number;
    commentCount: number;
    category?: {
        name: { vi: string };
    };
}

export interface UserByRole {
    role: string;
    count: number;
}

export interface RecentActivity {
    type: string;
    title: string;
    user: string;
    status?: string;
    role?: string;
    date: string;
}

export interface FullReport {
    overview: SystemOverview;
    termsOverTime: TimeSeriesData[];
    usersOverTime: TimeSeriesData[];
    termsByCategory: CategoryData[];
    contributionsOverTime: TimeSeriesData[];
    topContributors: TopContributor[];
    topViewedTerms: TopViewedTerm[];
    usersByRole: UserByRole[];
    recentActivity: RecentActivity[];
}

const reportStatsService = {
    getSystemOverview: async (): Promise<SystemOverview> => {
        const res = await axiosInstance.get("/report-stats/overview");
        return res.data.data;
    },

    getTermsOverTime: async (
        period = "month",
        months = 12
    ): Promise<TimeSeriesData[]> => {
        const res = await axiosInstance.get("/report-stats/terms-over-time", {
            params: { period, months },
        });
        return res.data.data;
    },

    getUsersOverTime: async (months = 12): Promise<TimeSeriesData[]> => {
        const res = await axiosInstance.get("/report-stats/users-over-time", {
            params: { months },
        });
        return res.data.data;
    },

    getTermsByCategory: async (): Promise<CategoryData[]> => {
        const res = await axiosInstance.get("/report-stats/terms-by-category");
        return res.data.data;
    },

    getContributionsOverTime: async (
        months = 12
    ): Promise<TimeSeriesData[]> => {
        const res = await axiosInstance.get(
            "/report-stats/contributions-over-time",
            { params: { months } }
        );
        return res.data.data;
    },

    getTopContributors: async (limit = 10): Promise<TopContributor[]> => {
        const res = await axiosInstance.get("/report-stats/top-contributors", {
            params: { limit },
        });
        return res.data.data;
    },

    getTopViewedTerms: async (limit = 10): Promise<TopViewedTerm[]> => {
        const res = await axiosInstance.get("/report-stats/top-viewed-terms", {
            params: { limit },
        });
        return res.data.data;
    },

    getUsersByRole: async (): Promise<UserByRole[]> => {
        const res = await axiosInstance.get("/report-stats/users-by-role");
        return res.data.data;
    },

    getFullReport: async (
        period = "month",
        months = 12
    ): Promise<FullReport> => {
        const res = await axiosInstance.get("/report-stats/full", {
            params: { period, months },
        });
        return res.data.data;
    },
};

export default reportStatsService;
