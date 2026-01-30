"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import { TermDetail, Comment } from "./types";
import {
  getTermComments,
  toggleFavorite,
  checkFavorite,
} from "@/services/termService";
import CommentSection from "./CommentSection";
import ReportModal from "./ReportModal";
import SuggestEditModal from "./SuggestEditModal";
import Link from "next/link";
import {
  Heart,
  Eye,
  MessageCircle,
  Flag,
  Edit3,
  Tag,
  ArrowLeft,
  BookOpen,
  Share2,
  Clock,
  User as UserIcon,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./TermDetailView.scss";

interface TermDetailViewProps {
  term: TermDetail;
}

export default function TermDetailView({ term }: TermDetailViewProps) {
  const t = useTranslations("term");
  const { currentLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load comments và check favorite khi mount
  useEffect(() => {
    loadComments();
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [term._id, isAuthenticated]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const data = await getTermComments(term._id);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const result = await checkFavorite(term._id);
      setIsFavorited(result);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  // Helpers
  const getText = (
    multiLang: { vi?: string; en?: string; lo?: string } | undefined,
  ): string => {
    if (!multiLang) return "";
    return multiLang[currentLanguage] || multiLang.vi || multiLang.en || "";
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handlers
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu yêu thích");
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setFavoriteLoading(true);
    try {
      const result = await toggleFavorite(term._id);
      setIsFavorited(result.isFavorited);
      toast.success(
        result.isFavorited ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích",
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để báo cáo");
      return;
    }
    setShowReportModal(true);
  };

  const handleEditClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để gợi ý chỉnh sửa");
      return;
    }
    setShowEditModal(true);
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <div className="term-detail">
      {/* Breadcrumb */}
      <nav className="term-detail__breadcrumb">
        <Link href="/" className="breadcrumb-link">
          Trang chủ
        </Link>
        <ChevronRight size={16} />
        <Link
          href={`/terms?q=${encodeURIComponent(getText(term.term))}`}
          className="breadcrumb-link"
        >
          Tra cứu
        </Link>
        <ChevronRight size={16} />
        <span className="breadcrumb-current">{getText(term.term)}</span>
      </nav>

      {/* Back button */}
      <Link
        href={`/terms?q=${encodeURIComponent(getText(term.term))}`}
        className="term-detail__back"
      >
        <ArrowLeft size={20} />
        <span>Quay lại kết quả tìm kiếm</span>
      </Link>

      {/* Main Content */}
      <article className="term-detail__content">
        {/* Header */}
        <header className="term-detail__header">
          <div className="term-detail__title-row">
            <h1 className="term-detail__title">{getText(term.term)}</h1>

            {/* Action buttons */}
            <div className="term-detail__actions">
              <button
                className={`action-btn action-btn--favorite ${isFavorited ? "active" : ""}`}
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                title={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
              >
                <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Category & Meta */}
          <div className="term-detail__meta">
            {term.category && (
              <Link
                href={`/terms?category=${term.category._id}`}
                className="term-detail__category"
              >
                <Tag size={16} />
                <span>{getText(term.category.name)}</span>
              </Link>
            )}

            {term.partOfSpeech && (
              <span className="term-detail__pos">
                <BookOpen size={16} />
                {term.partOfSpeech}
              </span>
            )}

            <span className="term-detail__views">
              <Eye size={16} />
              {term.viewCount} lượt xem
            </span>
          </div>
        </header>

        {/* Multi-language terms */}
        {(term.term.en || term.term.lo) && (
          <div className="term-detail__translations">
            {term.term.vi && currentLanguage !== "vi" && (
              <div className="translation-item">
                <span className="lang-label" title="Tiếng Việt">
                  🇻🇳
                </span>
                <span className="lang-value">{term.term.vi}</span>
              </div>
            )}
            {term.term.en && currentLanguage !== "en" && (
              <div className="translation-item">
                <span className="lang-label" title="English">
                  🇬🇧
                </span>
                <span className="lang-value">{term.term.en}</span>
              </div>
            )}
            {term.term.lo && currentLanguage !== "lo" && (
              <div className="translation-item">
                <span className="lang-label" title="ພາສາລາວ">
                  🇱🇦
                </span>
                <span className="lang-value">{term.term.lo}</span>
              </div>
            )}
          </div>
        )}

        {/* Definition */}
        <section className="term-detail__section">
          <h2 className="section-title">
            <BookOpen size={20} />
            Định nghĩa
          </h2>
          <div className="term-detail__definition">
            {getText(term.definition)}
          </div>
        </section>

        {/* Detailed Explanation */}
        {term.detailedExplanation && getText(term.detailedExplanation) && (
          <section className="term-detail__section">
            <h2 className="section-title">Giải thích chi tiết</h2>
            <div className="term-detail__explanation">
              {getText(term.detailedExplanation)}
            </div>
          </section>
        )}

        {/* Examples */}
        {term.examples && term.examples.length > 0 && (
          <section className="term-detail__section">
            <h2 className="section-title">Ví dụ</h2>
            <ul className="term-detail__examples">
              {term.examples.map((example, index) => (
                <li key={index} className="example-item">
                  {getText(example)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related Terms */}
        {term.relatedTerms && term.relatedTerms.length > 0 && (
          <section className="term-detail__section">
            <h2 className="section-title">Thuật ngữ liên quan</h2>
            <div className="term-detail__related">
              {term.relatedTerms.map((related) => (
                <Link
                  key={related._id}
                  href={`/terms/${related._id}`}
                  className="related-term"
                >
                  <span className="related-term__name">
                    {getText(related.term)}
                  </span>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {term.tags && term.tags.length > 0 && (
          <div className="term-detail__tags">
            {term.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <footer className="term-detail__footer">
          <div className="footer-info">
            {term.createdBy && (
              <span className="footer-item">
                <UserIcon size={14} />
                Đóng góp bởi: {term.createdBy.fullName}
              </span>
            )}
            {term.createdAt && (
              <span className="footer-item">
                <Clock size={14} />
                {formatDate(term.createdAt)}
              </span>
            )}
          </div>

          {/* Report & Edit buttons */}
          <div className="footer-actions">
            <button
              className="footer-btn footer-btn--edit"
              onClick={handleEditClick}
            >
              <Edit3 size={16} />
              <span>Gợi ý chỉnh sửa</span>
            </button>

            <button
              className="footer-btn footer-btn--report"
              onClick={handleReportClick}
            >
              <Flag size={16} />
              <span>Báo xấu</span>
            </button>
          </div>
        </footer>
      </article>

      {/* Comments Section */}
      <section className="term-detail__comments">
        <h2 className="section-title">
          <MessageCircle size={20} />
          Bình luận ({comments.length})
        </h2>

        <CommentSection
          termId={term._id}
          comments={comments}
          loading={commentsLoading}
          onCommentAdded={handleCommentAdded}
        />
      </section>

      {/* Modals */}
      {showReportModal && (
        <ReportModal
          termId={term._id}
          termName={getText(term.term)}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showEditModal && (
        <SuggestEditModal term={term} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}
