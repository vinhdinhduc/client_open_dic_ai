"use client";

import React from "react";
import { XCircle, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import {
  Contribution,
  ContributionOverrideData,
} from "@/services/contributionService";
import DiffCompareView from "./DiffCompareView";
import SafeHtml from "@/components/common/SafeHtml";
import RichTextEditor from "@/components/common/RichTextEditor";

interface ContributionDetailModalProps {
  contribution: Contribution;
  contributionDraft: ContributionOverrideData;
  moderatorNote: string;
  onContributionDraftChange: (draft: ContributionOverrideData) => void;
  onModeratorNoteChange: (note: string) => void;
  onClose: () => void;
  onApprove: (draft: ContributionOverrideData) => void;
  onReject: () => void;
  actionLoading: boolean;
}

export default function ContributionDetailModal({
  contribution,
  contributionDraft,
  moderatorNote,
  onContributionDraftChange,
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

  const getTermName = (contribution: Contribution) => {
    const term = contribution.term ?? contribution.targetTerm?.term;
    return term?.vi || term?.en || term?.lo || "N/A";
  };

  const getContributorName = (contribution: Contribution) => {
    return contribution.contributor?.fullName || "Ẩn danh";
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const updateDraftMultiLang = (
    field: "term" | "definition" | "detailedExplanation",
    lang: "vi" | "en" | "lo",
    value: string,
  ) => {
    const currentValue = contributionDraft[field]?.[lang] || "";
    if (currentValue === value) return;

    onContributionDraftChange({
      ...contributionDraft,
      [field]: {
        ...(contributionDraft[field] || {}),
        [lang]: value,
      },
    });
  };

  const updateDraftExample = (
    index: number,
    lang: "vi" | "en" | "lo",
    value: string,
  ) => {
    const nextExamples = [...(contributionDraft.examples || [])];
    const currentValue = nextExamples[index]?.[lang] || "";
    if (currentValue === value) return;

    nextExamples[index] = {
      ...(nextExamples[index] || {}),
      [lang]: value,
    };

    onContributionDraftChange({
      ...contributionDraft,
      examples: nextExamples,
    });
  };

  const addDraftExample = () => {
    onContributionDraftChange({
      ...contributionDraft,
      examples: [
        ...(contributionDraft.examples || []),
        { vi: "", en: "", lo: "" },
      ],
    });
  };

  const removeDraftExample = (index: number) => {
    onContributionDraftChange({
      ...contributionDraft,
      examples:
        contributionDraft.examples?.filter(
          (_, itemIndex) => itemIndex !== index,
        ) || [],
    });
  };

  const tagInput = (contributionDraft.tags || []).join(", ");
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
              <p className="detail-title">{getTermName(contribution)}</p>
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
                    <SafeHtml
                      content={contribution.definition?.vi || "-"}
                      as="p"
                    />
                  </div>
                  {contribution.definition?.lo && (
                    <div className="diff-field">
                      <label>Định nghĩa (Lo):</label>
                      <SafeHtml content={contribution.definition.lo} as="p" />
                    </div>
                  )}
                  {contribution.definition?.en && (
                    <div className="diff-field">
                      <label>Định nghĩa (En):</label>
                      <SafeHtml content={contribution.definition.en} as="p" />
                    </div>
                  )}
                  {contribution.detailedExplanation?.vi && (
                    <div className="diff-field">
                      <label>Giải thích chi tiết:</label>
                      <p>
                        <strong>🇻🇳</strong>{" "}
                        <SafeHtml
                          content={contribution.detailedExplanation.vi}
                          as="span"
                        />
                      </p>
                    </div>
                  )}
                  {contribution.detailedExplanation?.en && (
                    <div className="diff-field">
                      <label>Giải thích chi tiết (EN):</label>
                      <p>
                        <strong>🇬🇧</strong>{" "}
                        <SafeHtml
                          content={contribution.detailedExplanation.en}
                          as="span"
                        />
                      </p>
                    </div>
                  )}
                  {contribution.detailedExplanation?.lo && (
                    <div className="diff-field">
                      <label>Giải thích chi tiết (LO):</label>
                      <p>
                        <strong>🇱🇦</strong>{" "}
                        <SafeHtml
                          content={contribution.detailedExplanation.lo}
                          as="span"
                        />
                      </p>
                    </div>
                  )}
                  {contribution.examples &&
                    contribution.examples.length > 0 && (
                      <div className="diff-field">
                        <label>Ví dụ:</label>
                        {contribution.examples.map((ex, idx) => (
                          <div key={idx} className="diff-example">
                            <span className="diff-example__num">
                              {idx + 1}.
                            </span>
                            {ex.vi && (
                              <p>
                                🇻🇳 <SafeHtml content={ex.vi} as="span" />
                              </p>
                            )}
                            {ex.en && (
                              <p>
                                🇬🇧 <SafeHtml content={ex.en} as="span" />
                              </p>
                            )}
                            {ex.lo && (
                              <p>
                                🇱🇦 <SafeHtml content={ex.lo} as="span" />
                              </p>
                            )}
                          </div>
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

          {contribution.status === "pending" && (
            <div className="detail-section">
              <h3>Hoàn thiện nội dung trước khi duyệt</h3>

              <div className="moderation-edit-grid">
                <div className="detail-item detail-item--full">
                  <label>Thuật ngữ</label>
                  <div className="moderation-lang-grid">
                    {(["vi", "en", "lo"] as const).map((lang) => (
                      <div
                        key={`term-${lang}`}
                        className="moderation-edit-field"
                      >
                        <span className="moderation-edit-field__lang">
                          {lang.toUpperCase()}
                        </span>
                        <input
                          className="form-select moderation-edit-field__input"
                          value={contributionDraft.term?.[lang] || ""}
                          onChange={(e) =>
                            updateDraftMultiLang("term", lang, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-item detail-item--full">
                  <label>Định nghĩa</label>
                  <div className="moderation-lang-stack">
                    {(["vi", "en", "lo"] as const).map((lang) => (
                      <div
                        key={`definition-${lang}`}
                        className="moderation-edit-field moderation-edit-field--editor"
                      >
                        <span className="moderation-edit-field__lang">
                          {lang.toUpperCase()}
                        </span>
                        <RichTextEditor
                          key={`mod-definition-${lang}`}
                          value={contributionDraft.definition?.[lang] || ""}
                          onChange={(value: string) =>
                            updateDraftMultiLang("definition", lang, value)
                          }
                          placeholder={`Nhập định nghĩa (${lang.toUpperCase()})`}
                          minHeight={120}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-item detail-item--full">
                  <label>Giải thích chi tiết</label>
                  <div className="moderation-lang-stack">
                    {(["vi", "en", "lo"] as const).map((lang) => (
                      <div
                        key={`detailed-${lang}`}
                        className="moderation-edit-field moderation-edit-field--editor"
                      >
                        <span className="moderation-edit-field__lang">
                          {lang.toUpperCase()}
                        </span>
                        <RichTextEditor
                          key={`mod-detailed-${lang}`}
                          value={
                            contributionDraft.detailedExplanation?.[lang] || ""
                          }
                          onChange={(value: string) =>
                            updateDraftMultiLang(
                              "detailedExplanation",
                              lang,
                              value,
                            )
                          }
                          placeholder={`Nhập giải thích chi tiết (${lang.toUpperCase()})`}
                          minHeight={140}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-item detail-item--full">
                  <label>Ví dụ</label>
                  <div className="moderation-examples">
                    {(contributionDraft.examples || []).map(
                      (example, index) => (
                        <div
                          key={`example-${index}`}
                          className="moderation-example-card"
                        >
                          <div className="moderation-example-card__header">
                            <span>Ví dụ {index + 1}</span>
                            {(contributionDraft.examples?.length || 0) > 1 && (
                              <button
                                type="button"
                                className="btn btn--secondary btn--sm"
                                onClick={() => removeDraftExample(index)}
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                          {(["vi", "en", "lo"] as const).map((lang) => (
                            <div
                              key={`example-${index}-${lang}`}
                              className="moderation-edit-field"
                            >
                              <span className="moderation-edit-field__lang">
                                {lang.toUpperCase()}
                              </span>
                              <input
                                className="form-select moderation-edit-field__input"
                                value={example?.[lang] || ""}
                                onChange={(e) =>
                                  updateDraftExample(
                                    index,
                                    lang,
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      ),
                    )}
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={addDraftExample}
                    >
                      Thêm ví dụ
                    </button>
                  </div>
                </div>

                <div className="detail-item">
                  <label>Từ loại</label>
                  <select
                    className="form-select"
                    value={contributionDraft.partOfSpeech || ""}
                    onChange={(e) =>
                      onContributionDraftChange({
                        ...contributionDraft,
                        partOfSpeech: e.target.value,
                      })
                    }
                  >
                    <option value="">Chọn từ loại</option>
                    {Object.entries(PART_OF_SPEECH_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="detail-item">
                  <label>Tags</label>
                  <input
                    className="form-select moderation-edit-field__input"
                    value={tagInput}
                    onChange={(e) => {
                      const nextTags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean);
                      const currentTags = contributionDraft.tags || [];
                      const isSameTags =
                        currentTags.length === nextTags.length &&
                        currentTags.every(
                          (tag, index) => tag === nextTags[index],
                        );

                      if (isSameTags) return;

                      onContributionDraftChange({
                        ...contributionDraft,
                        tags: nextTags,
                      });
                    }}
                    placeholder="Nhập tag, cách nhau bởi dấu phẩy"
                  />
                </div>

                <div className="detail-item detail-item--full">
                  <label>Ghi chú người đóng góp</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={contributionDraft.contributorNote || ""}
                    onChange={(e) => {
                      if (
                        (contributionDraft.contributorNote || "") ===
                        e.target.value
                      ) {
                        return;
                      }

                      onContributionDraftChange({
                        ...contributionDraft,
                        contributorNote: e.target.value,
                      });
                    }}
                  />
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
                <p>{getContributorName(contribution)}</p>
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
              onClick={() => onApprove(contributionDraft)}
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
