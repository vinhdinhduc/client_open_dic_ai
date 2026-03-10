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
} from "lucide-react";
import { toast } from "react-hot-toast";
import contributionService, {
  Contribution,
} from "@/services/contributionService";
import ContributionDetailModal from "../../../../../components/forms/manage_contribution/ContributionDetailModal";
import ConfirmModal, {
  ConfirmType,
} from "../../../../../components/common/ConfirmModal";
import "../moderation.scss";

export default function ContributionsModerationPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Quick rejection reasons
  const quickRejectionReasons = [
    "Nội dung không chính xác",
    "Thiếu thông tin bắt buộc",
    "Trùng lặp với thuật ngữ hiện tại",
    "Không phù hợp với quy định",
    "Cần bổ sung thêm thông tin",
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Stats
  const [pendingCount, setPendingCount] = useState(0);

  const fetchContributions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
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
        if (statusFilter === "all") {
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
      toast.error("Không thể tải danh sách đóng góp");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, itemsPerPage]);

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
        },
      );

      if (response.success) {
        toast.success("Đóng góp đã được phê duyệt");
        setShowDetailModal(false);
        setModeratorNote("");
        setSelectedContribution(null);
        fetchContributions();
      }
    } catch (error) {
      console.error("Error approving contribution:", error);
      toast.error("Không thể phê duyệt đóng góp");
    } finally {
      setActionLoading(null);
    }
  };

  // Execute reject action
  const handleReject = async () => {
    if (!selectedContribution) return;

    // Validate rejection reason
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
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
        toast.success("Đóng góp đã bị từ chối");
        setShowDetailModal(false);
        setModeratorNote("");
        setRejectionReason("");
        setSelectedContribution(null);
        fetchContributions();
      }
    } catch (error) {
      console.error("Error rejecting contribution:", error);
      toast.error("Không thể từ chối đóng góp");
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
        toast.success(`Đã phê duyệt ${res.data.approved} đóng góp`);
        setSelectedIds(new Set());
        setModeratorNote("");
        fetchContributions();
      }
    } catch {
      toast.error("Không thể phê duyệt hàng loạt");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    if (!bulkRejectNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setBulkLoading(true);
      const res = await contributionService.bulkReject(
        Array.from(selectedIds),
        bulkRejectNote,
      );
      if (res.success) {
        toast.success(`Đã từ chối ${res.data.rejected} đóng góp`);
        setSelectedIds(new Set());
        setBulkRejectNote("");
        setShowBulkRejectModal(false);
        fetchContributions();
      }
    } catch {
      toast.error("Không thể từ chối hàng loạt");
    } finally {
      setBulkLoading(false);
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
      pending: { label: "Chờ duyệt", className: "badge--warning" },
      approved: { label: "Đã duyệt", className: "badge--success" },
      rejected: { label: "Đã từ chối", className: "badge--danger" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getTypeBadge = (type: Contribution["type"]) => {
    const typeConfig = {
      edit_term: { label: "Chỉnh sửa", className: "badge--info", icon: Edit3 },
      new_term: { label: "Thêm mới", className: "badge--success", icon: Plus },
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
    return contribution.contributor?.fullName || "Ẩn danh";
  };

  const getFieldLabel = (key: string) => {
    const labels: Record<string, string> = {
      vi: "Tiếng Việt",
      lo: "Tiếng Lào",
      en: "Tiếng Anh",
      term: "Thuật ngữ",
      definition: "Định nghĩa",
      detailedExplanation: "Giải thích chi tiết",
      examples: "Ví dụ",
      contributorNote: "Ghi chú",
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
        title: "Xác nhận phê duyệt",
        message: `Bạn có chắc chắn muốn phê duyệt đóng góp "${selectedContribution ? getTermName(selectedContribution) : ""}"?`,
        confirmText: "Phê duyệt",
      };
    }
    return {
      type: "reject",
      title: "Xác nhận từ chối",
      message: `Bạn có chắc chắn muốn từ chối đóng góp "${selectedContribution ? getTermName(selectedContribution) : ""}"? Vui lòng nhập lý do từ chối.`,
      confirmText: "Từ chối",
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
            <h1>Kiểm duyệt nội dung đóng góp</h1>
            <p>Xem xét và phê duyệt các đóng góp từ cộng đồng</p>
          </div>
        </div>
        <div className="header-actions">
          {pendingCount > 0 && (
            <div className="header-badge header-badge--contribution">
              <AlertTriangle size={16} />
              <span>{pendingCount} gợi ý chờ duyệt</span>
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
        <div className="stat-card stat-card--warning">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Chờ duyệt</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">Tổng đóng góp</div>
        </div>
      </div>

      {/* Filters */}
      <div className="moderation-page__filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo thuật ngữ hoặc người đóng góp..."
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
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="edit_term">Chỉnh sửa</option>
            <option value="new_term">Thêm mới</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-action-bar__count">
            Đã chọn <strong>{selectedIds.size}</strong> đóng góp
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
              Duyệt tất cả
            </button>
            <button
              className="btn btn--danger btn--sm"
              onClick={() => setShowBulkRejectModal(true)}
              disabled={bulkLoading}
            >
              <XCircle size={14} />
              Từ chối tất cả
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {showBulkRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBulkRejectModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Từ chối {selectedIds.size} đóng góp</h3>
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>
                Lý do từ chối <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={bulkRejectNote}
                onChange={(e) => setBulkRejectNote(e.target.value)}
                placeholder="Nhập lý do từ chối..."
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
                Hủy
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
                Xác nhận từ chối
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
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
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
                  <th>Thuật ngữ</th>
                  <th>Loại</th>
                  <th>Danh mục</th>
                  <th>Người đóng góp</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredContributions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      <GitPullRequest size={48} />
                      <p>Không có gợi ý nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredContributions.map((contribution) => {
                    const statusBadge = getStatusBadge(contribution.status);
                    const typeBadge = getTypeBadge(contribution.type);

                    return (
                      <tr key={contribution._id}>
                        <td className="checkbox-cell">
                          {contribution.status === "pending" && (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(contribution._id)}
                              onChange={() => toggleSelect(contribution._id)}
                            />
                          )}
                        </td>
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
                            title="Xem chi tiết"
                            onClick={() => {
                              setSelectedContribution(contribution);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          {contribution.status === "pending" && (
                            <>
                              <button
                                className="action-btn action-btn--approve"
                                title="Duyệt"
                                disabled={actionLoading === contribution._id}
                                onClick={() => {
                                  setSelectedContribution(contribution);
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
                                title="Từ chối"
                                disabled={actionLoading === contribution._id}
                                onClick={() => {
                                  setSelectedContribution(contribution);
                                  setConfirmAction("reject");
                                  setShowConfirmModal(true);
                                }}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
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
                  <label htmlFor="itemsPerPage">Số lượng mỗi trang</label>
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
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} /{" "}
                    {totalItems} đóng góp
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
          moderatorNote={moderatorNote}
          onModeratorNoteChange={setModeratorNote}
          onClose={closeModal}
          onApprove={handleApproveClick}
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
          cancelText="Hủy"
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
