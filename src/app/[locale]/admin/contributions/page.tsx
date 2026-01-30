"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  XCircle,
  Eye,
  MessageSquare,
  AlertTriangle,
  FileEdit,
  GitPullRequest,
  User,
  Calendar,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";

// Types
interface Contribution {
  _id: string;
  type: "new_term" | "edit_term" | "report" | "comment_report";
  status: "pending" | "approved" | "rejected";
  term?: {
    vi: string;
    en?: string;
    lo?: string;
  };
  originalTerm?: {
    _id: string;
    term: { vi: string };
  };
  definition?: {
    vi: string;
    en?: string;
  };
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  reportReason?: string;
  reportDetails?: string;
  contributor: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  reviewedBy?: {
    fullName: string;
  };
  reviewNote?: string;
  aiSuggestion?: {
    score: number;
    recommendation: "approve" | "reject" | "review";
    reasons: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

// Mock data
const mockContributions: Contribution[] = [
  {
    _id: "1",
    type: "new_term",
    status: "pending",
    term: { vi: "Deep Learning", en: "Deep Learning", lo: "ການຮຽນຮູ້ເລິກ" },
    definition: {
      vi: "Một nhánh của học máy sử dụng các mạng nơ-ron nhân tạo với nhiều tầng để học các đặc trưng phức tạp từ dữ liệu.",
      en: "A branch of machine learning using artificial neural networks with multiple layers to learn complex features from data.",
    },
    contributor: {
      _id: "u1",
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
    },
    aiSuggestion: {
      score: 92,
      recommendation: "approve",
      reasons: [
        "Định nghĩa chính xác và đầy đủ",
        "Thuật ngữ chưa tồn tại trong hệ thống",
        "Có đầy đủ bản dịch đa ngôn ngữ",
      ],
    },
    createdAt: "2026-01-28T10:30:00",
  },
  {
    _id: "2",
    type: "edit_term",
    status: "pending",
    originalTerm: { _id: "t1", term: { vi: "Machine Learning" } },
    changes: [
      {
        field: "definition.vi",
        oldValue: "Một nhánh của AI cho phép máy tính học từ dữ liệu.",
        newValue:
          "Một nhánh của trí tuệ nhân tạo cho phép máy tính học từ dữ liệu mà không cần lập trình rõ ràng, sử dụng các thuật toán thống kê để cải thiện hiệu suất.",
      },
    ],
    contributor: {
      _id: "u2",
      fullName: "Trần Thị B",
      email: "tranthib@email.com",
    },
    aiSuggestion: {
      score: 78,
      recommendation: "review",
      reasons: [
        "Định nghĩa mới chi tiết hơn",
        "Cần kiểm tra tính chính xác của thuật ngữ",
      ],
    },
    createdAt: "2026-01-27T15:45:00",
  },
  {
    _id: "3",
    type: "report",
    status: "pending",
    originalTerm: { _id: "t2", term: { vi: "Blockchain" } },
    reportReason: "Thông tin không chính xác",
    reportDetails:
      "Định nghĩa chưa đề cập đến tính phi tập trung và bảo mật của blockchain.",
    contributor: {
      _id: "u3",
      fullName: "Lê Văn C",
      email: "levanc@email.com",
    },
    createdAt: "2026-01-26T09:20:00",
  },
  {
    _id: "4",
    type: "new_term",
    status: "approved",
    term: { vi: "Internet of Things", en: "Internet of Things" },
    definition: {
      vi: "Mạng lưới các thiết bị vật lý được kết nối với nhau và với Internet, cho phép thu thập và trao đổi dữ liệu.",
    },
    contributor: {
      _id: "u1",
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
    },
    reviewedBy: { fullName: "Admin" },
    createdAt: "2026-01-20T11:00:00",
    updatedAt: "2026-01-22T14:30:00",
  },
  {
    _id: "5",
    type: "new_term",
    status: "rejected",
    term: { vi: "ABC XYZ" },
    definition: { vi: "Một thuật ngữ test không có ý nghĩa" },
    contributor: {
      _id: "u4",
      fullName: "Test User",
      email: "test@email.com",
    },
    reviewedBy: { fullName: "Moderator" },
    reviewNote: "Thuật ngữ không hợp lệ, không có ý nghĩa trong lĩnh vực nào.",
    createdAt: "2026-01-15T08:00:00",
    updatedAt: "2026-01-16T10:00:00",
  },
];

export default function ContributionsPage() {
  const [contributions, setContributions] =
    useState<Contribution[]>(mockContributions);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Filter contributions
  const filteredContributions = contributions.filter((contrib) => {
    const searchMatch =
      contrib.term?.vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contrib.originalTerm?.term.vi
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      contrib.contributor.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const typeMatch = typeFilter === "all" || contrib.type === typeFilter;
    const statusMatch =
      statusFilter === "all" || contrib.status === statusFilter;
    return searchMatch && typeMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredContributions.length / itemsPerPage);
  const paginatedContributions = filteredContributions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const pendingCount = contributions.filter(
    (c) => c.status === "pending",
  ).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "new_term":
        return <GitPullRequest size={16} />;
      case "edit_term":
        return <FileEdit size={16} />;
      case "report":
        return <AlertTriangle size={16} />;
      case "comment_report":
        return <MessageSquare size={16} />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "new_term":
        return "Thuật ngữ mới";
      case "edit_term":
        return "Chỉnh sửa";
      case "report":
        return "Báo cáo";
      case "comment_report":
        return "Báo cáo bình luận";
      default:
        return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "new_term":
        return "type-badge--new";
      case "edit_term":
        return "type-badge--edit";
      case "report":
        return "type-badge--report";
      default:
        return "";
    }
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

  const getAIRecommendationClass = (recommendation: string) => {
    switch (recommendation) {
      case "approve":
        return "ai-recommend--approve";
      case "reject":
        return "ai-recommend--reject";
      default:
        return "ai-recommend--review";
    }
  };

  const handleApprove = (id: string) => {
    setContributions((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, status: "approved" as const } : c,
      ),
    );
    setShowDetailModal(false);
    setSelectedContribution(null);
  };

  const handleReject = () => {
    if (selectedContribution) {
      setContributions((prev) =>
        prev.map((c) =>
          c._id === selectedContribution._id
            ? { ...c, status: "rejected" as const, reviewNote: rejectNote }
            : c,
        ),
      );
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedContribution(null);
      setRejectNote("");
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải danh sách đóng góp...</p>
      </div>
    );
  }

  return (
    <div className="contributions-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Kiểm duyệt đóng góp</h1>
          <p className="admin-page-header__subtitle">
            Xem xét và phê duyệt các đóng góp từ cộng đồng
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="admin-btn admin-btn--secondary">
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="contribution-stats">
        <div className="contribution-stat contribution-stat--pending">
          <span className="contribution-stat__value">{pendingCount}</span>
          <span className="contribution-stat__label">Chờ duyệt</span>
        </div>
        <div className="contribution-stat contribution-stat--new">
          <span className="contribution-stat__value">
            {
              contributions.filter(
                (c) => c.type === "new_term" && c.status === "pending",
              ).length
            }
          </span>
          <span className="contribution-stat__label">Thuật ngữ mới</span>
        </div>
        <div className="contribution-stat contribution-stat--edit">
          <span className="contribution-stat__value">
            {
              contributions.filter(
                (c) => c.type === "edit_term" && c.status === "pending",
              ).length
            }
          </span>
          <span className="contribution-stat__label">Chỉnh sửa</span>
        </div>
        <div className="contribution-stat contribution-stat--report">
          <span className="contribution-stat__value">
            {
              contributions.filter(
                (c) => c.type === "report" && c.status === "pending",
              ).length
            }
          </span>
          <span className="contribution-stat__label">Báo cáo</span>
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
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="admin-filters__select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="new_term">Thuật ngữ mới</option>
            <option value="edit_term">Chỉnh sửa</option>
            <option value="report">Báo cáo</option>
          </select>

          <select
            className="admin-filters__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        {/* Contribution List */}
        <div className="contribution-list">
          {paginatedContributions.map((contribution) => (
            <div key={contribution._id} className="contribution-card">
              <div className="contribution-card__header">
                <span
                  className={`type-badge ${getTypeBadgeClass(contribution.type)}`}
                >
                  {getTypeIcon(contribution.type)}
                  {getTypeLabel(contribution.type)}
                </span>
                {getStatusBadge(contribution.status)}
              </div>

              <div className="contribution-card__body">
                <h3 className="contribution-card__title">
                  {contribution.term?.vi ||
                    contribution.originalTerm?.term.vi ||
                    "N/A"}
                </h3>
                {contribution.term?.en && (
                  <p className="contribution-card__subtitle">
                    {contribution.term.en}
                  </p>
                )}
                {contribution.type === "report" &&
                  contribution.reportReason && (
                    <p className="contribution-card__reason">
                      <AlertTriangle size={14} />
                      {contribution.reportReason}
                    </p>
                  )}
                {contribution.type === "edit_term" && contribution.changes && (
                  <div className="contribution-card__changes">
                    <span className="changes-label">Thay đổi:</span>
                    <span className="changes-field">
                      {contribution.changes[0]?.field.replace(".", " → ")}
                    </span>
                  </div>
                )}
              </div>

              {contribution.aiSuggestion &&
                contribution.status === "pending" && (
                  <div
                    className={`ai-recommendation ${getAIRecommendationClass(
                      contribution.aiSuggestion.recommendation,
                    )}`}
                  >
                    <Sparkles size={14} />
                    <span className="ai-score">
                      {contribution.aiSuggestion.score}%
                    </span>
                    <span className="ai-label">
                      {contribution.aiSuggestion.recommendation === "approve"
                        ? "Nên duyệt"
                        : contribution.aiSuggestion.recommendation === "reject"
                          ? "Nên từ chối"
                          : "Cần xem xét"}
                    </span>
                  </div>
                )}

              <div className="contribution-card__meta">
                <span className="meta-item">
                  <User size={14} />
                  {contribution.contributor.fullName}
                </span>
                <span className="meta-item">
                  <Calendar size={14} />
                  {new Date(contribution.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="contribution-card__actions">
                <button
                  className="admin-btn admin-btn--ghost"
                  onClick={() => {
                    setSelectedContribution(contribution);
                    setShowDetailModal(true);
                  }}
                >
                  <Eye size={16} />
                  Chi tiết
                </button>
                {contribution.status === "pending" && (
                  <>
                    <button
                      className="admin-btn admin-btn--success"
                      onClick={() => handleApprove(contribution._id)}
                    >
                      <Check size={16} />
                      Duyệt
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={() => {
                        setSelectedContribution(contribution);
                        setShowRejectModal(true);
                      }}
                    >
                      <XCircle size={16} />
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredContributions.length === 0 && (
          <div className="admin-empty">
            <GitPullRequest size={48} />
            <h3>Không có đóng góp nào</h3>
            <p>Chưa có đóng góp nào phù hợp với bộ lọc hiện tại</p>
          </div>
        )}

        {/* Pagination */}
        {filteredContributions.length > 0 && (
          <div className="admin-pagination">
            <div className="admin-pagination__info">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredContributions.length,
              )}{" "}
              trong {filteredContributions.length} đóng góp
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
      {showDetailModal && selectedContribution && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Chi tiết đóng góp</h2>
              <button
                className="modal__close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <div className="detail-header">
                <span
                  className={`type-badge ${getTypeBadgeClass(selectedContribution.type)}`}
                >
                  {getTypeIcon(selectedContribution.type)}
                  {getTypeLabel(selectedContribution.type)}
                </span>
                {getStatusBadge(selectedContribution.status)}
              </div>

              {/* Contributor Info */}
              <div className="detail-section">
                <h4>Người đóng góp</h4>
                <div className="contributor-info">
                  <div className="contributor-avatar">
                    {selectedContribution.contributor.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="contributor-name">
                      {selectedContribution.contributor.fullName}
                    </p>
                    <p className="contributor-email">
                      {selectedContribution.contributor.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content based on type */}
              {selectedContribution.type === "new_term" &&
                selectedContribution.term && (
                  <>
                    <div className="detail-section">
                      <h4>Thuật ngữ</h4>
                      <div className="term-translations">
                        <div className="translation-item">
                          <span className="flag">🇻🇳</span>
                          <span>{selectedContribution.term.vi}</span>
                        </div>
                        {selectedContribution.term.en && (
                          <div className="translation-item">
                            <span className="flag">🇬🇧</span>
                            <span>{selectedContribution.term.en}</span>
                          </div>
                        )}
                        {selectedContribution.term.lo && (
                          <div className="translation-item">
                            <span className="flag">🇱🇦</span>
                            <span>{selectedContribution.term.lo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Định nghĩa</h4>
                      <p>{selectedContribution.definition?.vi}</p>
                      {selectedContribution.definition?.en && (
                        <>
                          <h4 className="mt-3">Definition (English)</h4>
                          <p>{selectedContribution.definition.en}</p>
                        </>
                      )}
                    </div>
                  </>
                )}

              {selectedContribution.type === "edit_term" &&
                selectedContribution.changes && (
                  <div className="detail-section">
                    <h4>Thay đổi đề xuất</h4>
                    {selectedContribution.changes.map((change, idx) => (
                      <div key={idx} className="change-item">
                        <span className="change-field">{change.field}</span>
                        <div className="change-values">
                          <div className="change-old">
                            <span className="change-label">Cũ:</span>
                            <p>{change.oldValue}</p>
                          </div>
                          <div className="change-new">
                            <span className="change-label">Mới:</span>
                            <p>{change.newValue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {selectedContribution.type === "report" && (
                <div className="detail-section">
                  <h4>Nội dung báo cáo</h4>
                  <div className="report-content">
                    <p className="report-reason">
                      <strong>Lý do:</strong>{" "}
                      {selectedContribution.reportReason}
                    </p>
                    <p className="report-details">
                      <strong>Chi tiết:</strong>{" "}
                      {selectedContribution.reportDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Suggestion */}
              {selectedContribution.aiSuggestion && (
                <div className="detail-section">
                  <h4>
                    <Sparkles size={16} /> Gợi ý từ AI
                  </h4>
                  <div
                    className={`ai-suggestion-box ${getAIRecommendationClass(
                      selectedContribution.aiSuggestion.recommendation,
                    )}`}
                  >
                    <div className="ai-suggestion-header">
                      <span className="ai-score-large">
                        {selectedContribution.aiSuggestion.score}%
                      </span>
                      <span className="ai-recommendation">
                        {selectedContribution.aiSuggestion.recommendation ===
                        "approve"
                          ? "Đề xuất duyệt"
                          : selectedContribution.aiSuggestion.recommendation ===
                              "reject"
                            ? "Đề xuất từ chối"
                            : "Cần xem xét kỹ"}
                      </span>
                    </div>
                    <ul className="ai-reasons">
                      {selectedContribution.aiSuggestion.reasons.map(
                        (reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Review Note (if rejected) */}
              {selectedContribution.reviewNote && (
                <div className="detail-section">
                  <h4>Ghi chú từ kiểm duyệt viên</h4>
                  <div className="review-note">
                    {selectedContribution.reviewNote}
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
              {selectedContribution.status === "pending" && (
                <>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                  >
                    <XCircle size={16} />
                    Từ chối
                  </button>
                  <button
                    className="admin-btn admin-btn--success"
                    onClick={() => handleApprove(selectedContribution._id)}
                  >
                    <Check size={16} />
                    Duyệt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Từ chối đóng góp</h2>
              <button
                className="modal__close"
                onClick={() => setShowRejectModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <div className="admin-form">
                <div className="form-group">
                  <label>Lý do từ chối</label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Nhập lý do từ chối để người đóng góp có thể cải thiện..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleReject}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .contribution-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .contribution-stat {
          flex: 1;
          min-width: 140px;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }

        .contribution-stat--pending {
          background: linear-gradient(
            135deg,
            rgba(245, 158, 11, 0.1) 0%,
            rgba(217, 119, 6, 0.1) 100%
          );
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .contribution-stat--new {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(37, 99, 235, 0.1) 100%
          );
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .contribution-stat--edit {
          background: linear-gradient(
            135deg,
            rgba(168, 85, 247, 0.1) 0%,
            rgba(139, 92, 246, 0.1) 100%
          );
          border: 1px solid rgba(168, 85, 247, 0.2);
        }

        .contribution-stat--report {
          background: linear-gradient(
            135deg,
            rgba(239, 68, 68, 0.1) 0%,
            rgba(220, 38, 38, 0.1) 100%
          );
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .contribution-stat__value {
          display: block;
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .contribution-stat__label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .contribution-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contribution-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .contribution-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .contribution-card__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .type-badge--new {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .type-badge--edit {
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
        }

        .type-badge--report {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .contribution-card__body {
          margin-bottom: 12px;
        }

        .contribution-card__title {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .contribution-card__subtitle {
          margin: 0 0 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .contribution-card__reason {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
          font-size: 14px;
          color: #ef4444;
        }

        .contribution-card__changes {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .changes-label {
          margin-right: 4px;
        }

        .changes-field {
          color: #a855f7;
        }

        .ai-recommendation {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .ai-recommend--approve {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .ai-recommend--reject {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .ai-recommend--review {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .ai-score {
          font-weight: 700;
        }

        .contribution-card__meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .contribution-card__actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Modal styles */
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
          max-width: 450px;
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

        .detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
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

        .detail-section p {
          margin: 0;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .contributor-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contributor-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .contributor-name {
          margin: 0;
          font-weight: 500;
          color: var(--text-primary);
        }

        .contributor-email {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .term-translations {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .translation-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .translation-item .flag {
          font-size: 20px;
        }

        .change-item {
          margin-bottom: 16px;
        }

        .change-field {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .change-values {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .change-old,
        .change-new {
          padding: 12px;
          border-radius: 8px;
        }

        .change-old {
          background: rgba(239, 68, 68, 0.05);
          border-left: 3px solid #ef4444;
        }

        .change-new {
          background: rgba(16, 185, 129, 0.05);
          border-left: 3px solid #10b981;
        }

        .change-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .change-old p,
        .change-new p {
          margin: 0;
          font-size: 14px;
        }

        .report-content {
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .report-reason,
        .report-details {
          margin: 0 0 8px;
          font-size: 14px;
        }

        .report-details {
          margin-bottom: 0;
        }

        .ai-suggestion-box {
          padding: 16px;
          border-radius: 12px;
        }

        .ai-suggestion-box.ai-recommend--approve {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .ai-suggestion-box.ai-recommend--reject {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .ai-suggestion-box.ai-recommend--review {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .ai-suggestion-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .ai-score-large {
          font-size: 24px;
          font-weight: 700;
        }

        .ai-recommendation {
          font-weight: 500;
        }

        .ai-reasons {
          margin: 0;
          padding-left: 20px;
        }

        .ai-reasons li {
          margin-bottom: 4px;
          font-size: 14px;
          color: var(--text-primary);
        }

        .review-note {
          padding: 12px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          color: #ef4444;
          font-size: 14px;
        }

        .mt-3 {
          margin-top: 16px;
        }

        .admin-form .form-group {
          margin-bottom: 16px;
        }

        .admin-form label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .admin-form textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
          resize: vertical;
          min-height: 100px;
        }

        .admin-form textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        @media (max-width: 768px) {
          .contribution-stats {
            flex-direction: column;
          }

          .contribution-card__actions {
            flex-direction: column;
          }

          .contribution-card__actions .admin-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
