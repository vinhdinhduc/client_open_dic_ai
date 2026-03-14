import axiosInstance from '@/lib/axios';

export interface FeedbackData {
    name: string;
    email: string;
    type: string;
    subject?: string;
    message: string;
}

export interface ModeratorApplicationData {
    name: string;
    email: string;
    reason: string;
    experience: string;
}

class ContactService {
    private baseUrl = '/contact';

    async submitFeedback(data: FeedbackData) {
        const response = await axiosInstance.post(`${this.baseUrl}/feedback`, data);
        return response.data;
    }

    async submitModeratorApplication(data: ModeratorApplicationData) {
        const response = await axiosInstance.post(`${this.baseUrl}/moderator-application`, data);
        return response.data;
    }

    // Admin
    async getFeedbacks(params?: { status?: string; page?: number; limit?: number }) {
        const response = await axiosInstance.get(`${this.baseUrl}/feedback`, { params });
        return response.data;
    }

    async updateFeedbackStatus(id: string, data: { status: string; adminNote?: string }) {
        const response = await axiosInstance.put(`${this.baseUrl}/feedback/${id}`, data);
        return response.data;
    }

    async getModeratorApplications(params?: { status?: string; page?: number; limit?: number }) {
        const response = await axiosInstance.get(`${this.baseUrl}/moderator-applications`, { params });
        return response.data;
    }

    async reviewModeratorApplication(id: string, data: { status: string; adminNote?: string }) {
        const response = await axiosInstance.put(`${this.baseUrl}/moderator-applications/${id}`, data);
        return response.data;
    }
}

export const contactService = new ContactService();
export default contactService;
