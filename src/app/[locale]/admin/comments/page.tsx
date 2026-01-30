"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Trash2,
  Eye,
  MessageSquare,
  AlertTriangle,
  Flag,
  User,
  Calendar,
  Filter,
  MoreVertical,
  ThumbsUp,
  Reply,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// Types
interface Comment {
  _id: string;
  content: string;
  term: {
    _id: string;
    term: { vi: string; en?: string };
  };
  author: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  status: "active" | "hidden" | "reported";
  likes: number;
  replies?: number;
  reports?: {
    reason: string;
    reportedBy: string;
    createdAt: string;
  }[];
  createdAt: string;
}

// Mock data
const mockComments: Comment[] = [
  {
    _id: "1",
    content: "Định nghĩa này rất chi tiết và dễ hiểu. Cảm ơn đã chia sẻ!",
    term: {
      _id: "t1",
      term: { vi: "Trí tuệ nhân tạo", en: "Artificial Intelligence" },
    },
    author: {
      _id: "u1",
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
    },
    status: "active",
    likes: 12,
    replies: 3,
    createdAt: "2026-01-28T10:30:00",
  },
  {
    _id: "2",
    content: "Có thể bổ sung thêm ví dụ ứng dụng trong thực tế không ạ?",
    term: {
      _id: "t1",
      term: { vi: "Trí tuệ nhân tạo", en: "Artificial Intelligence" },
    },
    author: { _id: "u2", fullName: "Trần Thị B", email: "tranthib@email.com" },
    status: "active",
    likes: 5,
    replies: 1,
    createdAt: "2026-01-27T14:20:00",
  },
  {
    _id: "3",
    content: "Thuật ngữ này còn được gọi là học máy nữa phải không?",
    term: { _id: "t2", term: { vi: "Machine Learning" } },
    author: { _id: "u3", fullName: "Lê Văn C", email: "levanc@email.com" },
    status: "active",
    likes: 3,
    createdAt: "2026-01-26T09:15:00",
  },
  {
    _id: "4",
    content: "Nội dung spam quảng cáo không liên quan đến từ điển...",
    term: { _id: "t3", term: { vi: "Blockchain" } },
    author: { _id: "u4", fullName: "Spam User", email: "spam@email.com" },
    status: "reported",
    likes: 0,
    reports: [
      {
        reason: "Spam/Quảng cáo",
        reportedBy: "Nguyễn Văn A",
        createdAt: "2026-01-25T11:00:00",
      },
      {
        reason: "Nội dung không phù hợp",
        reportedBy: "Trần Thị B",
        createdAt: "2026-01-25T12:30:00",
      },
    ],
    createdAt: "2026-01-25T08:00:00",
  },
  {
    _id: "5",
    content:
      "Định nghĩa này sai rồi! Blockchain không chỉ dùng cho tiền điện tử.",
    term: { _id: "t3", term: { vi: "Blockchain" } },
    author: { _id: "u5", fullName: "Phạm Văn D", email: "phamvand@email.com" },
    status: "reported",
    likes: 8,
    reports: [
      {
        reason: "Thông tin sai lệch",
        reportedBy: "Admin",
        createdAt: "2026-01-24T16:00:00",
      },
    ],
    createdAt: "2026-01-24T15:00:00",
  },
  {
    _id: "6",
    content: "Bình luận đã bị ẩn do vi phạm quy định cộng đồng.",
    term: { _id: "t4", term: { vi: "Cloud Computing" } },
    author: { _id: "u6", fullName: "Hidden User", email: "hidden@email.com" },
    status: "hidden",
    likes: 0,
    createdAt: "2026-01-20T10:00:00",
  },
];

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Filter comments
  const filteredComments = comments.filter((comment) => {
    const searchMatch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      comment.term.term.vi.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch =
      statusFilter === "all" || comment.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const reportedCount = comments.filter((c) => c.status === "reported").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="admin-badge admin-badge--success">Hoạt động</span>
        );
      case "hidden":
        return (
          <span className="admin-badge admin-badge--secondary">Đã ẩn</span>
        );
      case "reported":
        return (
          <span className="admin-badge admin-badge--danger">Bị báo cáo</span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, status: "active" as const, reports: [] } : c,
      ),
    );
  };

  const handleHide = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status: "hidden" as const } : c)),
    );
    setShowDetailModal(false);
    setSelectedComment(null);
  };

  const handleDelete = () => {
    if (selectedComment) {
      setComments((prev) => prev.filter((c) => c._id !== selectedComment._id));
      setShowDeleteConfirm(false);
      setShowDetailModal(false);
      setSelectedComment(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải danh sách bình luận...</p>
      </div>
    );
  }

  return (
    <div className="comments-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Quản lý bình luận</h1>
          <p className="admin-page-header__subtitle">
            Kiểm duyệt và quản lý bình luận trong hệ thống
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="comment-stats">
        <div className="comment-stat">
          <MessageSquare size={20} className="comment-stat__icon" />
          <div>
            <span className="comment-stat__value">{comments.length}</span>
            <span className="comment-stat__label">Tổng bình luận</span>
          </div>
        </div>
        <div className="comment-stat comment-stat--success">
          <Check size={20} className="comment-stat__icon" />
          <div>
            <span className="comment-stat__value">
              {comments.filter((c) => c.status === "active").length}
            </span>
            <span className="comment-stat__label">Đang hoạt động</span>
          </div>
        </div>
        <div className="comment-stat comment-stat--danger">
          <Flag size={20} className="comment-stat__icon" />
          <div>
            <span className="comment-stat__value">{reportedCount}</span>
            <span className="comment-stat__label">Bị báo cáo</span>
          </div>
        </div>
        <div className="comment-stat comment-stat--secondary">
          <Eye size={20} className="comment-stat__icon" />
          <div>
            <span className="comment-stat__value">
              {comments.filter((c) => c.status === "hidden").length}
            </span>
            <span className="comment-stat__label">Đã ẩn</span>
          </div>
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
              placeholder="Tìm kiếm bình luận..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="admin-filters__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="reported">Bị báo cáo</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        {/* Comments List */}
        <div className="comment-list">
          {paginatedComments.map((comment) => (
            <div
              key={comment._id}
              className={`comment-card ${comment.status === "reported" ? "comment-card--reported" : ""} ${comment.status === "hidden" ? "comment-card--hidden" : ""}`}
            >
              <div className="comment-card__header">
                <div className="comment-author">
                  <div className="comment-author__avatar">
                    {comment.author.fullName.charAt(0)}
                  </div>
                  <div className="comment-author__info">
                    <span className="comment-author__name">
                      {comment.author.fullName}
                    </span>
                    <span className="comment-author__date">
                      {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                {getStatusBadge(comment.status)}
              </div>

              <div className="comment-card__term">
                <span className="term-link">
                  <ExternalLink size={12} />
                  {comment.term.term.vi}
                </span>
              </div>

              <p className="comment-card__content">{comment.content}</p>

              <div className="comment-card__meta">
                <span className="meta-item">
                  <ThumbsUp size={14} />
                  {comment.likes} lượt thích
                </span>
                {comment.replies && (
                  <span className="meta-item">
                    <Reply size={14} />
                    {comment.replies} phản hồi
                  </span>
                )}
                {comment.reports && comment.reports.length > 0 && (
                  <span className="meta-item meta-item--danger">
                    <AlertTriangle size={14} />
                    {comment.reports.length} báo cáo
                  </span>
                )}
              </div>

              <div className="comment-card__actions">
                <button
                  className="admin-btn admin-btn--ghost"
                  onClick={() => {
                    setSelectedComment(comment);
                    setShowDetailModal(true);
                  }}
                >
                  <Eye size={16} />
                  Chi tiết
                </button>
                {comment.status === "reported" && (
                  <>
                    <button
                      className="admin-btn admin-btn--success"
                      onClick={() => handleApprove(comment._id)}
                    >
                      <Check size={16} />
                      Duyệt
                    </button>
                    <button
                      className="admin-btn admin-btn--warning"
                      onClick={() => handleHide(comment._id)}
                    >
                      <Eye size={16} />
                      Ẩn
                    </button>
                  </>
                )}
                {comment.status === "hidden" && (
                  <button
                    className="admin-btn admin-btn--success"
                    onClick={() => handleApprove(comment._id)}
                  >
                    <Check size={16} />
                    Hiển thị lại
                  </button>
                )}
                <button
                  className="admin-btn admin-btn--danger"
                  onClick={() => {
                    setSelectedComment(comment);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredComments.length === 0 && (
          <div className="admin-empty">
            <MessageSquare size={48} />
            <h3>Không có bình luận nào</h3>
            <p>Chưa có bình luận nào phù hợp với bộ lọc hiện tại</p>
          </div>
        )}

        {/* Pagination */}
        {filteredComments.length > 0 && (
          <div className="admin-pagination">
            <div className="admin-pagination__info">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredComments.length)}{" "}
              trong {filteredComments.length} bình luận
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
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComment && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal modal--md" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Chi tiết bình luận</h2>
              <button
                className="modal__close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              {/* Author Info */}
              <div className="detail-section">
                <h4>Người bình luận</h4>
                <div className="author-detail">
                  <div className="author-avatar-lg">
                    {selectedComment.author.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="author-name">
                      {selectedComment.author.fullName}
                    </p>
                    <p className="author-email">
                      {selectedComment.author.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Term Info */}
              <div className="detail-section">
                <h4>Thuật ngữ</h4>
                <Link
                  href={`/terms/${selectedComment.term._id}`}
                  className="term-detail-link"
                >
                  <ExternalLink size={14} />
                  {selectedComment.term.term.vi}
                  {selectedComment.term.term.en &&
                    ` (${selectedComment.term.term.en})`}
                </Link>
              </div>

              {/* Comment Content */}
              <div className="detail-section">
                <h4>Nội dung bình luận</h4>
                <div className="comment-content-box">
                  <p>{selectedComment.content}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="detail-section">
                <h4>Thống kê</h4>
                <div className="comment-stats-detail">
                  <div className="stat-item">
                    <ThumbsUp size={16} />
                    <span>{selectedComment.likes} lượt thích</span>
                  </div>
                  {selectedComment.replies && (
                    <div className="stat-item">
                      <Reply size={16} />
                      <span>{selectedComment.replies} phản hồi</span>
                    </div>
                  )}
                  <div className="stat-item">
                    <Calendar size={16} />
                    <span>
                      {new Date(selectedComment.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reports */}
              {selectedComment.reports &&
                selectedComment.reports.length > 0 && (
                  <div className="detail-section">
                    <h4>
                      <AlertTriangle size={16} /> Báo cáo (
                      {selectedComment.reports.length})
                    </h4>
                    <div className="reports-list">
                      {selectedComment.reports.map((report, idx) => (
                        <div key={idx} className="report-item">
                          <div className="report-header">
                            <span className="report-reason">
                              {report.reason}
                            </span>
                            <span className="report-date">
                              {new Date(report.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </span>
                          </div>
                          <p className="report-by">
                            Báo cáo bởi: {report.reportedBy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              {selectedComment.status === "hidden" && (
                <button
                  className="admin-btn admin-btn--success"
                  onClick={() => handleApprove(selectedComment._id)}
                >
                  Hiển thị lại
                </button>
              )}
              {selectedComment.status !== "hidden" && (
                <button
                  className="admin-btn admin-btn--warning"
                  onClick={() => handleHide(selectedComment._id)}
                >
                  Ẩn bình luận
                </button>
              )}
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Xóa bình luận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selectedComment && (
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
              <div className="delete-warning">
                <AlertTriangle size={48} />
                <p>
                  Bạn có chắc chắn muốn xóa bình luận này? Hành động này không
                  thể hoàn tác.
                </p>
                <div className="delete-preview">
                  <p>"{selectedComment.content.substring(0, 100)}..."</p>
                </div>
              </div>
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
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .comment-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .comment-stat {
          flex: 1;
          min-width: 160px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
        }

        .comment-stat__icon {
          color: #667eea;
        }

        .comment-stat--success .comment-stat__icon {
          color: #10b981;
        }

        .comment-stat--danger .comment-stat__icon {
          color: #ef4444;
        }

        .comment-stat--secondary .comment-stat__icon {
          color: #6b7280;
        }

        .comment-stat__value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .comment-stat__label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .comment-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comment-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .comment-card:hover {
          border-color: #667eea;
        }

        .comment-card--reported {
          border-left: 4px solid #ef4444;
        }

        .comment-card--hidden {
          opacity: 0.6;
          border-left: 4px solid #6b7280;
        }

        .comment-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .comment-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .comment-author__avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        .comment-author__info {
          display: flex;
          flex-direction: column;
        }

        .comment-author__name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .comment-author__date {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .comment-card__term {
          margin-bottom: 12px;
        }

        .term-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 4px;
          font-size: 13px;
          text-decoration: none;
        }

        .comment-card__content {
          margin: 0 0 16px;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .comment-card__meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .meta-item--danger {
          color: #ef4444;
        }

        .comment-card__actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Modal Styles */
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
          max-width: 420px;
        }

        .modal--md {
          max-width: 550px;
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

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section h4 {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .author-detail {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar-lg {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 20px;
        }

        .author-name {
          margin: 0;
          font-weight: 500;
          color: var(--text-primary);
        }

        .author-email {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .term-detail-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--bg-secondary);
          color: #667eea;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .term-detail-link:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .comment-content-box {
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .comment-content-box p {
          margin: 0;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .comment-stats-detail {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .report-item {
          padding: 12px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          border-radius: 8px;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .report-reason {
          font-weight: 500;
          color: #ef4444;
        }

        .report-date {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .report-by {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .delete-warning {
          text-align: center;
        }

        .delete-warning svg {
          color: #ef4444;
          margin-bottom: 16px;
        }

        .delete-warning p {
          margin: 0 0 16px;
          color: var(--text-primary);
        }

        .delete-preview {
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .delete-preview p {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .comment-stats {
            flex-direction: column;
          }

          .comment-card__actions {
            flex-direction: column;
          }

          .comment-card__actions .admin-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
