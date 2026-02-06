
import { BaseEntity } from "./common.types";
import { UserRef } from "./user.types";
import { PaginationInfo } from "./api.types";

// Report reason
export type ReportReason =
    | "incorrect"
    | "spam"
    | "inappropriate"
    | "duplicate"
    | "other";

// Report status
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

// Create report data (chỉ cần targetId, reason, description)
export interface CreateReportData {
    targetId: string;
    reason: ReportReason;
    description?: string;
}

// Simplified report data (for term detail page)
export interface ReportTermData {
    reason: ReportReason;
    description?: string;
}

// Resolve report data
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
