import { ReportData } from "@/components/terms/types";
import axiosInstance from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api.types";
import { PaginatedResponseReport } from "@/types/report.types";

export interface Report {
    _id: string;
    type: "term";
    targetTerm: {
        _id: string;
        term: Record<string, string>;
        slug: string;
    };
    category: {
        _id: string;
        name: Record<string, string>;
    };
    reason: string;
    description?: string;
    reporter: {
        _id: string;
        fullName: string;
        email: string;
        avatar?: string;
    };
    status: "pending" | "resolved" | "rejected";
    isDeleted?: boolean;
    deletedAt?: string | null;
    deletedBy?: string | null;
    moderator?: {
        _id: string;
        fullName: string;
    };
    moderatorNote?: string;
    actionTaken?: "none" | "warning" | "edit" | "delete" | "ban_user";
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReportStats {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
}

export interface CreateReportData {
    targetId: string;
    reason: string;
    description?: string;
}

export interface ResolveReportData {
    status: "resolved" | "rejected";
    actionTaken?: "none" | "warning" | "edit" | "delete" | "ban_user";
    moderatorNote?: string;
}

export interface GetReportsParams {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    includeDeleted?: boolean;
    onlyDeleted?: boolean;
}


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
/**
 * Lấy danh sách báo cáo (cho moderator/admin)
 */
const getReports = async (
    params: GetReportsParams = {}
): Promise<ApiResponse<PaginatedResponseReport<Report>>> => {
    const response = await axiosInstance.get<
        ApiResponse<PaginatedResponseReport<Report>>
    >("/reports", { params });
    return response.data;
}

/**
 * Lấy chi tiết báo cáo
 */
const getReportById = async (id: string): Promise<ApiResponse<Report>> => {
    const response = await axiosInstance.get<ApiResponse<Report>>(
        `/reports/${id}`
    );
    return response.data;
}

/**
 * Xử lý báo cáo (resolve/dismiss)
 */
const resolveReport = async (
    id: string,
    data: ResolveReportData
): Promise<ApiResponse<Report>> => {
    const response = await axiosInstance.put<ApiResponse<Report>>(
        `/reports/${id}/resolve`,
        data
    );
    return response.data;
}

/**
 * Lấy thống kê báo cáo
 */
const getReportStats = async (): Promise<ApiResponse<ReportStats>> => {
    const response = await axiosInstance.get<ApiResponse<ReportStats>>(
        "/reports/stats"
    );
    return response.data;
}

const deleteReport = async (id: string): Promise<ApiResponse<Report>> => {
    const response = await axiosInstance.delete<ApiResponse<Report>>(`/reports/${id}`);
    return response.data;
}

const restoreReport = async (id: string): Promise<ApiResponse<Report>> => {
    const response = await axiosInstance.put<ApiResponse<Report>>(`/reports/${id}/restore`);
    return response.data;
}

const emptyReportTrash = async (): Promise<ApiResponse<{ deletedCount: number }>> => {
    const response = await axiosInstance.delete<ApiResponse<{ deletedCount: number }>>(`/reports/trash/empty`);
    return response.data;
}



export { reportTerm, getReports, getReportById, resolveReport, getReportStats, deleteReport, restoreReport, emptyReportTrash };