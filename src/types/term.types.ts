

import { BaseEntity } from "./common.types";
import { CategoryRef } from "./category.types";
import { UserRef } from "./user.types";

// Multi-language text
export interface MultiLangText {
    vi?: string;
    en?: string;
    lo?: string;
}

// Term status
export type TermStatus = "pending" | "approved" | "rejected";

// Part of speech
export type PartOfSpeech =
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "phrase"
    | "abbreviation";

// Example interface
export interface Example {
    vi?: string;
    en?: string;
    lo?: string;
}

// Related term
export interface RelatedTerm {
    _id: string;
    term: MultiLangText;
    definition?: MultiLangText;
}

// Dữ liệu thẻ thuật ngữ (để hiển thị danh sách)
export interface TermCard {
    _id: string;
    term: MultiLangText;
    definition: MultiLangText;
    category: CategoryRef | null;
    createdBy: UserRef | null;
    viewCount: number;
    favoriteCount: number;
    commentCount?: number;
    status: TermStatus;
    createdAt?: string;
    updatedAt?: string;
}

// Full Term Detail
export interface Term extends BaseEntity {
    term: MultiLangText;
    definition: MultiLangText;
    detailedExplanation?: MultiLangText;
    examples?: Example[];
    partOfSpeech?: PartOfSpeech;
    category: CategoryRef | null;
    relatedTerms?: RelatedTerm[];
    tags?: string[];
    status: TermStatus;
    viewCount: number;
    favoriteCount: number;
    commentCount: number;
    createdBy: UserRef | null;
    lastModifiedBy?: UserRef | null;
}

// Dữ liệu form thuật ngữ cho tạo/cập nhật
export interface TermFormData {
    term: MultiLangText;
    definition: MultiLangText;
    detailedExplanation?: MultiLangText;
    examples?: Example[];
    partOfSpeech?: PartOfSpeech;
    category: string;
    relatedTerms?: string[];
    tags?: string[];
}

// API Parameters
export interface GetTermsParams {
    page?: number;
    limit?: number;
    category?: string;
    status?: TermStatus;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    language?: string;
}

// Phản hồi thuật ngữ phân trang
export interface PaginatedTerms {
    terms: Term[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
