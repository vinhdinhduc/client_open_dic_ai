

import { BaseEntity } from "./common.types";
import { UserRef } from "./user.types";

// Report reason
export type ReportReason =
    | "incorrect"
    | "spam"
    | "inappropriate"
    | "duplicate"
    | "other";

// Report status
export type ReportStatus = "pending" | "resolved" | "dismissed";

// Report target type
export type ReportTargetType = "term" | "comment" | "user";

// Report interface
export interface Report extends BaseEntity {
    targetType: ReportTargetType;
    targetId: string;
    reporter: UserRef;
    reason: ReportReason;
    description?: string;
    status: ReportStatus;
    resolvedBy?: UserRef;
    resolvedAt?: string;
    resolveNote?: string;
}

// Create report data
export interface CreateReportData {
    targetType: ReportTargetType;
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
    status: "resolved" | "dismissed";
    resolveNote?: string;
}

// API Parameters
export interface GetReportsParams {
    targetType?: ReportTargetType;
    status?: ReportStatus;
    reason?: ReportReason;
    page?: number;
    limit?: number;
}
