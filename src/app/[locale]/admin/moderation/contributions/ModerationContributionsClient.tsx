"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GitPullRequest,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit3,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import Link from "next/link";
import contributionService, {
  Contribution,
  ContributionOverrideData,
} from "@/services/contributionService";
import ContributionDetailModal from "../../../../../components/forms/manage_contribution/ContributionDetailModal";
import ConfirmModal, {
  ConfirmType,
} from "../../../../../components/common/ConfirmModal";
import "../moderation.scss";

interface ModerationContributionsClientProps {
  trashMode?: boolean;
}

export default function ContributionsModerationPage({
  trashMode = false,
}: ModerationContributionsClientProps) {
  const t = useTranslations("moderationContributions");
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
  const [approvalDraft, setApprovalDraft] =
    useState<ContributionOverrideData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Quick rejection reasons
  const quickRejectionReasons = [
    t("quickRejectReasons.inaccurate"),
    t("quickRejectReasons.missingInfo"),
    t("quickRejectReasons.duplicate"),
    t("quickRejectReasons.inappropriate"),
    t("quickRejectReasons.needsMore"),
  ];

  // Confirm Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject">(
    "approve",
  );

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkRejectNote, setBulkRejectNote] = useState("");
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const listPath = "/admin/moderation/contributions";
  const trashPath = "/admin/moderation/contributions/trash";

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Stats
  const [pendingCount, setPendingCount] = useState(0);

  const createContributionDraft = (
    contribution: Contribution,
  ): ContributionOverrideData => ({
    term: { ...contribution.term },
    definition: { ...contribution.definition },
    detailedExplanation: {
      vi: contribution.detailedExplanation?.vi || "",
      en: contribution.detailedExplanation?.en || "",
      lo: contribution.detailedExplanation?.lo || "",
    },
    examples: contribution.examples?.map((example) => ({
      vi: example.vi || "",
      en: example.en || "",
      lo: example.lo || "",
    })) || [{ vi: "", en: "", lo: "" }],
    partOfSpeech: contribution.partOfSpeech || "",
    tags: contribution.tags || [],
    contributorNote: contribution.contributorNote || "",
  });

  const openContributionModal = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setApprovalDraft(createContributionDraft(contribution));
    setShowDetailModal(true);
  };

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== "all" && !trashMode) {
        params.status = statusFilter;
      }
      if (trashMode) {
        params.includeDeleted = true;
        params.onlyDeleted = true;
      }
      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      const response = await contributionService.getContributions(
        params as any,
      );

      if (response.success) {
        setContributions(response.data.contributions || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalItems(response.data.pagination?.total || 0);

        // Calculate pending count
        if (trashMode) {
          setPendingCount(0);
        } else if (statusFilter === "all") {
          const pendingRes = await contributionService.getContributions({
            status: "pending",
            limit: 1,
          });
          if (pendingRes.success) {
            setPendingCount(pendingRes.data.pagination?.total || 0);
          }
        } else if (statusFilter === "pending") {
          setPendingCount(response.data.pagination?.total || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, itemsPerPage, trashMode, t]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter]);

  // Show confirm modal before approve
  const handleApproveClick = () => {
    setConfirmAction("approve");
    setShowConfirmModal(true);
  };

  const handleApproveRequest = (draft: ContributionOverrideData) => {
    setApprovalDraft(draft);
    handleApproveClick();
  };

  // Show confirm modal before reject
  const handleRejectClick = () => {
    setConfirmAction("reject");
    setShowConfirmModal(true);
  };

  // Execute approve action
  const handleApprove = async () => {
    if (!selectedContribution) return;

    try {
      setActionLoading(selectedContribution._id);
      setShowConfirmModal(false);

      const response = await contributionService.approveContribution(
        selectedContribution._id,
        {
          moderatorNote: moderatorNote || undefined,
          overrideData: approvalDraft || undefined,
        },
      );

      if (response.success) {
        toast.success(t("approveSuccess"));
        setShowDetailModal(false);
        setModeratorNote("");
        setApprovalDraft(null);
        setSelectedContribution(null);
        fetchContributions();
      }
    } catch (error) {
      console.error("Error approving contribution:", error);
      toast.error(t("approveError"));
    } finally {
      setActionLoading(null);
    }
  };

  // Execute reject action
  const handleReject = async () => {
    if (!selectedContribution) return;

    // Validate rejection reason
    if (!rejectionReason.trim()) {
      toast.error(t("rejectReasonRequired"));
      return;
    }

    try {
      setActionLoading(selectedContribution._id);
      setShowConfirmModal(false);

      const response = await contributionService.rejectContribution(
        selectedContribution._id,
        {
          moderatorNote: rejectionReason,
        },
      );

      if (response.success) {
        toast.success(t("rejectSuccess"));
        setShowDetailModal(false);
        setModeratorNote("");
        setRejectionReason("");
        setApprovalDraft(null);
        setSelectedContribution(null);
        fetchContributions();
      }
    } catch (error) {
      console.error("Error rejecting contribution:", error);
      toast.error(t("rejectError"));
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (
      selectedIds.size === pendingFilteredIds.length &&
      pendingFilteredIds.length > 0
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingFilteredIds));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    try {
      setBulkLoading(true);
      const res = await contributionService.bulkApprove(
        Array.from(selectedIds),
        moderatorNote || undefined,
      );
      if (res.success) {
        toast.success(t("bulkApproveSuccess", { count: res.data.approved }));
        setSelectedIds(new Set());
        setModeratorNote("");
        fetchContributions();
      }
    } catch {
      toast.error(t("bulkApproveError"));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    if (!bulkRejectNote.trim()) {
      toast.error(t("rejectReasonRequired"));
      return;
    }
    try {
      setBulkLoading(true);
      const res = await contributionService.bulkReject(
        Array.from(selectedIds),
        bulkRejectNote,
      );
      if (res.success) {
        toast.success(t("bulkRejectSuccess", { count: res.data.rejected }));
        setSelectedIds(new Set());
        setBulkRejectNote("");
        setShowBulkRejectModal(false);
        fetchContributions();
      }
    } catch {
      toast.error(t("bulkRejectError"));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleMoveToTrash = async (contributionId: string) => {
    if (!confirm(t("confirmMoveToTrash"))) {
      return;
    }

    try {
      const res = await contributionService.deleteContribution(contributionId);
      if (res.success) {
        toast.success(t("moveToTrashSuccess"));
        fetchContributions();
      } else {
        toast.error(res.message || t("moveToTrashError"));
      }
    } catch {
      toast.error(t("moveToTrashError"));
    }
  };

  const handleRestore = async (contributionId: string) => {
    try {
      const res = await contributionService.restoreContribution(contributionId);
      if (res.success) {
        toast.success(t("restoreSuccess"));
        fetchContributions();
      } else {
        toast.error(res.message || t("restoreError"));
      }
    } catch {
      toast.error(t("restoreError"));
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm(t("confirmEmptyTrash"))) {
      return;
    }
    try {
      const res = await contributionService.emptyContributionTrash();
      if (res.success) {
        toast.success(t("emptyTrashSuccess", { count: res.data.deletedCount }));
        fetchContributions();
      } else {
        toast.error(res.message || t("emptyTrashError"));
      }
    } catch {
      toast.error(t("emptyTrashError"));
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
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
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const getStatusBadge = (status: Contribution["status"]) => {
    const statusConfig = {
      pending: { label: t("pending"), className: "badge--warning" },
      approved: { label: t("approved"), className: "badge--success" },
      rejected: { label: t("rejected"), className: "badge--danger" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getTypeBadge = (type: Contribution["type"]) => {
    const typeConfig = {
      edit_term: {
        label: t("typeEdit"),
        className: "badge--info",
        icon: Edit3,
      },
      new_term: {
        label: t("typeNew"),
        className: "badge--success",
        icon: Plus,
      },
    };
    return typeConfig[type] || typeConfig.new_term;
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

  const getTermName = (contribution: Contribution) => {
    const term = contribution.term ?? contribution.targetTerm?.term;
    return term?.vi || term?.en || term?.lo || "N/A";
  };

  const getContributorName = (contribution: Contribution) => {
    return contribution.contributor?.fullName || t("anonymous");
  };

  const getFieldLabel = (key: string) => {
    const labels: Record<string, string> = {
      vi: t("vietnamese"),
      lo: t("lao"),
      en: t("english"),
      term: t("termLabel"),
      definition: t("definitionLabel"),
      detailedExplanation: t("detailLabel"),
      examples: t("exampleLabel"),
      contributorNote: t("noteLabel"),
    };
    return labels[key] || key;
  };

  // Filter contributions by search term (client-side)
  const filteredContributions = contributions.filter((contribution) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      getTermName(contribution).toLowerCase().includes(searchLower) ||
      getContributorName(contribution).toLowerCase().includes(searchLower)
    );
  });

  const pendingFilteredIds = filteredContributions
    .filter((c) => c.status === "pending")
    .map((c) => c._id);

  const closeModal = () => {
    setShowDetailModal(false);
    setModeratorNote("");
    setRejectionReason("");
    setApprovalDraft(null);
    setSelectedContribution(null);
  };

  const getConfirmModalConfig = (): {
    type: ConfirmType;
    title: string;
    message: string;
    confirmText: string;
  } => {
    if (confirmAction === "approve") {
      return {
        type: "approve",
        title: t("confirmApprove"),
        message: t("confirmApproveMsg"),
        confirmText: t("approve"),
      };
    }
    return {
      type: "reject",
      title: t("confirmReject"),
      message: t("confirmRejectMsg"),
      confirmText: t("reject"),
    };
  };

  return (
    <div className="moderation-page">
      {/* Header */}
      <div className="moderation-page__header">
        <div className="header-content">
          <div className="header-icon header-icon--contribution">
            <GitPullRequest size={24} />
          </div>
          <div className="header-text">
            <h1>{trashMode ? t("trashTitle") : t("title")}</h1>
            <p>{trashMode ? t("trashSubtitle") : t("subtitle")}</p>
          </div>
        </div>
        <div className="header-actions">
          {trashMode ? (
            <>
              <button
                className="btn btn--danger btn--icon"
                onClick={handleEmptyTrash}
                title="Lam rong thung rac"
              >
                <Trash2 size={16} />
              </button>
              <Link
                href={listPath}
                className="btn btn--secondary btn--icon"
                title="Danh sach dong gop"
              >
                <GitPullRequest size={16} />
              </Link>
            </>
          ) : (
            <Link
              href={trashPath}
              className="btn btn--secondary btn--icon"
              title="Thung rac"
            >
              <Trash2 size={16} />
            </Link>
          )}
          {!trashMode && pendingCount > 0 && (
            <div className="header-badge header-badge--contribution">
              <AlertTriangle size={16} />
              <span>{t("pendingCount", { count: pendingCount })}</span>
            </div>
          )}
          <button
            className="btn btn--secondary btn--icon"
            onClick={fetchContributions}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spinning" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="moderation-page__stats">
        {!trashMode && (
          <div className="stat-card stat-card--warning">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">{t("pending")}</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">{t("totalContributions")}</div>
        </div>
      </div>

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
          {!trashMode && (
            <>
              <Filter size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("allStatuses")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="approved">{t("approved")}</option>
                <option value="rejected">{t("rejected")}</option>
              </select>
            </>
          )}

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">{t("allTypes")}</option>
            <option value="edit_term">{t("typeEdit")}</option>
            <option value="new_term">{t("typeNew")}</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {!trashMode && selectedIds.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-action-bar__count">
            {t("selectedCount", { count: selectedIds.size })}
          </span>
          <div className="bulk-action-bar__actions">
            <button
              className="btn btn--success btn--sm"
              onClick={handleBulkApprove}
              disabled={bulkLoading}
            >
              {bulkLoading ? (
                <Loader2 size={14} className="spinning" />
              ) : (
                <CheckCircle size={14} />
              )}
              {t("approveAll")}
            </button>
            <button
              className="btn btn--danger btn--sm"
              onClick={() => setShowBulkRejectModal(true)}
              disabled={bulkLoading}
            >
              <XCircle size={14} />
              {t("rejectAll")}
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => setSelectedIds(new Set())}
            >
              {t("deselect")}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {!trashMode && showBulkRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBulkRejectModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("bulkRejectTitle", { count: selectedIds.size })}</h3>
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>
                {t("rejectReason")} <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={bulkRejectNote}
                onChange={(e) => setBulkRejectNote(e.target.value)}
                placeholder={t("rejectReasonPlaceholder")}
              />
            </div>
            <div
              className="form-actions"
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setShowBulkRejectModal(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={handleBulkReject}
                disabled={bulkLoading}
              >
                {bulkLoading ? (
                  <Loader2 size={14} className="spinning" />
                ) : (
                  <XCircle size={14} />
                )}
                {t("confirmReject")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contributions Table */}
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
                  {!trashMode && (
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === pendingFilteredIds.length &&
                          pendingFilteredIds.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  <th>{t("term")}</th>
                  <th>{t("type")}</th>
                  <th>{t("category")}</th>
                  <th>{t("contributor")}</th>
                  <th>{t("submitDate")}</th>
                  <th>{t("status")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={trashMode ? 7 : 8} className="empty-state">
                      <GitPullRequest size={48} />
                      <p>{t("noContributions")}</p>
                    </td>
                  </tr>
                ) : (
                  filteredContributions.map((contribution) => {
                    const statusBadge = getStatusBadge(contribution.status);
                    const typeBadge = getTypeBadge(contribution.type);

                    return (
                      <tr key={contribution._id}>
                        {!trashMode && (
                          <td className="checkbox-cell">
                            {contribution.status === "pending" && (
                              <input
                                type="checkbox"
                                checked={selectedIds.has(contribution._id)}
                                onChange={() => toggleSelect(contribution._id)}
                              />
                            )}
                          </td>
                        )}
                        <td className="target-cell">
                          <span className="target-title">
                            {getTermName(contribution)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${typeBadge.className}`}>
                            {typeBadge.label}
                          </span>
                        </td>
                        <td className="field-cell">
                          {contribution.category?.name?.vi || "-"}
                        </td>
                        <td className="reporter-cell">
                          <div className="reporter">
                            <div className="reporter-avatar">
                              {getContributorName(contribution).charAt(0)}
                            </div>
                            <span>{getContributorName(contribution)}</span>
                          </div>
                        </td>
                        <td className="date-cell">
                          {formatDate(contribution.createdAt)}
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
                              openContributionModal(contribution);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          {contribution.status === "pending" && !trashMode && (
                            <>
                              <button
                                className="action-btn action-btn--approve"
                                title={t("approve")}
                                disabled={actionLoading === contribution._id}
                                onClick={() => {
                                  setSelectedContribution(contribution);
                                  setApprovalDraft(
                                    createContributionDraft(contribution),
                                  );
                                  setConfirmAction("approve");
                                  setShowConfirmModal(true);
                                }}
                              >
                                {actionLoading === contribution._id ? (
                                  <Loader2 size={16} className="spinning" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </button>
                              <button
                                className="action-btn action-btn--reject"
                                title={t("reject")}
                                disabled={actionLoading === contribution._id}
                                onClick={() => {
                                  setSelectedContribution(contribution);
                                  setApprovalDraft(
                                    createContributionDraft(contribution),
                                  );
                                  setConfirmAction("reject");
                                  setShowConfirmModal(true);
                                }}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {!trashMode && contribution.status !== "approved" && (
                            <button
                              className="action-btn action-btn--reject"
                              title="Chuyen vao thung rac"
                              onClick={() =>
                                handleMoveToTrash(contribution._id)
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {trashMode && (
                            <button
                              className="action-btn action-btn--approve"
                              title="Khoi phuc"
                              onClick={() => handleRestore(contribution._id)}
                            >
                              <RotateCcw size={16} />
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
                    id="itemsPerPage"
                    className="admin-pagination__options"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <p>
                    {t("showing")} {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} {t("of")}{" "}
                    {totalItems} {t("contributionsLabel")}
                  </p>
                </div>
                <div className="admin-pagination__controls">
                  <button
                    className="admin-pagination__btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    <ChevronLeft size={16} />
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="admin-pagination__btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
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
                        className={`admin-pagination__btn ${page === currentPage ? "admin-pagination__btn--active" : ""}`}
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
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="admin-pagination__btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
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
      {showDetailModal && selectedContribution && (
        <ContributionDetailModal
          contribution={selectedContribution}
          contributionDraft={
            approvalDraft || createContributionDraft(selectedContribution)
          }
          moderatorNote={moderatorNote}
          onContributionDraftChange={setApprovalDraft}
          onModeratorNoteChange={setModeratorNote}
          onClose={closeModal}
          onApprove={handleApproveRequest}
          onReject={handleRejectClick}
          actionLoading={actionLoading === selectedContribution._id}
        />
      )}

      {/* Confirm Modal */}
      {selectedContribution && (
        <ConfirmModal
          isOpen={showConfirmModal}
          type={getConfirmModalConfig().type}
          title={getConfirmModalConfig().title}
          message={getConfirmModalConfig().message}
          confirmText={getConfirmModalConfig().confirmText}
          cancelText={t("cancel")}
          onConfirm={confirmAction === "approve" ? handleApprove : handleReject}
          onCancel={() => {
            setShowConfirmModal(false);
            if (confirmAction === "reject") {
              setRejectionReason("");
            }
          }}
          loading={actionLoading === selectedContribution._id}
          reasonNote={confirmAction === "reject" ? rejectionReason : undefined}
          onReasonNoteChange={
            confirmAction === "reject" ? setRejectionReason : undefined
          }
          quickReasons={
            confirmAction === "reject" ? quickRejectionReasons : undefined
          }
          requireReason={confirmAction === "reject"}
        />
      )}
    </div>
  );
}
