// components/term/TermCard/types.ts

export interface TermCardData {
  _id: string;
  term: {
    vi?: string;
    en?: string;
    lo?: string;
  };
  definitions: Array<{
    _id: string;
    language: string;
    content: string;
    level: 'basic' | 'intermediate' | 'advanced';
    source: 'manual' | 'ai' | 'contribution' | 'import';
  }>;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  metadata: {
    views: number;
    favorites: number;
    searchCount: number;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TermCardProps {
  term: TermCardData;
  onFavoriteToggle?: (termId: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
  showCategory?: boolean;
  showMetadata?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}