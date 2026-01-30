"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";

// Types
interface Term {
  _id: string;
  term: {
    vi: string;
    en?: string;
    lo?: string;
  };
  definition: {
    vi: string;
    en?: string;
    lo?: string;
  };
  category: {
    _id: string;
    name: { vi: string };
  };
  status: "pending" | "approved" | "rejected";
  createdBy: {
    fullName: string;
    email: string;
  };
  viewCount: number;
  favoriteCount: number;
  commentCount: number;
  createdAt: string;
}

// Mock data
const mockTerms: Term[] = [
  {
    _id: "1",
    term: {
      vi: "Trí tuệ nhân tạo",
      en: "Artificial Intelligence",
      lo: "ປັນຍາປະດິດ",
    },
    definition: {
      vi: "Là ngành khoa học máy tính nghiên cứu việc tạo ra các máy móc có khả năng thực hiện các nhiệm vụ thường đòi hỏi trí tuệ của con người.",
      en: "A branch of computer science dealing with the simulation of intelligent behavior in computers.",
    },
    category: { _id: "1", name: { vi: "Công nghệ thông tin" } },
    status: "approved",
    createdBy: { fullName: "Nguyễn Văn A", email: "nguyenvana@email.com" },
    viewCount: 5420,
    favoriteCount: 234,
    commentCount: 56,
    createdAt: "2025-10-15",
  },
  {
    _id: "2",
    term: {
      vi: "Machine Learning",
      en: "Machine Learning",
      lo: "ການຮຽນຮູ້ເຄື່ອງຈັກ",
    },
    definition: {
      vi: "Một nhánh của trí tuệ nhân tạo cho phép máy tính học từ dữ liệu mà không cần lập trình rõ ràng.",
    },
    category: { _id: "1", name: { vi: "Công nghệ thông tin" } },
    status: "approved",
    createdBy: { fullName: "Trần Thị B", email: "tranthib@email.com" },
    viewCount: 4380,
    favoriteCount: 189,
    commentCount: 42,
    createdAt: "2025-11-20",
  },
  {
    _id: "3",
    term: { vi: "Blockchain", en: "Blockchain" },
    definition: {
      vi: "Công nghệ sổ cái phân tán, lưu trữ dữ liệu trong các khối được liên kết với nhau bằng mật mã.",
    },
    category: { _id: "1", name: { vi: "Công nghệ thông tin" } },
    status: "pending",
    createdBy: { fullName: "Lê Văn C", email: "levanc@email.com" },
    viewCount: 0,
    favoriteCount: 0,
    commentCount: 0,
    createdAt: "2026-01-28",
  },
  {
    _id: "4",
    term: { vi: "Kinh tế vĩ mô", en: "Macroeconomics" },
    definition: {
      vi: "Ngành kinh tế học nghiên cứu hoạt động của nền kinh tế ở phạm vi quốc gia và quốc tế.",
    },
    category: { _id: "2", name: { vi: "Kinh tế" } },
    status: "approved",
    createdBy: { fullName: "Phạm Văn D", email: "phamvand@email.com" },
    viewCount: 2150,
    favoriteCount: 87,
    commentCount: 23,
    createdAt: "2025-09-10",
  },
  {
    _id: "5",
    term: { vi: "Quang hợp", en: "Photosynthesis" },
    definition: {
      vi: "Quá trình sinh hóa mà thực vật sử dụng ánh sáng mặt trời để tổng hợp chất hữu cơ từ CO2 và nước.",
    },
    category: { _id: "3", name: { vi: "Sinh học" } },
    status: "rejected",
    createdBy: { fullName: "Hoàng Thị E", email: "hoangthie@email.com" },
    viewCount: 0,
    favoriteCount: 0,
    commentCount: 0,
    createdAt: "2026-01-25",
  },
];

const mockCategories = [
  { _id: "1", name: "Công nghệ thông tin" },
  { _id: "2", name: "Kinh tế" },
  { _id: "3", name: "Sinh học" },
  { _id: "4", name: "Nông nghiệp" },
];

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>(mockTerms);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Filter terms
  const filteredTerms = terms.filter((term) => {
    const matchSearch =
      term.term.vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.term.en &&
        term.term.en.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory =
      categoryFilter === "all" || term.category._id === categoryFilter;
    const matchStatus = statusFilter === "all" || term.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filteredTerms.length / itemsPerPage);
  const paginatedTerms = filteredTerms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  const handleDelete = () => {
    if (selectedTerm) {
      setTerms((prev) => prev.filter((t) => t._id !== selectedTerm._id));
      setShowDeleteConfirm(false);
      setSelectedTerm(null);
    }
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
          <button className="admin-btn admin-btn--secondary">
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
          <span className="terms-stat__value">{terms.length}</span>
          <span className="terms-stat__label">Tổng thuật ngữ</span>
        </div>
        <div className="terms-stat">
          <span className="terms-stat__value terms-stat__value--success">
            {terms.filter((t) => t.status === "approved").length}
          </span>
          <span className="terms-stat__label">Đã duyệt</span>
        </div>
        <div className="terms-stat">
          <span className="terms-stat__value terms-stat__value--warning">
            {terms.filter((t) => t.status === "pending").length}
          </span>
          <span className="terms-stat__label">Chờ duyệt</span>
        </div>
        <div className="terms-stat">
          <span className="terms-stat__value terms-stat__value--danger">
            {terms.filter((t) => t.status === "rejected").length}
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
            className="admin-filters__select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {mockCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="admin-filters__select"
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
                      <span className="term-cell__vi">{term.term.vi}</span>
                      {term.term.en && (
                        <span className="term-cell__en">{term.term.en}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-cell">
                      <Tag size={14} />
                      {term.category.name.vi}
                    </span>
                  </td>
                  <td>{getStatusBadge(term.status)}</td>
                  <td>
                    <div className="creator-cell">
                      <span>{term.createdBy.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="stats-cell">
                      <span>👁 {term.viewCount}</span>
                      <span>❤️ {term.favoriteCount}</span>
                      <span>💬 {term.commentCount}</span>
                    </div>
                  </td>
                  <td>
                    {new Date(term.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <div className="action-cell">
                      <button
                        className="action-btn"
                        onClick={() => {
                          setSelectedTerm(term);
                          setShowDetailModal(true);
                        }}
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => {
                          setSelectedTerm(term);
                          setShowEditModal(true);
                        }}
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
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
                            <Check size={16} />
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
                        <Trash2 size={16} />
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
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredTerms.length)} trong{" "}
            {filteredTerms.length} thuật ngữ
          </div>
          <div className="admin-pagination__controls">
            <button
              className="admin-pagination__btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                className={`admin-pagination__btn ${
                  page === currentPage ? "active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="admin-pagination__btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTerm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Chi tiết thuật ngữ</h2>
              <button
                className="modal__close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <div className="term-detail-modal">
                <div className="term-detail-modal__header">
                  <h3>{selectedTerm.term.vi}</h3>
                  {getStatusBadge(selectedTerm.status)}
                </div>

                <div className="term-detail-modal__translations">
                  {selectedTerm.term.en && (
                    <div className="translation-row">
                      <span className="flag">🇬🇧</span>
                      <span>{selectedTerm.term.en}</span>
                    </div>
                  )}
                  {selectedTerm.term.lo && (
                    <div className="translation-row">
                      <span className="flag">🇱🇦</span>
                      <span>{selectedTerm.term.lo}</span>
                    </div>
                  )}
                </div>

                <div className="term-detail-modal__section">
                  <h4>Định nghĩa (Tiếng Việt)</h4>
                  <p>{selectedTerm.definition.vi}</p>
                </div>

                {selectedTerm.definition.en && (
                  <div className="term-detail-modal__section">
                    <h4>Định nghĩa (English)</h4>
                    <p>{selectedTerm.definition.en}</p>
                  </div>
                )}

                <div className="term-detail-modal__meta">
                  <div className="meta-item">
                    <span className="meta-label">Danh mục</span>
                    <span className="meta-value">
                      {selectedTerm.category.name.vi}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Người tạo</span>
                    <span className="meta-value">
                      {selectedTerm.createdBy.fullName}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Ngày tạo</span>
                    <span className="meta-value">
                      {new Date(selectedTerm.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                </div>

                <div className="term-detail-modal__stats">
                  <div className="stat-box">
                    <span className="stat-value">{selectedTerm.viewCount}</span>
                    <span className="stat-label">Lượt xem</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">
                      {selectedTerm.favoriteCount}
                    </span>
                    <span className="stat-label">Yêu thích</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">
                      {selectedTerm.commentCount}
                    </span>
                    <span className="stat-label">Bình luận</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              {selectedTerm.status === "pending" && (
                <>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => {
                      handleStatusChange(selectedTerm._id, "rejected");
                      setShowDetailModal(false);
                    }}
                  >
                    Từ chối
                  </button>
                  <button
                    className="admin-btn admin-btn--success"
                    onClick={() => {
                      handleStatusChange(selectedTerm._id, "approved");
                      setShowDetailModal(false);
                    }}
                  >
                    Duyệt
                  </button>
                </>
              )}
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowEditModal(true);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

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

      <style jsx>{`
        .terms-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .terms-stat {
          flex: 1;
          min-width: 150px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .terms-stat__value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .terms-stat__value--success {
          color: #10b981;
        }

        .terms-stat__value--warning {
          color: #f59e0b;
        }

        .terms-stat__value--danger {
          color: #ef4444;
        }

        .terms-stat__label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .table-container {
          overflow-x: auto;
        }

        .term-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .term-cell__vi {
          font-weight: 500;
          color: var(--text-primary);
        }

        .term-cell__en {
          font-size: 12px;
          color: var(--text-secondary);
          font-style: italic;
        }

        .category-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #667eea;
        }

        .creator-cell {
          font-size: 13px;
        }

        .stats-cell {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .action-cell {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .action-btn--success:hover {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .action-btn--danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal {
          background: var(--bg-card);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal--sm {
          max-width: 400px;
        }

        .modal--lg {
          max-width: 700px;
        }

        .modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal__header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .modal__close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
        }

        .modal__close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .modal__body {
          padding: 24px;
          overflow-y: auto;
        }

        .modal__footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
        }

        .term-detail-modal__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .term-detail-modal__header h3 {
          margin: 0;
          font-size: 24px;
          color: var(--text-primary);
        }

        .term-detail-modal__translations {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .translation-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .translation-row .flag {
          font-size: 18px;
        }

        .term-detail-modal__section {
          margin-bottom: 16px;
        }

        .term-detail-modal__section h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0 0 8px;
        }

        .term-detail-modal__section p {
          margin: 0;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .term-detail-modal__meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .meta-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .term-detail-modal__stats {
          display: flex;
          gap: 16px;
        }

        .stat-box {
          flex: 1;
          text-align: center;
          padding: 16px;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.1) 0%,
            rgba(118, 75, 162, 0.1) 100%
          );
          border-radius: 12px;
        }

        .stat-box .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
        }

        .stat-box .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .text-danger {
          color: #ef4444;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .terms-stats {
            flex-direction: column;
          }

          .term-detail-modal__meta {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
