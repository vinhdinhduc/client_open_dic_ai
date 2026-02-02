export interface MultiLangText {
    vi?: string;
    en?: string;
    lo?: string;
}

export interface Example {
    vi?: string;
    en?: string;
    lo?: string;
}

export type LangKey = "vi" | "en" | "lo";

export interface Category {
    id: string;
    _id?: string;
    name: string;
    slug?: string;
    icon?: string;
    description?: string;
    termCount?: number;
}

export interface CreateTermData {
    term: {
        vi: string;
        en?: string;
        lo?: string;
    };
    definition: {
        vi: string;
        en?: string;
        lo?: string;
    };
    detailedExplanation?: {
        vi?: string;
        en?: string;
        lo?: string;
    };
    examples?: Array<{
        vi?: string;
        en?: string;
        lo?: string;
    }>;
    partOfSpeech?: string;
    category: string;
    tags?: string[];
    status?: "pending" | "approved" | "rejected";
}
