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
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getAllTerms, getTermStats, deleteTerm } from "@/services/termService";
import categoryService, { Category } from "@/services/categoryService";
import { useLanguage } from "@/hooks";
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

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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

  // Debounce search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getCategories();
        setCategories(result.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, itemsPerPage]);

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
      const resultTerm: ApiResponse<GetTermsAdminResponse> = await getAllTerms(
        categoryFilter,
        statusFilter,
        currentPage,
        itemsPerPage,
        debouncedSearch,
      );

      if (resultTerm.success) {
        setTerms(resultTerm.data.terms as Term[]);
        setTotalPages(resultTerm.data.pagination.pages);
        setTotalItems(resultTerm.data.pagination.total);
      } else {
        toast.error(
          resultTerm.message || "Đã xảy ra lỗi khi tải danh sách thuật ngữ.",
        );
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast.error("Đã xảy ra lỗi khi tải danh sách thuật ngữ.");
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu đã được filter và phân trang từ API
  const paginatedTerms = terms;
  const getPageNum = () => {
    const pages: (string | number)[] = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      //Luôn hiện thị trang 1 nếu số trang quá giới hạn
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
          <span className="admin-badge admin-badge--success">Đã duyệt</span>
        );
      case "pending":
        return (
          <span className="admin-badge admin-badge--warning">Chờ duyệt</span>
        );
      case "rejected":
        return <span className="admin-badge admin-badge--danger">Từ chối</span>;
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

  const handleDelete = async () => {
    if (selectedTerm) {
      setTerms((prev) => prev.filter((t) => t._id !== selectedTerm._id));
      setShowDeleteConfirm(false);
      setSelectedTerm(null);
      setLoading(true);
      try {
        const res = await deleteTerm(selectedTerm._id);
        if (res.success) {
          toast.success("Đã xóa thuật ngữ thành công.");

          fetchTerms();
        } else {
          toast.error(res.message || "Đã xảy ra lỗi khi xóa thuật ngữ.");
        }
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi xóa thuật ngữ.");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleEditTerm = (term: Term) => {
    router.push(`/admin/terms/edit/${term._id}`);
  };

  const handleViewTerm = (term: Term) => {
    router.push(`/admin/terms/${term._id}`);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải danh sách thuật ngữ...</p>
      </div>
    );
  }

  return (
    <div className="terms-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Quản lý thuật ngữ</h1>
          <p className="admin-page-header__subtitle">
            Quản lý tất cả thuật ngữ trong hệ thống từ điển
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={() => setShowExportModal(true)}
          >
            <Download size={16} />
            Xuất Excel
          </button>
          <Link href="/admin/import" className="admin-btn admin-btn--secondary">
            <Upload size={16} />
            Nhập dữ liệu
          </Link>
          <Link
            href="/admin/terms/new"
            className="admin-btn admin-btn--primary"
          >
            <Plus size={16} />
            Thêm thuật ngữ
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="terms-stats">
        <div className="terms-stat">
          <span className="terms-stat__value">{stats.total}</span>
          <span className="terms-stat__label">Tổng thuật ngữ</span>
        </div>
        <div className="terms-stat">
          <span className="terms-stat__value terms-stat__value--success">
            {stats.approved}
          </span>
          <span className="terms-stat__label">Đã duyệt</span>
        </div>
        <div className="terms-stat">
          <span className="terms-stat__value terms-stat__value--warning">
            {stats.pending}
          </span>
          <span className="terms-stat__label">Chờ duyệt</span>
        </div>
        <div className="terms-stat">
          <span className="terms-stat__value terms-stat__value--danger">
            {stats.rejected}
          </span>
          <span className="terms-stat__label">Từ chối</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-filters__search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm thuật ngữ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={`admin-filters__select ${categoryFilter !== "all" ? "has-value" : ""}`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat.name)}
              </option>
            ))}
          </select>

          <select
            className={`admin-filters__select ${statusFilter !== "all" ? "has-value" : ""}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thuật ngữ</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Người tạo</th>
                <th>Thống kê</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTerms.map((term) => (
                <tr key={term._id}>
                  <td>
                    <div className="term-cell">
                      <span className="term-cell__vi">
                        {term.term.vi || ""}
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
                        "Không có danh mục"}
                    </span>
                  </td>
                  <td>{getStatusBadge(term.status || "pending")}</td>
                  <td>
                    <div className="creator-cell">
                      <span>{term.createdBy?.fullName || "Ẩn danh"}</span>
                    </div>
                  </td>
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
                  <td>
                    {term.createdAt
                      ? new Date(term.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    <div className="action-cell">
                      <button
                        className="action-btn action-btn--view"
                        onClick={() => handleViewTerm(term)}
                        title="Xem chi tiết"
                      >
                        <Eye size={16} color="blue" />
                      </button>
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => handleEditTerm(term)}
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} color="orange" />
                      </button>
                      {term.status === "pending" && (
                        <>
                          <button
                            className="action-btn action-btn--success"
                            onClick={() =>
                              handleStatusChange(term._id, "approved")
                            }
                            title="Duyệt"
                          >
                            <Check size={16} color="green" />
                          </button>
                          <button
                            className="action-btn action-btn--danger"
                            onClick={() =>
                              handleStatusChange(term._id, "rejected")
                            }
                            title="Từ chối"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn action-btn--danger"
                        onClick={() => {
                          setSelectedTerm(term);
                          setShowDeleteConfirm(true);
                        }}
                        title="Xóa"
                      >
                        <Trash2 size={16} color="red" />
                      </button>
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
            <label htmlFor="itemsPerPage">Số lượng mỗi trang </label>
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
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} trong{" "}
              {totalItems} thuật ngữ
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
              title="Trang trước"
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
              title="Trang sau"
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
              title="Trang cuối"
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
              <h2>Xác nhận xóa</h2>
              <button
                className="modal__close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <p>
                Bạn có chắc chắn muốn xóa thuật ngữ{" "}
                <strong>{selectedTerm.term.vi}</strong>?
              </p>
              <p className="text-danger">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleDelete}
              >
                Xóa
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
