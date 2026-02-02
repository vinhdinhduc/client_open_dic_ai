

// Response chuẩn từ API
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Response có thể không có message (cho một số API cũ)
export interface ApiResponseOptionalMessage<T> {
    success: boolean;
    message?: string;
    data: T;
}

// Pagination info
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

// Response có pagination
export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationInfo;
}

// Error response từ API
export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}
