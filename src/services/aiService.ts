import axiosInstance from '@/lib/axios';

/**
 * AI Response interface - cấu trúc khớp Term model
 */
export interface AIResponse {
    term: string;
    language: string;
    structured: boolean;
    // Structured fields (khi structured = true)
    definition?: string;
    detailedExplanation?: string;
    examples?: string[];
    partOfSpeech?: string;
    field?: string;
    relatedTerms?: string[];
    tags?: string[];
    // Fallback field (khi structured = false)
    response?: string;
    // Metadata
    timestamp: Date;
    model: string;
    provider?: string;
}

/**
 * AI Status interface
 */
export interface AIStatus {
    available: boolean;
    configured: boolean;
    model: string;
    provider?: string;
    message: string;
}

/**
 * AI Config interface
 */
export interface AIConfig {
    apiKey: string;
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    hasApiKey?: boolean;
    promptDefinition?: Record<string, string>;
    promptExplanation?: Record<string, string>;
    promptAnswer?: Record<string, string>;
}

/**
 * Update AI Config request
 */
export interface UpdateAIConfigRequest {
    apiKey?: string;
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    promptDefinition?: Record<string, string>;
    promptExplanation?: Record<string, string>;
    promptAnswer?: Record<string, string>;
}

/**
 * Test Connection response
 */
export interface TestConnectionResponse {
    success: boolean;
    configured: boolean;
    provider: string;
    model: string;
    message: string;
}

/**
 * Ask AI request payload
 */
export interface AskAIRequest {
    term: string;
    language?: string;
}

/**
 * AI Service
 */
class AIService {
    private baseUrl = '/ai';

    /**
     * Hỏi AI về thuật ngữ
     */
    async askAboutTerm(data: AskAIRequest): Promise<AIResponse> {
        try {
            const response = await axiosInstance.post(`${this.baseUrl}/ask`, data);
            return response.data.data;
        } catch (error: any) {
            console.error('Ask AI Error:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể kết nối với dịch vụ AI'
            );
        }
    }

    /**
     * Lấy lịch sử chat AI
     */
    async getChatHistory(limit: number = 10): Promise<any[]> {
        try {
            const response = await axiosInstance.get(`${this.baseUrl}/history`, {
                params: { limit }
            });
            return response.data.data.history;
        } catch (error: any) {
            console.error('Get Chat History Error:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể lấy lịch sử chat'
            );
        }
    }

    /**
     * Kiểm tra trạng thái dịch vụ AI
     */
    async getStatus(): Promise<AIStatus> {
        try {
            const response = await axiosInstance.get(`${this.baseUrl}/status`);
            return response.data.data;
        } catch (error: any) {
            console.error('Get AI Status Error:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể kiểm tra trạng thái AI'
            );
        }
    }

    // === Admin Methods ===

    /**
     * Lấy cấu hình AI hiện tại (Admin only)
     */
    async getConfig(): Promise<AIConfig> {
        try {
            const response = await axiosInstance.get(`${this.baseUrl}/config`);
            return response.data.data;
        } catch (error: any) {
            console.error('Get AI Config Error:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể lấy cấu hình AI'
            );
        }
    }

    /**
     * Cập nhật cấu hình AI (Admin only)
     */
    async updateConfig(data: UpdateAIConfigRequest): Promise<AIConfig> {
        try {
            const response = await axiosInstance.put(`${this.baseUrl}/config`, data);
            return response.data.data;
        } catch (error: any) {
            console.error('Update AI Config Error:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể cập nhật cấu hình AI'
            );
        }
    }

    /**
     * Test kết nối AI (Admin only)
     */
    async testConnection(): Promise<TestConnectionResponse> {
        try {
            const response = await axiosInstance.post(`${this.baseUrl}/test`);
            return response.data.data;
        } catch (error: any) {
            console.error('Test AI Connection Error:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể test kết nối AI'
            );
        }
    }
}

export const aiService = new AIService();
export default aiService;
