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
  Bot,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import reputationService from "@/services/reputationService";
import "./TermDetailView.scss";

interface TermDetailViewProps {
  term: TermDetail;
}

export default function TermDetailView({ term }: TermDetailViewProps) {
  const t = useTranslations("term");
  const tContribute = useTranslations("contribution");
  const tCommon = useTranslations("common");
  const { currentLanguage } = useLanguage();

  // Content language tabs - independent from system language
  const [contentLang, setContentLang] = useState<string>(currentLanguage);

  // Map partOfSpeech codes to localised labels
  const getPartOfSpeechLabel = (pos: string): string => {
    const validKeys = [
      "noun",
      "verb",
      "adjective",
      "adverb",
      "phrase",
      "abbreviation",
    ] as const;
    if (validKeys.includes(pos as any)) {
      return tContribute(`partOfSpeech.${pos}` as any);
    }
    return pos;
  };
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    definition?: string;
    detailedExplanation?: string;
    examples?: string[];
  } | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiContentForEdit, setAiContentForEdit] = useState<{
    lang: string;
    definition?: string;
    detailedExplanation?: string;
    examples?: string[];
  } | null>(null);
  // Client-side cache: store AI responses per language to avoid re-calling API
  const [aiCache, setAiCache] = useState<
    Record<
      string,
      {
        definition?: string;
        detailedExplanation?: string;
        examples?: string[];
      }
    >
  >({});

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

  // Helpers - use contentLang for dictionary content (independent from system language)
  const getText = (
    multiLang: { vi?: string; en?: string; lo?: string } | undefined,
  ): string => {
    if (!multiLang) return "";
    return (
      multiLang[contentLang as keyof typeof multiLang] ||
      multiLang.vi ||
      multiLang.en ||
      multiLang.lo ||
      ""
    );
  };

  // For UI elements, use system language
  const getUIText = (
    multiLang: { vi?: string; en?: string; lo?: string } | undefined,
  ): string => {
    if (!multiLang) return "";
    return (
      multiLang[currentLanguage as keyof typeof multiLang] ||
      multiLang.vi ||
      multiLang.en ||
      multiLang.lo ||
      ""
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      currentLanguage === "vi"
        ? "vi-VN"
        : currentLanguage === "lo"
          ? "lo-LA"
          : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  // Handlers
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error(t("loginToFavorite"));
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setFavoriteLoading(true);
    try {
      const result = await toggleFavorite(term._id);
      setIsFavorited(result.isFavorited);
      toast.success(
        result.isFavorited ? t("addedToFavorite") : t("removedFromFavorite"),
      );
    } catch (error) {
      toast.error(t("favoriteError"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      toast.error(t("loginToReport"));
      return;
    }
    setShowReportModal(true);
  };

  const handleEditClick = () => {
    if (!isAuthenticated) {
      toast.error(t("loginToSuggestEdit"));
      return;
    }
    setAiContentForEdit(null);
    setShowEditModal(true);
  };

  const handleEditClickWithAI = () => {
    if (!isAuthenticated) {
      toast.error(t("loginToSuggestEdit"));
      return;
    }
    if (aiResponse) {
      setAiContentForEdit({
        lang: contentLang,
        definition: aiResponse.definition,
        detailedExplanation: aiResponse.detailedExplanation,
        examples: aiResponse.examples,
      });
    }
    setShowEditModal(true);
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  // AI Ask handler
  const handleAskAI = async (lang?: string) => {
    if (!isAuthenticated) {
      toast.error(t("loginToAskAI") || "Vui lòng đăng nhập để hỏi AI");
      return;
    }

    try {
      const access = await reputationService.checkAIAccess("explanation");
      if (!access.allowed || access.level < 2) {
        const message =
          "Ban can dat Level 2 (tu 100 diem uy tin) de dung AI giai thich them thuat ngu da co san.";
        toast.error(message);
        router.push("/profile/reputation");
        return;
      }
    } catch {
      toast.error("Khong the kiem tra quyen AI. Vui long thu lai.");
      return;
    }

    const targetLang = lang || contentLang;
    setShowAiPanel(true);

    // Check client-side cache first
    if (aiCache[targetLang]) {
      setAiResponse(aiCache[targetLang]);
      return;
    }

    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await axiosInstance.post("/ai/ask-about-term", {
        termId: term._id,
        language: targetLang,
      });
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        const parsed = {
          definition: data.definition || undefined,
          detailedExplanation: data.detailedExplanation || undefined,
          examples: data.examples?.length ? data.examples : undefined,
        };
        setAiResponse(parsed);
        // Save to local cache
        setAiCache((prev) => ({ ...prev, [targetLang]: parsed }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể kết nối với AI");
      setAiResponse(null);
      setShowAiPanel(false);
    } finally {
      setAiLoading(false);
    }
  };

  // Re-call AI when content language changes
  useEffect(() => {
    if (showAiPanel) {
      handleAskAI(contentLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentLang]);

  const contentLanguages = [
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "lo", label: "ລາວ", flag: "🇱🇦" },
  ];

  return (
    <div className="term-detail">
      {/* Breadcrumb */}
      <nav className="term-detail__breadcrumb">
        <Link href="/" className="breadcrumb-link">
          {tCommon("home")}
        </Link>
        <ChevronRight size={16} />
        <Link
          href={`/terms?q=${encodeURIComponent(getUIText(term.term))}`}
          className="breadcrumb-link"
        >
          {t("searchBreadcrumb")}
        </Link>
        <ChevronRight size={16} />
        <span className="breadcrumb-current">{getUIText(term.term)}</span>
      </nav>

      {/* Main Content */}
      <article className="term-detail__content">
        {/* Header */}
        <header className="term-detail__header">
          <div className="term-detail__title-row">
            <h1 className="term-detail__title">{getText(term.term)}</h1>

            {/* Action buttons */}
            <div className="term-detail__actions">
              <button
                className={`action-btn action-btn--ai ${showAiPanel ? "active" : ""}`}
                onClick={() => handleAskAI()}
                title={t("askAI") || "Hỏi AI"}
              >
                {aiLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Bot size={20} />
                )}
              </button>
              <button
                className={`action-btn action-btn--favorite ${isFavorited ? "active" : ""}`}
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                title={
                  isFavorited ? t("removeFromFavorite") : t("addToFavorite")
                }
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
                <span>{getUIText(term.category.name)}</span>
              </Link>
            )}

            {term.partOfSpeech && (
              <span className="term-detail__pos">
                <BookOpen size={16} />
                {getPartOfSpeechLabel(term.partOfSpeech)}
              </span>
            )}

            <span className="term-detail__views">
              <Eye size={16} />
              {term.viewCount} {t("views")}
            </span>
          </div>
        </header>

        {/* Content Language Tabs */}
        <div className="term-detail__lang-tabs">
          {contentLanguages.map((lang) => (
            <button
              key={lang.code}
              className={`lang-tab ${contentLang === lang.code ? "lang-tab--active" : ""}`}
              onClick={() => setContentLang(lang.code)}
            >
              <span className="lang-tab__flag">{lang.flag}</span>
              <span className="lang-tab__label">{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Definition */}
        <section className="term-detail__section">
          <h2 className="section-title">
            <BookOpen size={20} />
            {t("definition")}
          </h2>
          <div className="term-detail__definition">
            {getText(term.definition)}
          </div>
          {showAiPanel && (
            <div className="term-detail__ai-inline">
              <div className="ai-inline__label">
                <Bot size={14} /> AI
              </div>
              {aiLoading ? (
                <div className="ai-inline__loading">
                  <Loader2 size={16} className="animate-spin" />{" "}
                  {t("aiThinking") || "AI đang phân tích..."}
                </div>
              ) : aiResponse?.definition ? (
                <div className="ai-inline__content">
                  {aiResponse.definition}
                </div>
              ) : !aiLoading ? (
                <div className="ai-inline__empty">—</div>
              ) : null}
            </div>
          )}
        </section>

        {/* Detailed Explanation */}
        {(getText(term.detailedExplanation) ||
          (showAiPanel && aiResponse?.detailedExplanation)) && (
          <section className="term-detail__section">
            <h2 className="section-title">{t("detailedExplanation")}</h2>
            {getText(term.detailedExplanation) && (
              <div className="term-detail__explanation">
                {getText(term.detailedExplanation)}
              </div>
            )}
            {showAiPanel && (
              <div className="term-detail__ai-inline">
                <div className="ai-inline__label">
                  <Bot size={14} /> AI
                </div>
                {aiLoading ? (
                  <div className="ai-inline__loading">
                    <Loader2 size={16} className="animate-spin" />{" "}
                    {t("aiThinking") || "AI đang phân tích..."}
                  </div>
                ) : aiResponse?.detailedExplanation ? (
                  <div className="ai-inline__content">
                    {aiResponse.detailedExplanation}
                  </div>
                ) : !aiLoading ? (
                  <div className="ai-inline__empty">—</div>
                ) : null}
              </div>
            )}
          </section>
        )}

        {/* Examples */}
        {((term.examples && term.examples.length > 0) ||
          (showAiPanel && aiResponse?.examples?.length)) && (
          <section className="term-detail__section">
            <h2 className="section-title">{t("example")}</h2>
            {term.examples && term.examples.length > 0 && (
              <ul className="term-detail__examples">
                {term.examples.map((example, index) => (
                  <li key={index} className="example-item">
                    {getText(example)}
                  </li>
                ))}
              </ul>
            )}
            {showAiPanel && (
              <div className="term-detail__ai-inline">
                <div className="ai-inline__label">
                  <Bot size={14} /> AI
                </div>
                {aiLoading ? (
                  <div className="ai-inline__loading">
                    <Loader2 size={16} className="animate-spin" />{" "}
                    {t("aiThinking") || "AI đang phân tích..."}
                  </div>
                ) : aiResponse?.examples?.length ? (
                  <ul className="ai-inline__examples">
                    {aiResponse.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                ) : !aiLoading ? (
                  <div className="ai-inline__empty">—</div>
                ) : null}
              </div>
            )}
          </section>
        )}

        {/* AI Suggest Edit CTA */}
        {showAiPanel && aiResponse && !aiLoading && (
          <div className="term-detail__ai-suggest-cta">
            <p>{t("aiSuggestEditPrompt")}</p>
            <button
              className="btn-suggest-edit"
              onClick={handleEditClickWithAI}
            >
              <Edit3 size={16} />
              {t("suggestEditBtn")}
            </button>
          </div>
        )}

        {/* Related Terms */}
        {term.relatedTerms && term.relatedTerms.length > 0 && (
          <section className="term-detail__section">
            <h2 className="section-title">{t("relatedTerms")}</h2>
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
              <Link
                key={index}
                href={`/terms?q=${encodeURIComponent(tag)}`}
                className="tag tag--clickable"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Contributors */}
        <section className="term-detail__contributors">
          <h3 className="contributors-title">
            <Users size={18} />
            {t("contributors")}
          </h3>
          <div className="contributors-list">
            {term.createdBy && (
              <div className="contributor-item">
                <UserIcon size={14} />
                <span className="contributor-name">
                  {term.createdBy.fullName}
                </span>
                <span className="contributor-role">({t("created")})</span>
              </div>
            )}
            {term.lastModifiedBy &&
              term.lastModifiedBy._id !== term.createdBy?._id && (
                <div className="contributor-item">
                  <Edit3 size={14} />
                  <span className="contributor-name">
                    {term.lastModifiedBy.fullName}
                  </span>
                  <span className="contributor-role">({t("edited")})</span>
                </div>
              )}
          </div>
        </section>

        {/* Footer Info */}
        <footer className="term-detail__footer">
          <div className="footer-info">
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
              <span>{t("suggestEditBtn")}</span>
            </button>

            <button
              className="footer-btn footer-btn--report"
              onClick={handleReportClick}
            >
              <Flag size={16} />
              <span>{t("reportBtn")}</span>
            </button>
          </div>
        </footer>
      </article>

      {/* Comments Section */}
      <section className="term-detail__comments">
        <h2 className="section-title">
          <MessageCircle size={20} />
          {t("commentsTitle")} ({comments.length})
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
        <SuggestEditModal
          term={term}
          onClose={() => {
            setShowEditModal(false);
            setAiContentForEdit(null);
          }}
          aiContent={aiContentForEdit ?? undefined}
        />
      )}
    </div>
  );
}
