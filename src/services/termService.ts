import axiosInstance from "@/lib/axios";
import {
  ApiResponse,
  SearchTermsResponse,
  TermDetail,
  Comment,
  ReportData,
  SuggestEditData
} from "@/components/terms/types";


//Get search suggestions
const getSearchSuggestions = async (keyword: string, language: 'vi' | 'en' | 'lo' = 'vi'): Promise<string[]> => {
  try {
    const res = await axiosInstance.get<ApiResponse<{ suggestions: string[] }>>('/terms/suggestions', {
      params: {
        q: keyword,
        lang: language
      }
    });

    return res.data.data.suggestions || [];

  } catch (error) {
    console.error("Error fetching search suggestion:", error);
    return [];
  }

}

const searchTerms = async (query: string, language: string): Promise<SearchTermsResponse> => {
  try {
    const res = await axiosInstance.get<ApiResponse<SearchTermsResponse>>('/terms/search', {
      params: {
        q: query,
        language
      }
    });
    return res.data.data;
  } catch (error) {
    console.error("Error searching terms:", error);
    return { terms: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
  }
}

// Lấy chi tiết thuật ngữ
const getTermById = async (id: string): Promise<TermDetail | null> => {
  try {
    const res = await axiosInstance.get<ApiResponse<TermDetail>>(`/terms/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching term detail:", error);
    return null;
  }
}

// Lấy danh sách comment của thuật ngữ
const getTermComments = async (termId: string): Promise<Comment[]> => {
  try {
    const res = await axiosInstance.get<ApiResponse<{ comments: Comment[] }>>(`/comments/term/${termId}`);
    return res.data.data.comments || [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

// Tạo comment mới
const createComment = async (termId: string, content: string, parentCommentId?: string): Promise<Comment | null> => {
  try {
    const res = await axiosInstance.post<ApiResponse<Comment>>('/comments', {
      term: termId,
      content,
      parentComment: parentCommentId
    });
    return res.data.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

// Báo xấu thuật ngữ
const reportTerm = async (termId: string, data: ReportData): Promise<boolean> => {
  try {
    await axiosInstance.post<ApiResponse<null>>(`/terms/${termId}/report`, data);
    return true;
  } catch (error) {
    console.error("Error reporting term:", error);
    throw error;
  }
}

// Gợi ý sửa thuật ngữ (tạo contribution)
const suggestEdit = async (data: SuggestEditData): Promise<boolean> => {
  try {
    await axiosInstance.post<ApiResponse<null>>('/contributions', data);
    return true;
  } catch (error) {
    console.error("Error suggesting edit:", error);
    throw error;
  }
}

// Toggle favorite
const toggleFavorite = async (termId: string): Promise<{ isFavorited: boolean }> => {
  try {
    const res = await axiosInstance.post<ApiResponse<{ isFavorited: boolean }>>(`/favorites/toggle`, {
      term: termId
    });
    return res.data.data;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}

// Kiểm tra đã favorite chưa
const checkFavorite = async (termId: string): Promise<boolean> => {
  try {
    const res = await axiosInstance.get<ApiResponse<{ isFavorited: boolean }>>(`/favorites/check/${termId}`);
    return res.data.data.isFavorited;
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
}

export {
  getSearchSuggestions,
  searchTerms,
  getTermById,
  getTermComments,
  createComment,
  reportTerm,
  suggestEdit,
  toggleFavorite,
  checkFavorite
};