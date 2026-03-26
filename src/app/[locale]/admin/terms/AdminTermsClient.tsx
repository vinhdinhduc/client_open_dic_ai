"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  XCircle,
  Download,
  Upload,
  Filter,
  BookOpen,
  Tag,
  Heart,
  MessageCircle,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import {
  getAllTerms,
  getModeratorTerms,
  getTermStats,
  deleteTerm,
  restoreTerm,
  emptyTermTrash,
  updateTerm,
} from "@/services/termService";
import categoryService, { Category } from "@/services/categoryService";
import { useLanguage } from "@/hooks";
import axiosInstance from "@/lib/axios";
import {
  ApiResponse,
  GetTermsAdminResponse,
  TermCardData,
  TermStats,
} from "@/components/terms/types";
import { ExportModal } from "@/components/forms/manage_terms/ExportModal";
import "./terms.scss";
import { useRouter } from "next/navigation";

// Type alias cho admin page
type Term = TermCardData;

// Helper function to get category name as string
const getCategoryName = (
  name: string | { vi: string; en?: string; lo?: string } | undefined,
): string => {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name.vi || name.en || "";
};

interface TermsPageProps {
  isModerator?: boolean;
  initialStatusFilter?: "all" | "approved" | "pending" | "rejected" | "trash";
}

type StatusFilter = NonNullable<TermsPageProps["initialStatusFilter"]>;

export default function TermsPage({
  isModerator = false,
  initialStatusFilter = "all",
}: TermsPageProps) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(initialStatusFilter);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [showBulkActionConfirm, setShowBulkActionConfirm] = useState<{
    action: "approve" | "reject" | "delete" | null;
    count: number;
  }>({ action: null, count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState<TermStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const { currentLanguage } = useLanguage();
  const router = useRouter();
  const translationNamespace = isModerator ? "moderatorTerms" : "adminTerms";
  const t = useTranslations(translationNamespace);
  const termsBasePath = isModerator ? "/moderator/terms" : "/admin/terms";

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (isModerator) {
          const res = await axiosInstance.get(
            "/categories/moderator/my-categories",
          );
          if (res.data?.success) {
            const normalized: Category[] = (res.data.data || []).map(
              (c: any) => ({
                id: c._id,
                _id: c._id,
                name: c.name,
                slug: c.slug,
                icon: c.icon,
                isActive: c.isActive,
              }),
            );
            setCategories(normalized);
          }
        } else {
          const result = await categoryService.getCategories();
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [isModerator]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getTermStats();
        if (result.success) {
          setStats(result.data.stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setCurrentPage(1);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, itemsPerPage]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const selectableTerms =
        statusFilter === "pending"
          ? terms.filter((term) => term.status === "pending")
          : terms;
      const selectedCount = selectableTerms.filter((term) =>
        selectedTerms.has(term._id),
      ).length;

      selectAllCheckboxRef.current.indeterminate =
        selectedCount > 0 && selectedCount < selectableTerms.length;
    }
  }, [selectedTerms, terms, statusFilter]);

  useEffect(() => {
    fetchTerms();
  }, [
    categoryFilter,
    statusFilter,
    currentPage,
    itemsPerPage,
    debouncedSearch,
  ]);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const fetchFn = isModerator ? getModeratorTerms : getAllTerms;
      const isTrashMode = statusFilter === "trash";
      const apiStatus = isTrashMode ? "all" : statusFilter;
      const resultTerm: ApiResponse<GetTermsAdminResponse> = await fetchFn(
        categoryFilter,
        apiStatus,
        currentPage,
        itemsPerPage,
        debouncedSearch,
        {
          includeDeleted: isTrashMode,
          onlyDeleted: isTrashMode,
        },
      );

      if (resultTerm.success) {
        setTerms(resultTerm.data.terms as Term[]);
        setTotalPages(resultTerm.data.pagination.pages);
        setTotalItems(resultTerm.data.pagination.total);
      } else {
        toast.error(resultTerm.message || t("loadError"));
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu đã được filter và phân trang từ API
  const paginatedTerms = terms;
  const pendingTermsOnPage = paginatedTerms.filter(
    (term) => term.status === "pending",
  );
  const currentSelectableTerms =
    statusFilter === "pending" ? pendingTermsOnPage : paginatedTerms;
  const selectedInCurrentView = currentSelectableTerms.filter((term) =>
    selectedTerms.has(term._id),
  ).length;

  const getPageNum = () => {
    const pages: (string | number)[] = [];
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="admin-badge admin-badge--success">
            {t("approved")}
          </span>
        );
      case "pending":
        return (
          <span className="admin-badge admin-badge--warning">
            {t("pending")}
          </span>
        );
      case "rejected":
        return (
          <span className="admin-badge admin-badge--danger">
            {t("rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (
    termId: string,
    newStatus: "approved" | "rejected",
  ) => {
    setTerms((prev) =>
      prev.map((t) => (t._id === termId ? { ...t, status: newStatus } : t)),
    );
  };

  // New: Handle selecting/deselecting individual term
  const handleTermSelect = (termId: string, checked: boolean) => {
    const term = paginatedTerms.find((t) => t._id === termId);
    if (statusFilter === "pending" && term?.status !== "pending") {
      return;
    }

    const newSelected = new Set(selectedTerms);
    if (checked) {
      newSelected.add(termId);
    } else {
      newSelected.delete(termId);
    }
    setSelectedTerms(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    const selectableIds = currentSelectableTerms.map((term) => term._id);

    if (checked) {
      const allIds = new Set([...Array.from(selectedTerms)]);
      selectableIds.forEach((id) => allIds.add(id));
      setSelectedTerms(allIds);
    } else {
      const newSelected = new Set(Array.from(selectedTerms));
      selectableIds.forEach((id) => newSelected.delete(id));
      setSelectedTerms(newSelected);
    }
  };

  const handleBulkApprove = async () => {
    const pendingSelectedCount = Array.from(selectedTerms).filter((id) => {
      const matched = terms.find((term) => term._id === id);
      return matched?.status === "pending";
    }).length;

    if (pendingSelectedCount === 0) {
      toast.error(t("selectPendingOnly"));
      return;
    }

    setShowBulkActionConfirm({
      action: "approve",
      count: pendingSelectedCount,
    });
  };

  const handleBulkReject = async () => {
    if (selectedTerms.size === 0) return;
    setShowBulkActionConfirm({
      action: "reject",
      count: selectedTerms.size,
    });
  };

  const handleBulkDelete = async () => {
    if (selectedTerms.size === 0) return;
    setShowBulkActionConfirm({
      action: "delete",
      count: selectedTerms.size,
    });
  };

  const executeBulkAction = async () => {
    const { action, count } = showBulkActionConfirm;
    if (!action || count === 0) return;

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const targetIds =
        action === "approve"
          ? Array.from(selectedTerms).filter((id) => {
              const matched = terms.find((term) => term._id === id);
              return matched?.status === "pending";
            })
          : Array.from(selectedTerms);

      for (const termId of targetIds) {
        try {
          let result;
          if (action === "delete") {
            result = await deleteTerm(termId);
          } else {
            const moderationStatus =
              action === "approve" ? "approved" : "rejected";
            result = await updateTerm(termId, {
              status: moderationStatus,
            });
          }

          if (result.success) {
            successCount++;
            setTerms((prev) =>
              action === "delete"
                ? prev.filter((t) => t._id !== termId)
                : prev.map((t) =>
                    t._id === termId
                      ? {
                          ...t,
                          status:
                            action === "approve" ? "approved" : "rejected",
                        }
                      : t,
                  ),
            );
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      setSelectedTerms(new Set());
      setShowBulkActionConfirm({ action: null, count: 0 });

      if (successCount > 0) {
        const actionLabel =
          action === "delete"
            ? t("deleted")
            : action === "approve"
              ? t("approved")
              : t("rejected");
        toast.success(`${t("bulkSuccess")}: ${successCount} ${actionLabel}`);
      }
      if (errorCount > 0) {
        toast.error(`${t("bulkPartialError")}: ${errorCount} ${t("failed")}`);
      }

      // Refresh terms list
      fetchTerms();
    } catch (error) {
      toast.error(t("bulkActionError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTerm) {
      setTerms((prev) => prev.filter((t) => t._id !== selectedTerm._id));
      setShowDeleteConfirm(false);
      setSelectedTerm(null);
      setLoading(true);
      try {
        const res = await deleteTerm(selectedTerm._id);
        if (res.success) {
          toast.success(t("deleteSuccess"));

          fetchTerms();
        } else {
          toast.error(res.message || t("deleteError"));
        }
      } catch (error) {
        toast.error(t("deleteError"));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestore = async (termId: string) => {
    try {
      const res = await restoreTerm(termId);
      if (res.success) {
        toast.success(t("restoreSuccess"));
        fetchTerms();
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
      const res = await emptyTermTrash();
      if (res.success) {
        toast.success(t("emptyTrashSuccess", { count: res.data.deletedCount }));
        fetchTerms();
      } else {
        toast.error(res.message || t("emptyTrashError"));
      }
    } catch {
      toast.error(t("emptyTrashError"));
    }
  };
  const handleEditTerm = (term: Term) => {
    router.push(`${termsBasePath}/edit/${term._id}`);
  };

  const handleViewTerm = (term: Term) => {
    router.push(`${termsBasePath}/${term._id}`);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>{t("loading")}</p>
      </div>
    );
  }

  const isTrashMode = statusFilter === "trash";

  return (
    <div className="terms-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">
            {statusFilter === "trash" ? t("trashTitle") : t("title")}
          </h1>
          <p className="admin-page-header__subtitle">
            {isModerator ? t("subtitleModerator") : t("subtitleAdmin")}
          </p>
        </div>
        <div className="admin-page-header__actions">
          {isTrashMode ? (
            <Link
              href={termsBasePath}
              className="admin-btn admin-btn--secondary"
            >
              <BookOpen size={16} />
              {t("termList")}
            </Link>
          ) : (
            <Link
              href={`${termsBasePath}/trash`}
              className="admin-btn admin-btn--secondary"
            >
              <Trash2 size={16} />
              {t("trash")}
            </Link>
          )}
          {!isTrashMode && (
            <button
              className="admin-btn admin-btn--secondary"
              onClick={() => setShowExportModal(true)}
            >
              <Download size={16} />
              {t("exportExcel")}
            </button>
          )}
          {!isTrashMode && (
            <Link
              href={isModerator ? "/moderator/import" : "/admin/import"}
              className="admin-btn admin-btn--secondary"
            >
              <Upload size={16} />
              {t("importData")}
            </Link>
          )}
          {isTrashMode && (
            <button
              className="admin-btn admin-btn--secondary"
              onClick={handleEmptyTrash}
            >
              <Trash2 size={16} />
              {t("emptyTrash")}
            </button>
          )}
          {!isTrashMode && (
            <Link
              href={`${termsBasePath}/new`}
              className="admin-btn admin-btn--primary"
            >
              <Plus size={16} />
              {t("addTerm")}
            </Link>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!isTrashMode && (
        <div className="terms-stats">
          <div className="terms-stat">
            <span className="terms-stat__value">{stats.total}</span>
            <span className="terms-stat__label">{t("totalTerms")}</span>
          </div>
          <div className="terms-stat">
            <span className="terms-stat__value terms-stat__value--success">
              {stats.approved}
            </span>
            <span className="terms-stat__label">{t("approved")}</span>
          </div>
          <div className="terms-stat">
            <span className="terms-stat__value terms-stat__value--warning">
              {stats.pending}
            </span>
            <span className="terms-stat__label">{t("pending")}</span>
          </div>
          <div className="terms-stat">
            <span className="terms-stat__value terms-stat__value--danger">
              {stats.rejected}
            </span>
            <span className="terms-stat__label">{t("rejected")}</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="admin-card">
        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-filters__search">
            <Search size={18} />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={`admin-filters__select ${categoryFilter !== "all" ? "has-value" : ""}`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{t("allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat.name)}
              </option>
            ))}
          </select>

          <select
            className={`admin-filters__select ${statusFilter !== "all" ? "has-value" : ""}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="approved">{t("approved")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="rejected">{t("rejected")}</option>
            <option value="trash">{t("trash")}</option>
          </select>

          {isTrashMode && (
            <button
              className="admin-btn admin-btn--secondary"
              onClick={fetchTerms}
            >
              <RefreshCw size={16} />
              {t("refresh") || "Làm mới"}
            </button>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedTerms.size > 0 && (
          <div className="bulk-actions-bar">
            <span className="bulk-actions-bar__info">
              {t("selected") || "Selected"} {selectedTerms.size}{" "}
              {t("termsLabel") || "terms"}
            </span>
            <div className="bulk-actions-bar__actions">
              {statusFilter === "pending" && (
                <>
                  <button
                    className="admin-btn admin-btn--success"
                    onClick={handleBulkApprove}
                  >
                    <Check size={16} />
                    {t("approveAll") || "Approve All"}
                  </button>
                  <button
                    className="admin-btn admin-btn--warning"
                    onClick={handleBulkReject}
                  >
                    <XCircle size={16} />
                    {t("rejectAll") || "Reject All"}
                  </button>
                </>
              )}
              {statusFilter !== "trash" && (
                <button
                  className="admin-btn admin-btn--danger"
                  onClick={handleBulkDelete}
                >
                  <Trash2 size={16} />
                  {t("deleteAll") || "Delete All"}
                </button>
              )}
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => setSelectedTerms(new Set())}
              >
                {t("clearSelection") || "Clear"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={
                      currentSelectableTerms.length > 0 &&
                      selectedInCurrentView > 0 &&
                      selectedInCurrentView === currentSelectableTerms.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    title={t("selectAll") || "Select all"}
                    disabled={currentSelectableTerms.length === 0}
                  />
                </th>
                <th>{t("term")}</th>
                <th>{t("category")}</th>
                {!isTrashMode && <th>{t("status")}</th>}
                {!isTrashMode && <th>{t("creator")}</th>}
                {!isTrashMode && <th>{t("stats")}</th>}
                {!isTrashMode && <th>{t("createdDate")}</th>}
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTerms.map((term) => (
                <tr key={term._id}>
                  <td style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedTerms.has(term._id)}
                      disabled={
                        statusFilter === "pending" && term.status !== "pending"
                      }
                      onChange={(e) =>
                        handleTermSelect(term._id, e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <div className="term-cell">
                      <span className="term-cell__vi">
                        {term.term.vi || term.term.en || term.term.lo || ""}
                      </span>
                      {term.term.en && (
                        <span className="term-cell__en">{term.term.en}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-cell">
                      <Tag size={14} />
                      {term.category?.name?.[currentLanguage] ||
                        t("noCategory")}
                    </span>
                  </td>
                  {!isTrashMode && (
                    <td>{getStatusBadge(term.status || "pending")}</td>
                  )}
                  {!isTrashMode && (
                    <td>
                      <div className="creator-cell">
                        <span>
                          {term.createdBy?.fullName || t("anonymous")}
                        </span>
                      </div>
                    </td>
                  )}
                  {!isTrashMode && (
                    <td>
                      <div className="stats-cell">
                        <span className="stats-cell__item stats-cell__item--view">
                          <Eye size={14} /> {term.viewCount}
                        </span>
                        <span className="stats-cell__item stats-cell__item--favorite">
                          <Heart size={14} /> {term.favoriteCount || 0}
                        </span>
                        <span className="stats-cell__item stats-cell__item--comment">
                          <MessageCircle size={14} /> {term.commentCount || 0}
                        </span>
                      </div>
                    </td>
                  )}
                  {!isTrashMode && (
                    <td>
                      {term.createdAt
                        ? new Date(term.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                  )}
                  <td>
                    <div className="action-cell">
                      <button
                        className="action-btn action-btn--view"
                        onClick={() => handleViewTerm(term)}
                        title={t("viewDetails")}
                      >
                        <Eye size={16} color="blue" />
                      </button>
                      {!isTrashMode && (
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => handleEditTerm(term)}
                          title={t("edit")}
                        >
                          <Edit size={16} color="orange" />
                        </button>
                      )}
                      {term.status === "pending" && !isTrashMode && (
                        <>
                          <button
                            className="action-btn action-btn--success"
                            onClick={() =>
                              handleStatusChange(term._id, "approved")
                            }
                            title={t("approve")}
                          >
                            <Check size={16} color="green" />
                          </button>
                          <button
                            className="action-btn action-btn--danger"
                            onClick={() =>
                              handleStatusChange(term._id, "rejected")
                            }
                            title={t("reject")}
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {!isTrashMode && (
                        <button
                          className="action-btn action-btn--danger"
                          onClick={() => {
                            setSelectedTerm(term);
                            setShowDeleteConfirm(true);
                          }}
                          title={t("delete")}
                        >
                          <Trash2 size={16} color="red" />
                        </button>
                      )}
                      {isTrashMode && (
                        <button
                          className="action-btn action-btn--success"
                          onClick={() => handleRestore(term._id)}
                          title={t("restore")}
                        >
                          <RotateCcw size={16} color="green" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <div className="admin-pagination__info">
            <label htmlFor="itemsPerPage">{t("perPage")} </label>
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
              {totalItems} {t("termsLabel")}
            </p>
          </div>
          <div className="admin-pagination__controls">
            <button
              className="admin-pagination__btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft
                size={16}
                color={currentPage === 1 ? "gray" : "blue"}
              />
              <ChevronLeft
                size={16}
                color={currentPage === 1 ? "gray" : "blue"}
              />
            </button>
            <button
              className="admin-pagination__btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              title={t("previousPage")}
            >
              <ChevronLeft
                size={16}
                color={currentPage === 1 ? "gray" : "blue"}
              />
            </button>
            {getPageNum().map((page, index) =>
              page === "..." ? (
                <span key={index} className="admin-pagination__ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`admin-pagination__btn ${
                    currentPage === page ? "admin-pagination__btn--active" : ""
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
              <ChevronRight
                size={16}
                color={currentPage === totalPages ? "gray" : "blue"}
              />
            </button>
            <button
              className="admin-pagination__btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title={t("lastPage")}
            >
              <ChevronRight
                size={16}
                color={currentPage === totalPages ? "gray" : "blue"}
              />
              <ChevronRight
                size={16}
                color={currentPage === totalPages ? "gray" : "blue"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selectedTerm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>{t("confirmDelete")}</h2>
              <button
                className="modal__close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <p>
                {t("confirmDeleteMsg")} <strong>{selectedTerm.term.vi}</strong>?
              </p>
              <p className="text-danger">{t("deleteIrreversible")}</p>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleDelete}
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkActionConfirm.action && (
        <div
          className="modal-overlay"
          onClick={() => setShowBulkActionConfirm({ action: null, count: 0 })}
        >
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>
                {showBulkActionConfirm.action === "approve"
                  ? t("confirmBulkApprove")
                  : showBulkActionConfirm.action === "reject"
                    ? t("confirmBulkReject")
                    : t("confirmBulkDelete")}
              </h2>
              <button
                className="modal__close"
                onClick={() =>
                  setShowBulkActionConfirm({ action: null, count: 0 })
                }
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <p>
                {showBulkActionConfirm.action === "delete"
                  ? t("confirmBulkDeleteMsg", {
                      count: showBulkActionConfirm.count,
                    })
                  : showBulkActionConfirm.action === "reject"
                    ? t("confirmBulkRejectMsg", {
                        count: showBulkActionConfirm.count,
                      })
                    : t("confirmBulkApproveMsg", {
                        count: showBulkActionConfirm.count,
                      })}
              </p>
              {showBulkActionConfirm.action === "delete" && (
                <p className="text-danger">{t("deleteIrreversible")}</p>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() =>
                  setShowBulkActionConfirm({ action: null, count: 0 })
                }
              >
                {t("cancel")}
              </button>
              <button
                className={`admin-btn ${
                  showBulkActionConfirm.action === "delete"
                    ? "admin-btn--danger"
                    : showBulkActionConfirm.action === "reject"
                      ? "admin-btn--warning"
                      : "admin-btn--success"
                }`}
                onClick={executeBulkAction}
              >
                {showBulkActionConfirm.action === "approve"
                  ? t("approve")
                  : showBulkActionConfirm.action === "reject"
                    ? t("reject")
                    : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentFilters={{
          category: categoryFilter,
          status: statusFilter,
          search: debouncedSearch,
        }}
        categoryName={getCategoryName(
          categories.find((c) => c.id === categoryFilter)?.name,
        )}
      />
    </div>
  );
}
