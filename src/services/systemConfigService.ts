import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";

export interface SystemConfig {
    _id: string;
    key: string;
    value: any;
    description?: string;
    category: "general" | "email" | "ai" | "moderation" | "security";
    isActive: boolean;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EmailConfig {
    email_service: string;
    email_host: string;
    email_port: number;
    email_secure: boolean;
    email_user: string;
    email_password: string;
    email_from: string;
    email_from_name: string;
}

export interface RateLimitConfig {
    rate_limit_enabled: boolean;
    rate_limit_window_ms: number;
    rate_limit_max_requests: number;
    rate_limit_api_window_ms: number;
    rate_limit_api_max_requests: number;
    rate_limit_login_window_ms: number;
    rate_limit_login_max_attempts: number;
    rate_limit_ai_window_ms: number;
    rate_limit_ai_max_requests: number;
}

class SystemConfigService {
    /**
     * Lấy danh sách cấu hình theo category
     */
    async getConfigsByCategory(category: string): Promise<ApiResponse<SystemConfig[]>> {
        const response = await axiosInstance.get<ApiResponse<SystemConfig[]>>(
            `/system-config`,
            { params: { category } }
        );
        return response.data;
    }

    /**
     * Lấy cấu hình email
     */
    async getEmailConfig(): Promise<ApiResponse<SystemConfig[]>> {
        const response = await axiosInstance.get<ApiResponse<SystemConfig[]>>(
            `/users/email-config`
        );
        return response.data;
    }

    async getEmailTemplates() {
        const response = await axiosInstance.get("/users/email-templates");
        return response.data;
    }
    async resetEmailTemplate(key: string) {
        const response = await axiosInstance.delete(`/users/email-templates/${key}`);
        return response.data;
    }

    async updateEmailTemplate(
        key: string,
        data: {
            subject?: string;
            title?: string;
            accentColor?: string;
            intro?: string;
            ctaLabel?: string;
            warningHtml?: string;
        }
    ) {
        const response = await axiosInstance.put(`/users/email-templates/${key}`, data);
        return response.data;
    }
    /**
     * Cập nhật hoặc tạo mới cấu hình email
     * Sử dụng bulk endpoint với upsert để tự động tạo mới nếu chưa có
     */
    async updateEmailConfig(config: Partial<EmailConfig>): Promise<ApiResponse<SystemConfig[]>> {
        const response = await axiosInstance.put<ApiResponse<SystemConfig[]>>(
            `/system-config/bulk`,
            {
                category: "email",
                configs: config
            }
        );
        return response.data;
    }

    /**
     * Test cấu hình email
     */
    async testEmailConfig(testEmail?: string): Promise<ApiResponse<any>> {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/users/test-email`,
            { testEmail }
        );
        return response.data;
    }

    /**
     * Lấy cấu hình rate limit
     */
    async getRateLimitConfig(): Promise<ApiResponse<SystemConfig[]>> {
        return this.getConfigsByCategory("security");
    }

    /**
     * Cập nhật cấu hình rate limit
     */
    async updateRateLimitConfig(config: Partial<RateLimitConfig>): Promise<ApiResponse<SystemConfig[]>> {
        const response = await axiosInstance.put<ApiResponse<SystemConfig[]>>(
            `/system-config/bulk`,
            { category: "security", configs: config }
        );
        return response.data;
    }

    /**
     * Lấy một config theo key
     */
    async getConfigByKey(key: string): Promise<ApiResponse<SystemConfig>> {
        const response = await axiosInstance.get<ApiResponse<SystemConfig>>(
            `/system-config/${key}`
        );
        return response.data;
    }

    /**
     * Cập nhật một config theo key
     */
    async updateConfigByKey(key: string, value: any): Promise<ApiResponse<SystemConfig>> {
        const response = await axiosInstance.put<ApiResponse<SystemConfig>>(
            `/system-config/${key}`,
            { value }
        );
        return response.data;
    }
}

export const systemConfigService = new SystemConfigService();
export default systemConfigService;
