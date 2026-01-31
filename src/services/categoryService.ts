import axiosInstance from "@/lib/axios";

export interface Category {
    id: string;
    _id?: string; // For backward compatibility
    name: string;
    slug?: string;
    icon?: string;
    description?: string;
    termCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Lấy tất cả danh mục
const getCategories = async (): Promise<Category[]> => {
    try {
        const res = await axiosInstance.get<ApiResponse<Category[]>>("/categories");
        console.log("ckeck", res);

        return res.data.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

// Lấy chi tiết danh mục
const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
        const res = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`);
        return res.data.data;
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
    }
};

const categoryService = {
    getCategories,
    getCategoryById,
};

export default categoryService;
