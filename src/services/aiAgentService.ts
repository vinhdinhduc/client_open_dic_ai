import axiosInstance from '@/lib/axios';

/**
 * Action suggestion for AI Agent
 */
export interface ActionSuggestion {
    id: string;
    type: 'contribute' | 'search' | 'navigate' | 'learn' | 'read' | 'explore';
    title: string;
    description: string;
    icon: string;
    action: {
        type: 'redirect' | 'suggest_term' | 'ask_ai' | 'view_term' | 'explore_category' | 'suggest_edit';
        target?: string;
        params?: Record<string, any>;
    };
    priority: number;
    context?: Record<string, any>;
}

/**
 * AI Agent Context
 */
export interface AIAgentContext {
    currentPage: string;
    searchQuery?: string;
    selectedTerm?: {
        id: string;
        name: string;
        definition?: string;
        category?: string;
    };
    recentSearches?: string[];
    userReputationLevel?: number;
    viewedTerms?: string[];
    contributedTerms?: number;
    language: string;
}

/**
 * AI Agent suggestions request and response
 */
export interface GetSuggestionsRequest {
    context: AIAgentContext;
    maxSuggestions?: number;
}

export interface GetSuggestionsResponse {
    suggestions: ActionSuggestion[];
    message?: string;
    confidence?: number;
}

/**
 * AI Agent feedback
 */
export interface AgentFeedback {
    suggestionId: string;
    userAction: 'accepted' | 'dismissed' | 'clicked' | 'ignored';
    timestamp?: Date;
}

/**
 * AI Agent Service - Như Comet Browser Assistant
 */
class AIAgentService {
    private baseUrl = '/ai/agent';

    /**
     * Lấy đề xuất hành động tiếp theo từ AI Agent
     */
    async getSuggestions(
        context: AIAgentContext,
        maxSuggestions: number = 3
    ): Promise<ActionSuggestion[]> {
        try {
            const response = await axiosInstance.post(`${this.baseUrl}/suggestions`, {
                context,
                maxSuggestions,
            });
            return response.data.data.suggestions || [];
        } catch (error: any) {
            console.error('Get AI Suggestions Error:', error);
            // Return empty suggestions if error
            return [];
        }
    }

    /**
     * Gợi ý các hành động dựa trên kết quả tìm kiếm
     */
    async suggestNextActionsForSearch(
        query: string,
        resultsCount: number,
        language: string = 'vi'
    ): Promise<ActionSuggestion[]> {
        try {
            const response = await axiosInstance.post(
                `${this.baseUrl}/search-suggestions`,
                {
                    query,
                    resultsCount,
                    language,
                }
            );
            return response.data.data.suggestions || [];
        } catch (error: any) {
            console.error('Get Search Suggestions Error:', error);
            return [];
        }
    }

    /**
     * Gợi ý các thuật ngữ liên quan từ AI Agent
     */
    async suggestRelatedTerms(
        termId: string,
        language: string = 'vi'
    ): Promise<any[]> {
        try {
            const response = await axiosInstance.get(
                `${this.baseUrl}/related-terms/${termId}`,
                {
                    params: { language },
                }
            );
            return response.data.data.terms || [];
        } catch (error: any) {
            console.error('Get Related Terms Error:', error);
            return [];
        }
    }

    /**
     * Gợi ý danh mục để khám phá
     */
    async suggestCategories(
        language: string = 'vi',
        limit: number = 5
    ): Promise<any[]> {
        try {
            const response = await axiosInstance.get(
                `${this.baseUrl}/suggested-categories`,
                {
                    params: { language, limit },
                }
            );
            return response.data.data.categories || [];
        } catch (error: any) {
            console.error('Get Suggested Categories Error:', error);
            return [];
        }
    }

    /**
     * Nhận feedback từ người dùng về đề xuất
     */
    async provideFeedback(feedback: AgentFeedback): Promise<void> {
        try {
            await axiosInstance.post(`${this.baseUrl}/feedback`, feedback);
        } catch (error: any) {
            console.error('Provide Feedback Error:', error);
            // Don't throw - feedback is optional
        }
    }

    /**
     * Gợi ý hành động tiếp theo dựa trên trang hiện tại
     */
    async getContextualActions(
        context: AIAgentContext
    ): Promise<ActionSuggestion[]> {
        try {
            const response = await axiosInstance.post(
                `${this.baseUrl}/contextual-actions`,
                { context }
            );
            return response.data.data.actions || [];
        } catch (error: any) {
            console.error('Get Contextual Actions Error:', error);
            return [];
        }
    }

    /**
     * Gợi ý từ khóa tôi nên tìm kiếm
     */
    async suggestSearchKeywords(
        currentQuery: string,
        language: string = 'vi'
    ): Promise<string[]> {
        try {
            const response = await axiosInstance.post(
                `${this.baseUrl}/search-keywords`,
                {
                    currentQuery,
                    language,
                }
            );
            return response.data.data.keywords || [];
        } catch (error: any) {
            console.error('Get Search Keywords Error:', error);
            return [];
        }
    }

    /**
     * Nhận AI recommendation về việc có nên đóng góp thuật ngữ này hay không
     */
    async getContributionRecommendation(
        term: string,
        definition: string,
        language: string = 'vi'
    ): Promise<{
        recommended: boolean;
        reason: string;
        suggestions?: string[];
    }> {
        try {
            const response = await axiosInstance.post(
                `${this.baseUrl}/contribution-recommendation`,
                {
                    term,
                    definition,
                    language,
                }
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Get Contribution Recommendation Error:', error);
            return {
                recommended: true,
                reason: 'Undefined',
            };
        }
    }
}

export const aiAgentService = new AIAgentService();
export default aiAgentService;
