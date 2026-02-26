

export interface MultiLangText {
  vi?: string;
  en?: string;
  lo?: string;
}

export interface Category {
  _id: string;
  name: MultiLangText;
  slug: string;
  description?: MultiLangText;
  icon?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email?: string;
}

export interface Example {
  vi?: string;
  en?: string;
  lo?: string;
}

export interface TermCardData {
  _id: string;
  term: MultiLangText;
  definition: MultiLangText;
  category: Category | null;
  createdBy: User | null;
  viewCount: number;
  favoriteCount?: number;
  favoritesCount?: number; // Alias for backward compatibility
  commentCount?: number;
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
  relatedTerms?: RelatedTerm[];
}

// Chi tiết thuật ngữ đầy đủ
export interface TermDetail extends TermCardData {
  detailedExplanation?: MultiLangText;
  examples?: Example[];
  partOfSpeech?: string;
  relatedTerms?: RelatedTerm[];
  tags?: string[];
  commentCount?: number;
  lastModifiedBy?: User | null;
}

export interface RelatedTerm {
  _id: string;
  term: MultiLangText;
  definition: MultiLangText;
}

// Comment types
export interface Comment {
  _id: string;
  term: string;
  author: User;
  content: string;
  parentComment?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

// Report types
export interface ReportData {
  reason: 'incorrect' | 'spam' | 'inappropriate' | 'duplicate' | 'other';
  description?: string;
}

// Contribution/Suggest Edit types
export interface SuggestEditData {
  type: 'edit_term';
  targetTerm: string;
  term: MultiLangText;
  definition: MultiLangText;
  detailedExplanation?: MultiLangText;
  examples?: Example[];
  partOfSpeech?: string;
  tags?: string[];
  category: string;
  contributorNote?: string;
}

// Response types cho API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SearchTermsResponse {
  terms: TermCardData[];
  pagination: PaginationInfo;

}
export interface GetTermsResponse {
  terms: TermCardData[];
  pagination: PaginationInfo;
}

// Stats cho admin
export interface TermStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface GetTermsAdminResponse {
  terms: TermCardData[];
  pagination: PaginationInfo;

}

export interface TermCardProps {
  term: TermCardData;
  language?: 'vi' | 'en' | 'lo';
  onFavoriteToggle?: (termId: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
  showCategory?: boolean;
  showMetadata?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}