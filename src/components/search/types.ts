export interface SearchBarProps {
    onSearch?: (keyword: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    className?: string;
}

export interface SearchSuggestion {
    _id: string;
    term: {
        en?: string;
        vi?: string;
        lo?: string;
    };
    category: string;
    categoryName?: string;
} 