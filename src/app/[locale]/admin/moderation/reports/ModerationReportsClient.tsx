"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Flag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Report, ReportStats } from "@/services/reportService";
import {
  deleteReport,
  getReports,
  getReportStats,
  resolveReport,
} from "@/services/reportService";
import "../moderation.scss";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function ReportsModerationPage() {
  const t = useTranslations("moderationReports");
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("none");
  const [showConfirmDismiss, setShowConfirmDismiss] = useState(false);
  const [reportToDismiss, setReportToDismiss] = useState<Report | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await getReports(params as any);

      if (response.success) {
        setReports(response.data.reports || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, itemsPerPage, t]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getReportStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleResolve = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      const response = await resolveReport(reportId, {
        status: "resolved",
        moderatorNote: moderatorNote || undefined,
        actionTaken: selectedAction as "delete" | "edit" | "warning" | "none",
      });

      if (response.success) {
        toast.success(t("resolveSuccess"));
        setShowDetailModal(false);
        setModeratorNote("");
        setSelectedAction("none");
        fetchReports();
        fetchStats();
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      toast.error(t("resolveError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      const response = await resolveReport(reportId, {
        status: "rejected",
        moderatorNote: moderatorNote || undefined,
      });

      if (response.success) {
        toast.success(t("dismissSuccess"));
        setShowDetailModal(false);
        setModeratorNote("");
        fetchReports();
        fetchStats();
      }
    } catch (error) {
      console.error("Error dismissing report:", error);
      toast.error(t("dismissError"));
    } finally {
      setActionLoading(null);
    }
  };
  const handleShowConfirmDismiss = (report: Report) => {
    setReportToDismiss(report);
    setShowConfirmDismiss(true);
  };

  const handleConfirmDismiss = async () => {
    if (!reportToDismiss) return;
    await handleDismiss(reportToDismiss._id);
    setShowConfirmDismiss(false);
    setReportToDismiss(null);
  };

  const handleCancelDismiss = () => {
    setShowConfirmDismiss(false);
    setReportToDismiss(null);
  };

  const handleMoveToTrash = async (reportId: string) => {
    if (!confirm(t("confirmMoveToTrash"))) {
      return;
    }

    try {
      const res = await deleteReport(reportId);
      if (res.success) {
        toast.success(t("moveToTrashSuccess"));
        fetchReports();
        fetchStats();
      } else {
        toast.error(res.message || t("moveToTrashError"));
      }
    } catch {
      toast.error(t("moveToTrashError"));
    }
  };
  const getReasonText = (reason: string) => {
    switch (reason) {
      case "duplicate":
        return t("reasonDuplicate");
      case "incorrect":
        return t("reasonInaccurate");
      case "spam":
        return t("reasonSpam");
      case "inappropriate":
        return t("reasonInappropriate");
      case "other":
        return t("reasonOther");
      default:
        return reason;
    }
  };

  const getStatusBadge = (status: Report["status"]) => {
    const statusConfig = {
      pending: { label: t("pending"), className: "badge--warning" },
      resolved: { label: t("resolved"), className: "badge--success" },
      rejected: { label: t("rejected"), className: "badge--secondary" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const getTargetTitle = (report: Report) => {
    if (report.targetTerm) {
      return (
        report.targetTerm.term?.vi ||
        report.targetTerm.term?.en ||
        t("termLabel")
      );
    }
    return t("unknown");
  };

  const getReporterName = (report: Report) => {
    return report.reporter?.fullName || t("anonymous");
  };

  // Filter reports by search term (client-side)
  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      getTargetTitle(report).toLowerCase().includes(searchLower) ||
      report.reason.toLowerCase().includes(searchLower) ||
      getReporterName(report).toLowerCase().includes(searchLower)
    );
  });

  const pendingCount = stats?.pending || 0;

  return (
    <div className="moderation-page">
      {/* Header */}
      <div className="moderation-page__header">
        <div className="header-content">
          <div className="header-icon">
            <Flag size={24} />
          </div>
          <div className="header-text">
            <h1>{t("title")}</h1>
            <p>{t("subtitle")}</p>
          </div>
        </div>
        <div className="header-actions">
          <Link
            href="/admin/moderation/reports/trash"
            className="btn btn--secondary btn--icon"
            title="Thung rac"
          >
            <Trash2 size={16} />
          </Link>
          {pendingCount > 0 && (
            <div className="header-badge">
              <AlertTriangle size={16} />
              <span>{t("pendingCount", { count: pendingCount })}</span>
            </div>
          )}
          <button
            className="btn btn--secondary btn--icon"
            onClick={() => {
              fetchReports();
              fetchStats();
            }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spinning" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="moderation-page__stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">{t("totalReports")}</div>
          </div>
          <div className="stat-card stat-card--warning">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">{t("pending")}</div>
          </div>
          <div className="stat-card stat-card--success">
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">{t("resolved")}</div>
          </div>
          <div className="stat-card stat-card--secondary">
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">{t("rejected")}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="moderation-page__filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="resolved">{t("resolved")}</option>
            <option value="rejected">{t("rejected")}</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="moderation-page__table">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={48} className="spinning" />
            <p>{t("loading")}</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>{t("reportedTerm")}</th>
                  <th>{t("reason")}</th>
                  <th>{t("reporter")}</th>
                  <th>{t("reportDate")}</th>
                  <th>{t("status")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <Flag size={48} />
                      <p>{t("noReports")}</p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const statusBadge = getStatusBadge(report.status);

                    return (
                      <tr key={report._id}>
                        <td className="target-cell">
                          <span className="target-title">
                            {getTargetTitle(report)}
                          </span>
                        </td>
                        <td className="reason-cell">
                          {getReasonText(report.reason)}
                        </td>
                        <td className="reporter-cell">
                          <div className="reporter">
                            <div className="reporter-avatar">
                              {getReporterName(report).charAt(0)}
                            </div>
                            <span>{getReporterName(report)}</span>
                          </div>
                        </td>
                        <td className="date-cell">
                          {formatDate(report.createdAt)}
                        </td>
                        <td>
                          <span className={`badge ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-btn action-btn--view"
                            title={t("viewDetails")}
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          {report.status === "pending" && (
                            <>
                              <button
                                className="action-btn action-btn--approve"
                                title={t("resolve")}
                                disabled={actionLoading === report._id}
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowDetailModal(true);
                                }}
                              >
                                {actionLoading === report._id ? (
                                  <Loader2 size={16} className="spinning" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </button>
                              <button
                                className="action-btn action-btn--reject"
                                title={t("dismiss")}
                                disabled={actionLoading === report._id}
                                onClick={() => handleShowConfirmDismiss(report)}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {report.status !== "pending" && (
                            <button
                              className="action-btn action-btn--reject"
                              title="Chuyen vao thung rac"
                              onClick={() => handleMoveToTrash(report._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <div className="admin-pagination__info">
                  <label htmlFor="itemsPerPage">{t("perPage")}</label>
                  <select
                    name="itemsPerPage"
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                  <p>
                    {t("showing")} {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} {t("of")}{" "}
                    {totalItems} {t("reportsLabel")}
                  </p>
                </div>
                <div className="admin-pagination__controls">
                  <button
                    className="admin-pagination__btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title={t("firstPage")}
                  >
                    <ChevronLeft size={16} />
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="admin-pagination__btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    title={t("previousPage")}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={index} className="admin-pagination__ellipsis">
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        className={`admin-pagination__btn ${
                          page === currentPage
                            ? "admin-pagination__btn--active"
                            : ""
                        }`}
                        onClick={() => setCurrentPage(Number(page))}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    className="admin-pagination__btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    title={t("nextPage")}
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="admin-pagination__btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title={t("lastPage")}
                  >
                    <ChevronRight size={16} />
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDetailModal(false);
            setModeratorNote("");
            setSelectedAction("none");
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{t("reportDetails")}</h2>
              <button
                className="modal__close"
                onClick={() => {
                  setShowDetailModal(false);
                  setModeratorNote("");
                  setSelectedAction("none");
                }}
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="modal__body">
              <div className="detail-section">
                <h3>{t("reportedTerm")}</h3>
                <div className="detail-item">
                  <span className="badge badge--primary">{t("termLabel")}</span>
                  <p className="detail-title">
                    {getTargetTitle(selectedReport)}
                  </p>
                  {selectedReport.targetTerm && (
                    <a
                      href={`/terms/${selectedReport.targetTerm.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      <ExternalLink size={14} />
                      {t("viewTerm")}
                    </a>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>{t("reportInfo")}</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>{t("reasonLabel")}</label>
                    <p>{selectedReport.reason}</p>
                  </div>
                  <div className="detail-item">
                    <label>{t("descriptionLabel")}</label>
                    <p>{selectedReport.description || t("noDescription")}</p>
                  </div>
                  <div className="detail-item">
                    <label>{t("reporterLabel")}</label>
                    <p>{getReporterName(selectedReport)}</p>
                  </div>
                  <div className="detail-item">
                    <label>{t("timeLabel")}</label>
                    <p>{formatDate(selectedReport.createdAt)}</p>
                  </div>
                  <div className="detail-item">
                    <label>{t("statusLabel")}</label>
                    <span
                      className={`badge ${getStatusBadge(selectedReport.status).className}`}
                    >
                      {getStatusBadge(selectedReport.status).label}
                    </span>
                  </div>
                  {selectedReport.category && (
                    <div className="detail-item">
                      <label>{t("categoryLabel")}</label>
                      <p>
                        {selectedReport.category.name?.vi ||
                          selectedReport.category.name?.en ||
                          t("unknown")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedReport.status === "pending" && (
                <div className="detail-section">
                  <h3>{t("resolveReport")}</h3>
                  <div className="form-group">
                    <label>{t("actionLabel")}</label>
                    <select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="form-select"
                    >
                      <option value="none">{t("actionNone")}</option>
                      <option value="edit">{t("actionRequestEdit")}</option>
                      <option value="delete">{t("actionDeleteContent")}</option>
                      <option value="warning">{t("actionWarnUser")}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t("moderatorNote")}</label>
                    <textarea
                      value={moderatorNote}
                      onChange={(e) => setModeratorNote(e.target.value)}
                      placeholder={t("moderatorNotePlaceholder")}
                      rows={3}
                      className="form-textarea"
                    />
                  </div>
                </div>
              )}

              {selectedReport.moderator && (
                <div className="detail-section">
                  <h3>{t("resolveInfo")}</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>{t("resolvedBy")}</label>
                      <p>{selectedReport.moderator.fullName}</p>
                    </div>
                    <div className="detail-item">
                      <label>{t("resolvedAt")}</label>
                      <p>
                        {selectedReport.resolvedAt
                          ? formatDate(selectedReport.resolvedAt)
                          : "-"}
                      </p>
                    </div>
                    {selectedReport.moderatorNote && (
                      <div className="detail-item detail-item--full">
                        <label>{t("noteLabel")}</label>
                        <p>{selectedReport.moderatorNote}</p>
                      </div>
                    )}
                    {selectedReport.actionTaken && (
                      <div className="detail-item">
                        <label>{t("actionTaken")}</label>
                        <p>
                          {selectedReport.actionTaken === "delete"
                            ? t("actionDeleteLabel")
                            : selectedReport.actionTaken === "edit"
                              ? t("actionEditLabel")
                              : selectedReport.actionTaken === "warning"
                                ? t("actionWarnLabel")
                                : t("actionNoneLabel")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {selectedReport.status === "pending" && (
              <div className="modal__footer">
                <button
                  className="btn btn--secondary"
                  onClick={() => handleDismiss(selectedReport._id)}
                  disabled={actionLoading === selectedReport._id}
                >
                  {actionLoading === selectedReport._id ? (
                    <>
                      <Loader2 size={16} className="spinning" />{" "}
                      {t("processing")}
                    </>
                  ) : (
                    <XCircle size={16} />
                  )}
                  {t("dismissBtn")}
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => handleResolve(selectedReport._id)}
                  disabled={actionLoading === selectedReport._id}
                >
                  {actionLoading === selectedReport._id ? (
                    <>
                      <Loader2 size={16} className="spinning" />{" "}
                      {t("processing")}
                    </>
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {t("resolveBtn")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Dismiss Modal */}
      <ConfirmModal
        isOpen={showConfirmDismiss}
        type="reject"
        title={t("confirmDismiss")}
        message={t("confirmDismissMsg")}
        confirmText={t("reject")}
        cancelText={t("cancel")}
        onConfirm={handleConfirmDismiss}
        onCancel={handleCancelDismiss}
        loading={actionLoading === reportToDismiss?._id}
      />
    </div>
  );
}
