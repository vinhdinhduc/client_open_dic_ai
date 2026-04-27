
import { BaseEntity } from "./common.types";
import { UserRef } from "./user.types";
import { PaginationInfo } from "./api.types";

// Lý do báo xấu
export type ReportReason =
    | "incorrect"
    | "spam"
    | "inappropriate"
    | "duplicate"
    | "other";

// Trạng thái báo xấu
export type ReportStatus = "pending" | "resolved" | "rejected";

// Report interface (chỉ hỗ trợ báo xấu thuật ngữ)
export interface Report extends BaseEntity {
    type: "term";
    targetTerm: string;
    category: string;
    reporter: UserRef;
    reason: ReportReason;
    description?: string;
    status: ReportStatus;
    moderator?: UserRef;
    moderatorNote?: string;
    actionTaken?: "none" | "warning" | "edit" | "delete" | "ban_user";
    resolvedAt?: string;
}

// Dữ liệu tạo báo cáo (chỉ cần targetId, reason, description)
export interface CreateReportData {
    targetId: string;
    reason: ReportReason;
    description?: string;
}

// Dữ liệu báo cáo rút gọn (cho trang chi tiết thuật ngữ)
export interface ReportTermData {
    reason: ReportReason;
    description?: string;
}

// Dữ liệu xử lý báo xấu
export interface ResolveReportData {
    status: "resolved" | "rejected";
    actionTaken?: "none" | "warning" | "edit" | "delete" | "ban_user";
    moderatorNote?: string;
}

// API Parameters
export interface GetReportsParams {
    status?: ReportStatus;
    category?: string;
    page?: number;
    limit?: number;
}
export interface PaginatedResponseReport<T> {
    reports: T[];
    pagination: PaginationInfo;
}
