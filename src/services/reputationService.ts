import axiosInstance from '@/lib/axios';

// ==================== Interfaces ====================

export interface ReputationBreakdown {
    contribution: number;
    report: number;
    bonus: number;
    penalty: number;
}

export interface ReputationStreak {
    current: number;
    longest: number;
    multiplier: number;
}

export interface AIAccess {
    dailyQueries: number;
    features: string[];
}

export interface LevelInfo {
    min: number;
    max: number;
    name: string;
    aiQueries: number;
    features: string[];
}

export interface UserReputation {
    totalPoints: number;
    level: number;
    levelName: string;
    nextLevel: LevelInfo | null;
    pointsToNextLevel: number;
    breakdown: ReputationBreakdown;
    streak: ReputationStreak;
    aiAccess: AIAccess;
    badges: string[];
    isUtbStudent: boolean;
    reportAccuracy: number;
}

export interface ReputationHistoryItem {
    _id: string;
    user: string;
    action: string;
    points: number;
    category: string;
    description: string;
    relatedId?: string;
    relatedModel?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    user: {
        _id: string;
        fullName: string;
        avatar?: string;
        email: string;
    };
    totalPoints: number;
    level: number;
    levelName: string;
    badges: string[];
    currentStreak: number;
}

export interface RedemptionRequest {
    _id: string;
    user: string | { _id: string; fullName: string; email: string };
    type: 'training_points' | 'special_training';
    pointsUsed: number;
    trainingPointsGained: number;
    semester: string;
    // Thông tin sinh viên
    studentId?: string;
    studentClass?: string;
    faculty?: string;
    phone?: string;
    status: 'pending' | 'approved' | 'rejected';
    certificateNumber?: string;
    pdfPath?: string;
    reviewedBy?: string | { fullName: string };
    reviewNote?: string;
    reviewedAt?: string;
    createdAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

// ==================== API Calls ====================

const reputationService = {
    // Lấy điểm uy tín của user hiện tại
    getMyReputation: async (): Promise<UserReputation> => {
        const response = await axiosInstance.get('/reputation/me');
        return response.data.data;
    },

    // Lịch sử điểm
    getHistory: async (params?: { page?: number; limit?: number; category?: string }): Promise<{
        history: ReputationHistoryItem[];
        pagination: Pagination;
    }> => {
        const response = await axiosInstance.get('/reputation/history', { params });
        return response.data.data;
    },

    // Bảng xếp hạng
    getLeaderboard: async (params?: { page?: number; limit?: number }): Promise<{
        leaderboard: LeaderboardEntry[];
        pagination: Pagination;
    }> => {
        const response = await axiosInstance.get('/reputation/leaderboard', { params });
        return response.data.data;
    },

    // Kiểm tra quyền AI
    checkAIAccess: async (feature?: string): Promise<{
        allowed: boolean;
        level: number;
        levelName: string;
        dailyQueries: number;
        availableFeatures: string[];
    }> => {
        const response = await axiosInstance.get('/reputation/ai-access', {
            params: feature ? { feature } : undefined,
        });
        return response.data.data;
    },

    // Xác minh sinh viên ĐHTB
    verifyUtbStudent: async (): Promise<{ verified: boolean }> => {
        const response = await axiosInstance.post('/reputation/verify-utb');
        return response.data.data;
    },

    // Yêu cầu đổi điểm rèn luyện
    requestRedemption: async (data: {
        type: string;
        semester: string;
        studentId?: string;
        studentClass?: string;
        faculty?: string;
        phone?: string;
    }): Promise<RedemptionRequest> => {
        const response = await axiosInstance.post('/reputation/redeem', data);
        return response.data.data;
    },

    // Lịch sử đổi điểm
    getMyRedemptions: async (params?: { page?: number; limit?: number }): Promise<{
        requests: RedemptionRequest[];
        pagination: Pagination;
    }> => {
        const response = await axiosInstance.get('/reputation/redemptions', { params });
        return response.data.data;
    },

    // ===== Admin =====

    // Xem ĐUT của user cụ thể
    getUserReputation: async (userId: string): Promise<UserReputation> => {
        const response = await axiosInstance.get(`/reputation/users/${userId}`);
        return response.data.data;
    },

    // Điều chỉnh điểm
    adminAdjustPoints: async (data: { userId: string; points: number; description: string }): Promise<unknown> => {
        const response = await axiosInstance.post('/reputation/admin/adjust', data);
        return response.data.data;
    },

    // Danh sách yêu cầu đổi điểm
    getAllRedemptions: async (params?: { page?: number; limit?: number; status?: string }): Promise<{
        requests: RedemptionRequest[];
        pagination: Pagination;
    }> => {
        const response = await axiosInstance.get('/reputation/admin/redemptions', { params });
        return response.data.data;
    },

    // Duyệt/từ chối yêu cầu
    reviewRedemption: async (id: string, data: { status: 'approved' | 'rejected'; note?: string }): Promise<RedemptionRequest> => {
        const response = await axiosInstance.put(`/reputation/admin/redemptions/${id}`, data);
        return response.data.data;
    },

    // Tải PDF giấy xác nhận (đượng dùng cho user và admin)
    downloadCertificate: async (id: string, isAdmin = false): Promise<Blob> => {
        const url = isAdmin
            ? `/reputation/admin/redemptions/${id}/certificate`
            : `/reputation/redemptions/${id}/certificate`;
        const response = await axiosInstance.get(url, { responseType: 'blob' });
        return response.data;
    },
};

export default reputationService;
