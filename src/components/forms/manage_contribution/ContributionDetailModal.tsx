"use client";

import React from "react";
import { XCircle, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { Contribution } from "@/services/contributionService";
import DiffCompareView from "./DiffCompareView";

interface ContributionDetailModalProps {
  contribution: Contribution;
  moderatorNote: string;
  onModeratorNoteChange: (note: string) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  actionLoading: boolean;
}

export default function ContributionDetailModal({
  contribution,
  moderatorNote,
  onModeratorNoteChange,
  onClose,
  onApprove,
  onReject,
  actionLoading,
}: ContributionDetailModalProps) {
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
      edit_term: { label: "Chỉnh sửa", className: "badge--info" },
      new_term: { label: "Thêm mới", className: "badge--success" },
    };
    return typeConfig[type] || typeConfig.new_term;
  };

  const PART_OF_SPEECH_LABELS: Record<string, string> = {
    noun: "Danh từ",
    verb: "Động từ",
    adjective: "Tính từ",
    adverb: "Trạng từ",
    phrase: "Cụm từ",
    abbreviation: "Từ viết tắt",
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

  const getTermName = () => {
    if (contribution.term?.vi) {
      return contribution.term.vi;
    }
    if (contribution.targetTerm?.term?.vi) {
      return contribution.targetTerm.term.vi;
    }
    return "Thuật ngữ mới";
  };

  const getContributorName = () => {
    return contribution.contributor?.fullName || "Ẩn danh";
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Chi tiết gợi ý chỉnh sửa</h2>
          <button className="modal__close" onClick={onClose}>
            <XCircle size={24} />
          </button>
        </div>
        <div className="modal__body">
          {/* Term Info Section */}
          <div className="detail-section">
            <h3>Thông tin thuật ngữ</h3>
            <div className="detail-item">
              <span
                className={`badge ${getTypeBadge(contribution.type).className}`}
              >
                {getTypeBadge(contribution.type).label}
              </span>
              <p className="detail-title">{getTermName()}</p>
              {contribution.targetTerm && (
                <a
                  href={`/terms/${contribution.targetTerm.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-link"
                >
                  <ExternalLink size={14} />
                  Xem thuật ngữ gốc
                </a>
              )}
            </div>
          </div>

          {/* Edit Term Comparison */}
          {contribution.type === "edit_term" && contribution.targetTerm && (
            <div className="detail-section">
              <h3>So sánh thay đổi</h3>

              <DiffCompareView contribution={contribution} />
            </div>
          )}

          {/* New Term Content */}
          {contribution.type === "new_term" && (
            <div className="detail-section">
              <h3>Nội dung thuật ngữ mới</h3>
              <div className="diff-box diff-box--suggested">
                <div className="diff-content">
                  <div className="diff-field">
                    <label>Thuật ngữ (Vi):</label>
                    <p>{contribution.term?.vi || "-"}</p>
                  </div>
                  {contribution.term?.lo && (
                    <div className="diff-field">
                      <label>Thuật ngữ (Lo):</label>
                      <p>{contribution.term.lo}</p>
                    </div>
                  )}
                  {contribution.term?.en && (
                    <div className="diff-field">
                      <label>Thuật ngữ (En):</label>
                      <p>{contribution.term.en}</p>
                    </div>
                  )}
                  <div className="diff-field">
                    <label>Định nghĩa (Vi):</label>
                    <p>{contribution.definition?.vi || "-"}</p>
                  </div>
                  {contribution.definition?.lo && (
                    <div className="diff-field">
                      <label>Định nghĩa (Lo):</label>
                      <p>{contribution.definition.lo}</p>
                    </div>
                  )}
                  {contribution.definition?.en && (
                    <div className="diff-field">
                      <label>Định nghĩa (En):</label>
                      <p>{contribution.definition.en}</p>
                    </div>
                  )}
                  {contribution.detailedExplanation?.vi && (
                    <div className="diff-field">
                      <label>Giải thích chi tiết:</label>
                      <p>{contribution.detailedExplanation.vi}</p>
                    </div>
                  )}
                  {contribution.examples &&
                    contribution.examples.length > 0 && (
                      <div className="diff-field">
                        <label>Ví dụ:</label>
                        {contribution.examples.map((ex, idx) => (
                          <p key={idx}>{ex.vi || ex.lo || ex.en}</p>
                        ))}
                      </div>
                    )}
                  {contribution.contributorNote && (
                    <div className="diff-field">
                      <label>Ghi chú người đóng góp:</label>
                      <p>{contribution.contributorNote}</p>
                    </div>
                  )}
                  {contribution.partOfSpeech && (
                    <div className="diff-field">
                      <label>Từ loại:</label>
                      <p>
                        {PART_OF_SPEECH_LABELS[contribution.partOfSpeech] ||
                          contribution.partOfSpeech}
                      </p>
                    </div>
                  )}
                  {contribution.tags && contribution.tags.length > 0 && (
                    <div className="diff-field">
                      <label>Tags:</label>
                      <div className="diff-tags">
                        {contribution.tags.map((tag, idx) => (
                          <span key={idx} className="badge badge--outline">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contributor Info */}
          <div className="detail-section">
            <h3>Thông tin người đóng góp</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Người gửi:</label>
                <p>{getContributorName()}</p>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <p>{contribution.contributor?.email || "-"}</p>
              </div>
              <div className="detail-item">
                <label>Danh mục:</label>
                <p>{contribution.category?.name?.vi || "-"}</p>
              </div>
              <div className="detail-item">
                <label>Thời gian:</label>
                <p>{formatDate(contribution.createdAt)}</p>
              </div>
              <div className="detail-item">
                <label>Trạng thái:</label>
                <span
                  className={`badge ${getStatusBadge(contribution.status).className}`}
                >
                  {getStatusBadge(contribution.status).label}
                </span>
              </div>
            </div>
          </div>

          {/* Moderator Note Input */}
          {contribution.status === "pending" && (
            <div className="detail-section">
              <h3>Ghi chú kiểm duyệt viên</h3>
              <div className="form-group">
                <textarea
                  value={moderatorNote}
                  onChange={(e) => onModeratorNoteChange(e.target.value)}
                  placeholder="Nhập ghi chú về quyết định kiểm duyệt (không bắt buộc)..."
                  rows={3}
                  className="form-textarea"
                />
              </div>
            </div>
          )}

          {/* Moderation Info (if already moderated) */}
          {contribution.moderator && (
            <div className="detail-section">
              <h3>Thông tin kiểm duyệt</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Người kiểm duyệt:</label>
                  <p>{contribution.moderator.fullName}</p>
                </div>
                <div className="detail-item">
                  <label>Thời gian:</label>
                  <p>
                    {contribution.moderatedAt
                      ? formatDate(contribution.moderatedAt)
                      : "-"}
                  </p>
                </div>
                {contribution.moderatorNote && (
                  <div className="detail-item detail-item--full">
                    <label>Ghi chú:</label>
                    <p>{contribution.moderatorNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {contribution.status === "pending" && (
          <div className="modal__footer">
            <button
              className="btn btn--secondary"
              onClick={onReject}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 size={16} className="spinning" />
              ) : (
                <XCircle size={16} />
              )}
              Từ chối
            </button>
            <button
              className="btn btn--primary"
              onClick={onApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 size={16} className="spinning" />
              ) : (
                <CheckCircle size={16} />
              )}
              Phê duyệt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
