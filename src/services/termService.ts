import axiosInstance from "@/lib/axios";
import { SearchSuggestion } from "@/components/search/types";
export interface Term {
  _id: string;
  categoryId: string;
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
  metadata: {
    views: number;
    favorites: number;
    searchCount: number;
  };
}

export interface SearchResponse {
  terms: Term[];
  total: number;
  page: number;
  limit: number;
}


//Get search suggestions
const getSearchSuggestions = async (keyword: string, language: string): Promise<SearchSuggestion[]> => {
  try {
    const res = await axiosInstance.get('/terms/suggestions', {
      params: {
        q: keyword,
        lang: language
      }
    });
    return res.data;

  } catch (error) {
    console.error("Error fetching search suggestion:", error);
    return [];
  }

}

const searchTerms = async (query: string): Promise<SearchResponse> => {
  try {
    const res = await axiosInstance.get('/terms/search', {
      params: {
        q: query,
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error searching terms:", error);
    return { terms: [], total: 0, page: 1, limit: 10 };
  }
}

export { getSearchSuggestions, searchTerms };