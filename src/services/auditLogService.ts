import { apiClient } from "@/lib/axios";

interface GetAuditLogsParams {
    date?: string; // YYYY-MM-DD
    action?: string;
    actorEmail?: string;
    page?: number;
    limit?: number;
}

interface AuditLog {
    _id: string;
    action: string;
    actor: {
        _id: string;
        email: string;
        fullName?: string;
        role?: string;
    };
    resourceType: string;
    resourceId?: string;
    resourceName?: string;
    changes?: {
        before: Record<string, any>;
        after: Record<string, any>;
    };
    reason?: string;
    status: "success" | "failed";
    errorMessage?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt?: string;
}

interface GetAuditLogsResponse {
    success: boolean;
    message: string;
    data: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: AuditLog[];
    };
}

const auditLogService = {
    /**
     * Get audit logs with filters and pagination
     */
    getAuditLogs: async (
        params: GetAuditLogsParams
    ): Promise<GetAuditLogsResponse> => {
        const queryParams = new URLSearchParams();

        if (params.date) queryParams.append("date", params.date);
        if (params.action) queryParams.append("action", params.action);
        if (params.actorEmail) queryParams.append("actorEmail", params.actorEmail);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const response = await apiClient.get(
            `/admin/audit-logs?${queryParams.toString()}`
        );
        return response.data;
    },

    /**
     * Export audit logs as CSV
     */
    exportAuditLogs: async (params: Partial<GetAuditLogsParams>) => {
        const queryParams = new URLSearchParams();

        if (params.date) queryParams.append("date", params.date);
        if (params.action) queryParams.append("action", params.action);
        if (params.actorEmail) queryParams.append("actorEmail", params.actorEmail);

        try {
            const response = await apiClient.post(
                `/admin/audit-logs/export?${queryParams.toString()}`,
                {},
                {
                    responseType: "blob",
                }
            );

            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `audit-logs-${params.date || "all"}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting audit logs:", error);
            throw error;
        }
    },
};

export default auditLogService;
