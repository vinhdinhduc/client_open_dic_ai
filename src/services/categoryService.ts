import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { CategoryFormData } from "@/types/category.types";

// Re-export for backward compatibility
export type { CategoryFormData } from "@/types/category.types";

// Category interface cho service (với id thay vì _id từ API)
export interface Category {
    id: string;
    _id?: string; // For backward compatibility
    name: string | {
        vi: string;
        en?: string;
        lo?: string;
    };
    slug?: string;
    icon?: string;
    description?: string | {
        vi?: string;
        en?: string;
        lo?: string;
    };
    parentCategory?: string;
    order?: number;
    isActive?: boolean;
    termCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

// Lấy tất cả danh mục
const getCategories = async (includeInactive: boolean = false): Promise<ApiResponse<Category[]>> => {
    const res = await axiosInstance.get<ApiResponse<Category[]>>("/categories", {
        params: { includeInactive }
    });
    return res.data;
};

// Lấy chi tiết danh mục
const getCategoryById = async (id: string): Promise<ApiResponse<Category>> => {
    const res = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data;
};

// Tạo danh mục mới
const createCategory = async (data: CategoryFormData): Promise<ApiResponse<Category>> => {
    const res = await axiosInstance.post<ApiResponse<Category>>("/categories", data);
    return res.data;
};

// Cập nhật danh mục
const updateCategory = async (id: string, data: Partial<CategoryFormData>): Promise<ApiResponse<Category>> => {
    const res = await axiosInstance.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data;
};

// Xóa danh mục
const deleteCategory = async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosInstance.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
    return res.data;
};

const categoryService = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};

export default categoryService;
