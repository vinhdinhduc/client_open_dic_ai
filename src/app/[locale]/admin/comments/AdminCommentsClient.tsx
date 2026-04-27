"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Clock,
  User,
  Calendar,
  ExternalLink,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import commentService, { type Comment } from "@/services/commentService";
import { useTranslations } from "next-intl";
import "./comments.scss";

type TabType = "pending" | "approved" | "rejected" | "all";

export default function CommentsPage() {
  const t = useTranslations("adminComments");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [moderatorNote, setModeratorNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const itemsPerPage = 10;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await commentService.getAllComments({
        page: currentPage,
        limit: itemsPerPage,
        status: activeTab === "all" ? undefined : activeTab,
        search: searchQuery || undefined,
      });

      setComments(result.comments);
      setStats(result.stats);
      setTotalPages(result.pagination.pages);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchQuery]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchComments();
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="admin-badge admin-badge--warning">
            {t("pending")}
          </span>
        );
      case "approved":
        return (
          <span className="admin-badge admin-badge--success">
            {t("approved")}
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

  // Approve comment
  const handleApprove = async (id: string) => {
    setSubmitting(true);
    try {
      await commentService.moderateComment(id, {
        status: "approved",
        moderatorNote: moderatorNote || undefined,
      });

      toast.success(t("approveSuccess"));
      setShowDetailModal(false);
      setSelectedComment(null);
      setModeratorNote("");
      fetchComments(); // Refresh list
    } catch (error) {
      toast.error(t("approveError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Reject comment
  const handleReject = async (id: string) => {
    if (!moderatorNote.trim()) {
      toast.error(t("rejectReasonRequired"));
      return;
    }

    setSubmitting(true);
    try {
      await commentService.moderateComment(id, {
        status: "rejected",
        moderatorNote,
      });

      toast.success(t("rejectSuccess"));
      setShowDetailModal(false);
      setSelectedComment(null);
      setModeratorNote("");
      fetchComments(); // Refresh list
    } catch (error) {
      toast.error(t("rejectError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa bình luận
  const handleDelete = async () => {
    if (!selectedComment) return;

    setSubmitting(true);
    try {
      await commentService.deleteComment(selectedComment._id);

      toast.success(t("deleteSuccess"));
      setShowDeleteConfirm(false);
      setShowDetailModal(false);
      setSelectedComment(null);
      fetchComments(); // Refresh list
    } catch (error) {
      toast.error(t("deleteError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Open detail modal
  const openDetailModal = (comment: Comment) => {
    setSelectedComment(comment);
    setModeratorNote(comment.moderatorNote || "");
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="comments-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">{t("title")}</h1>
          <p className="admin-page-header__subtitle">{t("subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="comment-stats">
        <div className="comment-stat">
          <div className="comment-stat__icon">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="comment-stat__value">{stats.total}</span>
            <span className="comment-stat__label">{t("totalComments")}</span>
          </div>
        </div>
        <div className="comment-stat comment-stat--warning">
          <div className="comment-stat__icon">
            <Clock size={20} />
          </div>
          <div>
            <span className="comment-stat__value">{stats.pending}</span>
            <span className="comment-stat__label">{t("pending")}</span>
          </div>
        </div>
        <div className="comment-stat comment-stat--success">
          <div className="comment-stat__icon">
            <Check size={20} />
          </div>
          <div>
            <span className="comment-stat__value">{stats.approved}</span>
            <span className="comment-stat__label">{t("approved")}</span>
          </div>
        </div>
        <div className="comment-stat comment-stat--danger">
          <div className="comment-stat__icon">
            <XCircle size={20} />
          </div>
          <div>
            <span className="comment-stat__value">{stats.rejected}</span>
            <span className="comment-stat__label">{t("rejected")}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        {/* Tabs */}
        <div className="comment-tabs">
          <button
            className={`comment-tabs__tab ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("pending");
              setCurrentPage(1);
            }}
          >
            <Clock size={16} />
            {t("pending")}
            {stats.pending > 0 && (
              <span className="badge badge--warning">{stats.pending}</span>
            )}
          </button>
          <button
            className={`comment-tabs__tab ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("approved");
              setCurrentPage(1);
            }}
          >
            <Check size={16} />
            {t("approved")}
            <span className="badge badge--success">{stats.approved}</span>
          </button>
          <button
            className={`comment-tabs__tab ${activeTab === "rejected" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("rejected");
              setCurrentPage(1);
            }}
          >
            <XCircle size={16} />
            {t("rejected")}
            <span className="badge badge--danger">{stats.rejected}</span>
          </button>
          <button
            className={`comment-tabs__tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
          >
            <MessageSquare size={16} />
            {t("all")}
          </button>
        </div>

        {/* Search */}
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
        </div>

        {/* Comments List */}
        <div className="comment-list">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`comment-card comment-card--${comment.status}`}
            >
              <div className="comment-card__header">
                <div className="comment-author">
                  <div className="comment-author__avatar">
                    {comment.author?.fullName?.charAt(0) || "?"}
                  </div>
                  <div className="comment-author__info">
                    <span className="comment-author__name">
                      {comment.author?.fullName || "Unknown"}
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
                <Link
                  href={`/terms/${comment.term?._id}`}
                  className="term-link"
                  target="_blank"
                >
                  <ExternalLink size={12} />
                  {comment.term?.term?.vi || t("unknown")}
                </Link>
              </div>

              <p className="comment-card__content">{comment.content}</p>

              <div className="comment-card__meta">
                <span className="meta-item">
                  <Calendar size={14} />
                  {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                </span>
                {comment.moderator && (
                  <span className="meta-item meta-item--success">
                    <User size={14} />
                    {t("approvedBy")} {comment.moderator.fullName}
                  </span>
                )}
              </div>

              <div className="comment-card__actions">
                <button
                  className="admin-btn admin-btn--ghost"
                  onClick={() => openDetailModal(comment)}
                >
                  <Eye size={16} />
                  {t("details")}
                </button>

                {comment.status === "pending" && (
                  <>
                    <button
                      className="admin-btn admin-btn--success"
                      onClick={() => handleApprove(comment._id)}
                      disabled={submitting}
                    >
                      <Check size={16} />
                      {t("approve")}
                    </button>
                    <button
                      className="admin-btn admin-btn--warning"
                      onClick={() => openDetailModal(comment)}
                    >
                      <XCircle size={16} />
                      {t("reject")}
                    </button>
                  </>
                )}

                <button
                  className="admin-btn admin-btn--danger"
                  onClick={() => {
                    setSelectedComment(comment);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 size={16} />
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="admin-empty">
            <MessageSquare size={48} />
            <h3>{t("noComments")}</h3>
            <p>
              {activeTab === "pending"
                ? t("noPendingComments")
                : t("noMatchingComments")}
            </p>
          </div>
        )}

        {/* Pagination */}
        {comments.length > 0 && totalPages > 0 && (
          <div className="admin-pagination">
            <div className="admin-pagination__info">
              {t("showing")} {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, stats.total)} {t("of")}{" "}
              {stats.total} {t("commentsLabel")}
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
              <h2>{t("commentDetails")}</h2>
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
                <h4>
                  <User size={16} />
                  {t("commenter")}
                </h4>
                <div className="author-detail">
                  <div className="author-avatar-lg">
                    {selectedComment.author?.fullName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="author-name">
                      {selectedComment.author?.fullName || "Unknown"}
                    </p>
                    <p className="author-email">
                      {selectedComment.author?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Term Info */}
              <div className="detail-section">
                <h4>
                  <ExternalLink size={16} />
                  {t("term")}
                </h4>
                <Link
                  href={`/terms/${selectedComment.term?._id || ""}`}
                  className="term-detail-link"
                  target="_blank"
                >
                  {selectedComment.term?.term?.vi || t("unknown")}
                  {selectedComment.term?.term?.en &&
                    ` (${selectedComment.term.term.en})`}
                </Link>
              </div>

              {/* Comment Content */}
              <div className="detail-section">
                <h4>
                  <MessageSquare size={16} />
                  {t("commentContent")}
                </h4>
                <div className="comment-content-box">
                  <p>{selectedComment.content}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="detail-section">
                <h4>
                  <Calendar size={16} />
                  {t("info")}
                </h4>
                <div className="comment-stats-detail">
                  <div className="stat-item">
                    <Calendar size={16} />
                    <span>
                      {t("createdDate")}{" "}
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
                  <div className="stat-item">
                    {t("statusLabel")} {getStatusBadge(selectedComment.status)}
                  </div>
                </div>
              </div>

              {/* Moderator Note Input (for pending comments) */}
              {selectedComment.status === "pending" && (
                <div className="moderator-note-section">
                  <label>{t("moderatorNoteLabel")}</label>
                  <textarea
                    value={moderatorNote}
                    onChange={(e) => setModeratorNote(e.target.value)}
                    placeholder={t("moderatorNotePlaceholder")}
                    rows={3}
                  />
                </div>
              )}

              {/* Show existing moderator note */}
              {selectedComment.moderatorNote && (
                <div className="detail-section">
                  <h4>
                    <AlertTriangle size={16} />
                    {t("moderatorNoteTitle")}
                  </h4>
                  <div className="comment-content-box">
                    <p>{selectedComment.moderatorNote}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDetailModal(false)}
              >
                                {t("close")}
              </button>

              {selectedComment.status === "pending" && (
                <>
                  <button
                    className="admin-btn admin-btn--warning"
                    onClick={() => handleReject(selectedComment._id)}
                    disabled={submitting}
                  >
                    <XCircle size={16} />
                    {t("reject")}
                  </button>
                  <button
                    className="admin-btn admin-btn--success"
                    onClick={() => handleApprove(selectedComment._id)}
                    disabled={submitting}
                  >
                    <Check size={16} />
                    {t("approve")}
                  </button>
                </>
              )}

              <button
                className="admin-btn admin-btn--danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                {t("delete")}
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
              <h2>{t("confirmDelete")}</h2>
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
                  {t("deleteWarning")}
                </p>
                <div className="delete-preview">
                  <p>
                    &quot;
                    {selectedComment.content.length > 100
                      ? selectedComment.content.substring(0, 100) + "..."
                      : selectedComment.content}
                    &quot;
                  </p>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
              >
                {t("cancel")}
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? t("deleting") : t("deletePermanent")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
