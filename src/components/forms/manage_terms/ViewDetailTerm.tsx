"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Tag,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  User,
  Languages,
  FileText,
  Check,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getTermById, deleteTerm, updateTerm } from "@/services/termService";
import { TermDetail, MultiLangText, Example } from "@/components/terms/types";
import "./ViewDetailTerm.scss";

interface ViewDetailTermProps {
  termId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
}

type LangKey = "vi" | "en" | "lo";

const LANG_TABS: { key: LangKey; label: string; flag: string }[] = [
  { key: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "lo", label: "ພາສາລາວ", flag: "🇱🇦" },
];

const PART_OF_SPEECH_LABELS: Record<string, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  phrase: "Cụm từ",
  abbreviation: "Từ viết tắt",
};

export function ViewDetailTerm({
  termId,
  onEdit,
  onDelete,
  onBack,
}: ViewDetailTermProps) {
  const router = useRouter();
  const pathname = usePathname();
  const termsBasePath = pathname?.includes("/moderator/")
    ? "/moderator/terms"
    : "/admin/terms";
  const [term, setTerm] = useState<TermDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LangKey>("vi");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTerm = async () => {
      setLoading(true);
      try {
        const data = await getTermById(termId);
        if (data) {
          setTerm(data);
        } else {
          toast.error("Không tìm thấy thuật ngữ");
          handleBack();
        }
      } catch (error) {
        console.error("Error fetching term:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchTerm();
  }, [termId]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(termsBasePath);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      router.push(`${termsBasePath}/edit/${termId}`);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteTerm(termId);
      if (result.success) {
        toast.success("Đã xóa thuật ngữ thành công");
        if (onDelete) {
          onDelete();
        } else {
          router.push(termsBasePath);
        }
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi xóa");
      }
    } catch (error) {
      console.error("Error deleting term:", error);
      toast.error("Không thể xóa thuật ngữ");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    if (!term) return;
    setUpdatingStatus(true);
    try {
      const result = await updateTerm(termId, { status: newStatus });
      if (result.success) {
        setTerm({ ...term, status: newStatus });
        toast.success(
          newStatus === "approved"
            ? "Đã duyệt thuật ngữ"
            : "Đã từ chối thuật ngữ",
        );
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Đã sao chép");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="status-badge status-badge--success">Đã duyệt</span>
        );
      case "pending":
        return (
          <span className="status-badge status-badge--warning">Chờ duyệt</span>
        );
      case "rejected":
        return (
          <span className="status-badge status-badge--danger">Từ chối</span>
        );
      default:
        return null;
    }
  };

  const getMultiLangValue = (
    obj: MultiLangText | undefined,
    lang: LangKey,
  ): string => {
    if (!obj) return "";
    return obj[lang] || "";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="view-detail-term view-detail-term--loading">
        <div className="loading-spinner">
          <Loader2 size={48} className="spin" />
          <p>Đang tải thông tin thuật ngữ...</p>
        </div>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="view-detail-term view-detail-term--error">
        <div className="error-content">
          <h2>Không tìm thấy thuật ngữ</h2>
          <p>Thuật ngữ này có thể đã bị xóa hoặc không tồn tại.</p>
          <button className="btn btn--primary" onClick={handleBack}>
            <ArrowLeft size={18} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-detail-term">
      {/* Header */}
      <div className="view-detail-term__header">
        <button type="button" className="back-btn" onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="header-info">
          <div className="header-title">
            <h1>
              {term.term.vi || term.term.en || term.term.lo || "Không có tên"}
            </h1>
            {getStatusBadge(term.status || "pending")}
          </div>
          <div className="header-meta">
            <span className="meta-item">
              <Eye size={14} />
              {term.viewCount} lượt xem
            </span>
            <span className="meta-item">
              <Heart size={14} />
              {term.favoriteCount || term.favoritesCount || 0} yêu thích
            </span>
            <span className="meta-item">
              <MessageCircle size={14} />
              {term.commentCount || 0} bình luận
            </span>
          </div>
        </div>

        <div className="header-actions">
          {term.status === "pending" && (
            <>
              <button
                className="btn btn--success"
                onClick={() => handleStatusChange("approved")}
                disabled={updatingStatus}
              >
                <Check size={16} />
                Duyệt
              </button>
              <button
                className="btn btn--danger-outline"
                onClick={() => handleStatusChange("rejected")}
                disabled={updatingStatus}
              >
                <XCircle size={16} />
                Từ chối
              </button>
            </>
          )}
          <button className="btn btn--primary" onClick={handleEdit}>
            <Edit size={16} />
            Chỉnh sửa
          </button>
          <button
            className="btn btn--danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="view-detail-term__tabs">
        {LANG_TABS.map(({ key, label, flag }) => (
          <button
            key={key}
            type="button"
            className={`tab-btn ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="tab-flag">{flag}</span>
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="view-detail-term__content">
        <div className="content-grid">
          {/* Main Column */}
          <div className="content-column content-column--main">
            {/* Term Name */}
            <div className="detail-section">
              <div className="section-header">
                <Languages size={18} />
                <h3>Thuật ngữ</h3>
                <button
                  className="copy-btn"
                  onClick={() =>
                    copyToClipboard(getMultiLangValue(term.term, activeTab))
                  }
                  title="Sao chép"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="section-content">
                <p className="term-name">
                  {getMultiLangValue(term.term, activeTab) || (
                    <span className="empty-text">Chưa có nội dung</span>
                  )}
                </p>
              </div>
            </div>

            {/* Definition */}
            <div className="detail-section">
              <div className="section-header">
                <FileText size={18} />
                <h3>Định nghĩa</h3>
              </div>
              <div className="section-content">
                <p>
                  {getMultiLangValue(term.definition, activeTab) || (
                    <span className="empty-text">Chưa có định nghĩa</span>
                  )}
                </p>
              </div>
            </div>

            {/* Detailed Explanation */}
            <div className="detail-section">
              <div className="section-header">
                <BookOpen size={18} />
                <h3>Giải thích chi tiết</h3>
              </div>
              <div className="section-content">
                <p>
                  {getMultiLangValue(term.detailedExplanation, activeTab) || (
                    <span className="empty-text">
                      Chưa có giải thích chi tiết
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Examples */}
            <div className="detail-section">
              <div className="section-header">
                <FileText size={18} />
                <h3>Ví dụ ({term.examples?.length || 0})</h3>
              </div>
              <div className="section-content">
                {term.examples && term.examples.length > 0 ? (
                  <ul className="examples-list">
                    {term.examples.map((example: Example, index: number) => (
                      <li key={index} className="example-item">
                        <span className="example-number">{index + 1}</span>
                        <span className="example-text">
                          {getMultiLangValue(example, activeTab) || (
                            <span className="empty-text">Chưa có nội dung</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">Chưa có ví dụ nào</p>
                )}
              </div>
            </div>

            {/* All Translations Summary */}
            <div className="detail-section detail-section--translations">
              <div className="section-header">
                <Languages size={18} />
                <h3>Tất cả ngôn ngữ</h3>
              </div>
              <div className="section-content">
                <div className="translations-grid">
                  {LANG_TABS.map(({ key, label, flag }) => (
                    <div key={key} className="translation-card">
                      <div className="translation-header">
                        <span className="flag">{flag}</span>
                        <span className="lang-name">{label}</span>
                      </div>
                      <div className="translation-content">
                        <div className="translation-row">
                          <span className="label">Thuật ngữ:</span>
                          <span className="value">
                            {getMultiLangValue(term.term, key) || "-"}
                          </span>
                        </div>
                        <div className="translation-row">
                          <span className="label">Định nghĩa:</span>
                          <span className="value">
                            {getMultiLangValue(term.definition, key) || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="content-column content-column--sidebar">
            {/* Meta Info */}
            <div className="sidebar-card">
              <h4>Thông tin</h4>
              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-label">
                    <Tag size={14} />
                    Danh mục
                  </span>
                  <span className="meta-value">
                    {term.category?.name?.vi || "Không có danh mục"}
                  </span>
                </div>

                {term.partOfSpeech && (
                  <div className="meta-row">
                    <span className="meta-label">
                      <FileText size={14} />
                      Từ loại
                    </span>
                    <span className="meta-value">
                      {PART_OF_SPEECH_LABELS[term.partOfSpeech] ||
                        term.partOfSpeech}
                    </span>
                  </div>
                )}

                <div className="meta-row">
                  <span className="meta-label">
                    <User size={14} />
                    Người tạo
                  </span>
                  <span className="meta-value">
                    {term.createdBy?.fullName || "Ẩn danh"}
                  </span>
                </div>

                {term.lastModifiedBy && (
                  <div className="meta-row">
                    <span className="meta-label">
                      <Edit size={14} />
                      Người sửa cuối
                    </span>
                    <span className="meta-value">
                      {term.lastModifiedBy.fullName}
                    </span>
                  </div>
                )}

                <div className="meta-row">
                  <span className="meta-label">
                    <Clock size={14} />
                    Ngày tạo
                  </span>
                  <span className="meta-value">
                    {formatDate(term.createdAt)}
                  </span>
                </div>

                <div className="meta-row">
                  <span className="meta-label">
                    <Clock size={14} />
                    Cập nhật lần cuối
                  </span>
                  <span className="meta-value">
                    {formatDate(term.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="sidebar-card">
              <h4>Tags ({term.tags?.length || 0})</h4>
              <div className="tags-list">
                {term.tags && term.tags.length > 0 ? (
                  term.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="empty-text">Chưa có tag nào</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="sidebar-card sidebar-card--stats">
              <h4>Thống kê</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <Eye size={20} />
                  <span className="stat-value">{term.viewCount}</span>
                  <span className="stat-label">Lượt xem</span>
                </div>
                <div className="stat-item">
                  <Heart size={20} />
                  <span className="stat-value">
                    {term.favoriteCount || term.favoritesCount || 0}
                  </span>
                  <span className="stat-label">Yêu thích</span>
                </div>
                <div className="stat-item">
                  <MessageCircle size={20} />
                  <span className="stat-value">{term.commentCount || 0}</span>
                  <span className="stat-label">Bình luận</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="sidebar-card">
              <h4>Thao tác nhanh</h4>
              <div className="quick-actions">
                <button
                  className="quick-action-btn"
                  onClick={() => window.open(`/terms/${termId}`, "_blank")}
                >
                  <ExternalLink size={16} />
                  Xem trang công khai
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="modal__body">
              <p>
                Bạn có chắc chắn muốn xóa thuật ngữ{" "}
                <strong>{term.term.vi}</strong>?
              </p>
              <p className="warning-text">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal__footer">
              <button
                className="btn btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                className="btn btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewDetailTerm;
