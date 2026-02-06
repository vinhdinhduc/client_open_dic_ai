import axiosInstance from "@/lib/axios";
import {
  ApiResponse,
  SearchTermsResponse,
  TermDetail,
  Comment,
  ReportData,
  SuggestEditData,
  GetTermsResponse,
  GetTermsAdminResponse
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
const getAllTerms = async (
  category: string,
  status: string,
  page: number,
  limit: number,
  search?: string
): Promise<ApiResponse<GetTermsResponse>> => {
  try {
    const params: Record<string, string | number> = {
      page,
      limit
    };

    if (category && category !== 'all') {
      params.category = category;
    }
    if (status && status !== 'all') {
      params.status = status;
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }

    const res = await axiosInstance.get<ApiResponse<GetTermsResponse>>('/terms', {
      params
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching all terms:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi tải danh sách thuật ngữ",
      data: { terms: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
    };
  }
}


const getTermStats = async (): Promise<ApiResponse<{ stats: { total: number; approved: number; pending: number; rejected: number } }>> => {
  try {
    const res = await axiosInstance.get<ApiResponse<{ stats: { total: number; approved: number; pending: number; rejected: number } }>>('/terms/stats');
    return res.data;
  } catch (error) {
    console.error("Error fetching term stats:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi tải thống kê",
      data: {
        stats: { total: 0, approved: 0, pending: 0, rejected: 0 }
      }
    };
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
const reportTerm = async (termId: string, data: ReportData): Promise<ApiResponse<null>> => {
  try {
    const res = await axiosInstance.post<ApiResponse<null>>(`/reports/`, {
      targetId: termId,
      ...data
    });
    return res.data;
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

// Tạo thuật ngữ mới
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
  status?: 'pending' | 'approved' | 'rejected';
}

const createTerm = async (data: CreateTermData): Promise<ApiResponse<TermDetail>> => {
  try {
    const res = await axiosInstance.post<ApiResponse<TermDetail>>('/terms', data);
    return res.data;
  } catch (error) {
    console.error("Error creating term:", error);
    throw error;
  }
}

// Cập nhật thuật ngữ
const updateTerm = async (id: string, data: Partial<CreateTermData>): Promise<ApiResponse<TermDetail>> => {
  try {
    const res = await axiosInstance.put<ApiResponse<TermDetail>>(`/terms/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating term:", error);
    throw error;
  }
}

// Xóa thuật ngữ
const deleteTerm = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const res = await axiosInstance.delete<ApiResponse<null>>(`/terms/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting term:", error);
    throw error;
  }
}

// Export options interface
export interface ExportTermsOptions {
  category?: string;
  status?: string;
  search?: string;
  language?: 'all' | 'vi' | 'en' | 'lo';
}

// Xuất danh sách thuật ngữ ra Excel
const exportTermsToExcel = async (options: ExportTermsOptions = {}): Promise<void> => {
  try {
    const params = new URLSearchParams();
    if (options.category && options.category !== 'all') {
      params.append('category', options.category);
    }
    if (options.status && options.status !== 'all') {
      params.append('status', options.status);
    }
    if (options.search) {
      params.append('search', options.search);
    }
    if (options.language) {
      params.append('language', options.language);
    }

    const response = await axiosInstance.get('/terms/export', {
      params,
      responseType: 'blob',
    });

    // Get filename from header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'thuat-ngu.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
      }
    }

    // Create blob and download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting terms:", error);
    throw error;
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
  checkFavorite,
  getAllTerms,
  getTermStats,
  createTerm,
  updateTerm,
  deleteTerm,
  exportTermsToExcel
};