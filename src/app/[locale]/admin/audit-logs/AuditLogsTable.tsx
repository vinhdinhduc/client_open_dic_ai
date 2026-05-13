"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DetailModal from "./DetailModal";
import "./auditLogsTable.scss";

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
}

interface AuditLogsTableProps {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isLoading: boolean;
  filters: any;
}

const ACTION_COLORS: Record<string, string> = {
  TERM_CREATE: "bg-blue",
  TERM_UPDATE: "bg-cyan",
  TERM_DELETE: "bg-red",
  TERM_APPROVE: "bg-green",
  TERM_REJECT: "bg-orange",
  USER_BAN: "bg-red",
  USER_LOCK: "bg-orange",
  ROLE_CHANGE: "bg-purple",
  REPORT_RESOLVED: "bg-green",
  REPORT_REJECTED: "bg-orange",
  REPORT_CREATE: "bg-blue",
  CONTRIBUTION_APPROVE: "bg-green",
  CONTRIBUTION_REJECT: "bg-orange",
  CONTRIBUTION_DELETE: "bg-red",
  COMMENT_DELETE: "bg-red",
  LOGIN_SUCCESS: "bg-gray",
  LOGIN_FAILED: "bg-red",
  PASSWORD_CHANGE: "bg-cyan",
  EMAIL_VERIFY: "bg-blue",
  USER_CREATE: "bg-blue",
  USER_UPDATE: "bg-cyan",
  USER_DELETE: "bg-red",
  USER_UNBAN: "bg-green",
  COMMENT_APPROVE: "bg-green",
  COMMENT_REJECT: "bg-orange",
};

export default function AuditLogsTable({
  logs,
  pagination,
  onPageChange,
  isLoading,
  filters,
}: AuditLogsTableProps) {
  const t = useTranslations("auditLogs");
  const tTable = useTranslations("auditLogs.table");
  const ta = useTranslations("auditLogs.actions");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const dateStr = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} ${dateStr}`;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || "bg-gray";
  };

  const getActionLabel = (action: string) => {
    try {
      return ta(action);
    } catch (e) {
      return action;
    }
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return null;
    try {
      // try to translate role under auditLogs.roles (e.g. auditLogs.roles.admin)
      const key = `roles.${role.toLowerCase()}`;
      const label = t(key);
      return label !== key ? label : role;
    } catch (e) {
      return role;
    }
  };

  const getResourceLabel = (resourceType: string) => {
    try {
      const key = `resources.${resourceType}`;
      const label = tTable(key);
      return label !== key ? label : resourceType;
    } catch (e) {
      return resourceType;
    }
  };

  const formatResourceName = (resourceType: string, resourceName?: string) => {
    if (!resourceName) return null;
    // For long names, truncate for table view
    if (resourceName.length > 60) return resourceName.slice(0, 57) + "...";
    return resourceName;
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} className="empty-state">
            <div className="spinner">
              <div className="spinner-inner"></div>
            </div>
            {tTable("loading")}
          </td>
        </tr>
      );
    }

    if (logs.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="empty-state">
            {tTable("noData")}
          </td>
        </tr>
      );
    }

    return null;
  };

  return (
    <div className="audit-logs-table-wrapper">
      <div className="table-container">
        <table className="audit-logs-table">
          <thead>
            <tr>
              <th>{tTable("time")}</th>
              <th>{tTable("action")}</th>
              <th>{tTable("actor")}</th>
              <th>{tTable("resource")}</th>
              <th>{tTable("reason")}</th>
              <th>{tTable("status")}</th>
            </tr>
          </thead>
          <tbody>
            {renderEmptyState() ||
              logs.map((log) => (
                <tr key={log._id} className="audit-row">
                  <td className="time-cell">{formatDateTime(log.createdAt)}</td>

                  <td className="action-cell">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className={`action-badge ${getActionColor(log.action)}`}
                      title={tTable("clickDetail")}
                    >
                      {getActionLabel(log.action)}
                    </button>
                  </td>

                  <td className="actor-cell">
                    <div className="actor-info">
                      <span className="name">
                        {log.actor.fullName || log.actor.email}
                      </span>
                      <div className="meta">
                        {log.actor.email && log.actor.fullName && (
                          <span className="email muted">{log.actor.email}</span>
                        )}
                        {log.actor.role && (
                          <span className="role">
                            {getRoleLabel(log.actor.role)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="resource-cell">
                    <div className="resource-info">
                      <span className="type">
                        {getResourceLabel(log.resourceType)}
                      </span>
                      {formatResourceName(
                        log.resourceType,
                        log.resourceName,
                      ) ? (
                        <span className="name">
                          {formatResourceName(
                            log.resourceType,
                            log.resourceName,
                          )}
                        </span>
                      ) : (
                        <span className="name muted">
                          {tTable("noResourceName")}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="reason-cell">
                    {log.reason || (
                      <span className="text-muted">{tTable("noReason")}</span>
                    )}
                  </td>

                  <td className="status-cell">
                    <span
                      className={`status-badge ${
                        log.status === "success"
                          ? "status-success"
                          : "status-failed"
                      }`}
                    >
                      {log.status === "success"
                        ? tTable("success")
                        : tTable("failed")}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && !isLoading && (
        <div className="pagination">
          <div className="pagination-info">
            {tTable("showing")} {logs.length} {tTable("of")} {pagination.total}{" "}
            {tTable("records")}
          </div>

          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1 || isLoading}
              className="pagination-btn"
            >
              <ChevronLeft size={18} />
              {tTable("previous")}
            </button>

            <div className="page-numbers">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`page-number ${
                    pagination.page === page ? "active" : ""
                  }`}
                  disabled={isLoading}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                onPageChange(
                  Math.min(pagination.totalPages, pagination.page + 1),
                )
              }
              disabled={pagination.page === pagination.totalPages || isLoading}
              className="pagination-btn"
            >
              {tTable("next")}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
