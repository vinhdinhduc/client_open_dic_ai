
// Supported languages
export type Language = "vi" | "en" | "lo";

// Sort order
export type SortOrder = "asc" | "desc";

// Status chung
export type Status = "active" | "inactive" | "pending";

// Base entity với timestamps
export interface BaseEntity {
    _id: string;
    createdAt: string;
    updatedAt: string;
}

// Select option cho dropdown
export interface SelectOption<T = string> {
    value: T;
    label: string;
    disabled?: boolean;
}
