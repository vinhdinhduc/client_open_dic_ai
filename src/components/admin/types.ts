

// Base Settings Component Props
export interface BaseSettingsProps {
    className?: string;
}

// Loading State
export interface LoadingState {
    isLoading: boolean;
    message?: string;
}

// Kết quả kiểm tra
export interface TestResult {
    success: boolean;
    message: string;
    data?: any;
}

// AI Settings Types
export interface AISettingsFormData {
    apiKey: string;
    provider: "gemini" | "openai";
    model: string;
    maxTokens: number;
    temperature?: number;
}

export interface AIConfig extends AISettingsFormData {
    hasApiKey?: boolean;
    configured?: boolean;
}

// Email Settings Types
export interface EmailSettingsFormData {
    email_service: "gmail" | "outlook" | "smtp";
    email_host: string;
    email_port: number;
    email_secure: boolean;
    email_user: string;
    email_password: string;
    email_from: string;
    email_from_name: string;
}

export interface EmailConfig {
    key: string;
    value: any;
}

// Rate Limit Settings Types
export interface RateLimitSettingsFormData {
    rate_limit_enabled: boolean;
    rate_limit_window_ms: number;
    rate_limit_max_requests: number;
    rate_limit_api_window_ms: number;
    rate_limit_api_max_requests: number;
    rate_limit_login_window_ms: number;
    rate_limit_login_max_attempts: number;
}

export interface RateLimitConfig {
    key: string;
    value: any;
}

// Settings Section Props
export interface SettingsSectionProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

// Thuộc tính Form Group
export interface FormGroupProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    helpText?: string;
    error?: string;
    badge?: string;
    children: React.ReactNode;
}

// Các kiểu phản hồi API
export interface SettingsAPIResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// Settings Status
export type SettingsStatus = "idle" | "loading" | "saving" | "testing" | "error" | "success";

// Provider Types
export type AIProvider = "gemini" | "openai";
export type EmailProvider = "gmail" | "outlook" | "smtp";

// Nhóm cài đặt
export type SettingsCategory = "ai" | "email" | "rate-limit" | "general" | "security";

// Settings Action Types
export type SettingsAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_SAVING"; payload: boolean }
    | { type: "SET_TESTING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_SUCCESS"; payload: string | null }
    | { type: "SET_DATA"; payload: any }
    | { type: "RESET" };

// Settings State
export interface SettingsState<T = any> {
    data: T;
    status: SettingsStatus;
    error: string | null;
    success: string | null;
}

// Tùy chọn định dạng thời gian
export interface TimeFormatOptions {
    showSeconds?: boolean;
    showMilliseconds?: boolean;
    compact?: boolean;
}

// Validation Result
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// Settings Events
export interface SettingsEvents {
    onSave?: (data: any) => void | Promise<void>;
    onTest?: () => void | Promise<void>;
    onReset?: () => void | Promise<void>;
    onChange?: (field: string, value: any) => void;
    onError?: (error: string) => void;
    onSuccess?: (message: string) => void;
}
