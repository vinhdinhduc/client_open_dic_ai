"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TermCardData } from "@/components/terms/types";
import TermCard from "@/components/terms/TermCard";
import { AIChat } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "react-hot-toast";
import {
  Bot,
  LogIn,
  PlusCircle,
  ChevronRight,
  BookOpen,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { saveSearchHistory } from "@/services/termService";
import {
  addFavorite,
  checkFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favoriteService";
import Link from "next/link";
import "./Term.scss";

interface SearchResultsClientProps {
  initialTerms: TermCardData[];
  query: string;
}

export default function SearchResultsClient({
  initialTerms,
  query,
}: SearchResultsClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { currentLanguage } = useLanguage();
  const t = useTranslations("searchResults");
  const tCommon = useTranslations("common");
  const [terms] = useState<TermCardData[]>(initialTerms);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Track saved queries to prevent duplicate saves
  const savedQueryRef = useRef<string>("");
  const exactMatch = useMemo(() => {
    if (!query || typeof query !== "string") return null;
    const queryLower = query.toLowerCase().trim();
    if (!queryLower) return null;
    return terms.find(
      (term) =>
        (typeof term.term?.vi === "string" &&
          term.term.vi.toLowerCase().trim() === queryLower) ||
        (typeof term.term?.en === "string" &&
          term.term.en.toLowerCase().trim() === queryLower) ||
        (typeof term.term?.lo === "string" &&
          term.term.lo.toLowerCase().trim() === queryLower),
    );
  }, [terms, query]);
  // Lưu lịch sử tìm kiếm khi component mount (chỉ 1 lần per query)
  useEffect(() => {
    if (
      isAuthenticated &&
      query &&
      query.trim() &&
      savedQueryRef.current !== query
    ) {
      savedQueryRef.current = query;
      saveSearchHistory(query, initialTerms.length);
    }
  }, [isAuthenticated, query, initialTerms.length]);

  useEffect(() => {
    if (!isAuthenticated || !exactMatch?._id) {
      setIsFavorited(false);
      return;
    }
    const checkStatus = async () => {
      try {
        const res = await checkFavorite(exactMatch._id);

        if (res.success) {
          setIsFavorited(res.data.isFavorited);
        }
      } catch (error) {
        setIsFavorited(false);
      }
    };
    checkStatus();
  }, [isAuthenticated, exactMatch?._id]);

  // Tập hợp tất cả các related terms từ exact match
  const allRelatedTerms = useMemo(() => {
    if (!exactMatch || !exactMatch.relatedTerms) return [];

    const uniqueTerms = new Map();
    exactMatch.relatedTerms.forEach((related) => {
      if (!uniqueTerms.has(related._id)) {
        uniqueTerms.set(related._id, related);
      }
    });

    return Array.from(uniqueTerms.values());
  }, [exactMatch]);

  const handleFavoriteToggle = async (termId: string, isFavorited: boolean) => {
    if (!isAuthenticated) return;
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await addFavorite(termId);
      } else {
        await removeFavorite(termId);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAskAI = () => {
    if (!isAuthenticated) {
      toast.error(t("needLoginAI"));
      router.push(`/login?returnUrl=/terms?q=${encodeURIComponent(query)}`);
      return;
    }

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      toast.error(t("queryTooShort"));
      return;
    }

    if (trimmed.length > 100) {
      toast.error(t("queryTooLong"));
      return;
    }
    const hasValidContent = /[a-zA-ZÀ-ỹ\u0E80-\u0EFF]{2,}/.test(trimmed);

    if (!hasValidContent) {
      toast.error(t("queryInvalid"));
      return;
    }
    setShowAIChat(true);
  };

  const handleSuggestTerm = () => {
    if (!isAuthenticated) {
      toast.error(t("loginToContribute"));
      router.push(
        `/login?returnUrl=/contribute?term=${encodeURIComponent(query)}`,
      );
      return;
    }
    router.push(`/contribute?term=${encodeURIComponent(query)}`);
  };

  const handleCloseAIChat = () => {
    setShowAIChat(false);
  };

  const getText = (
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

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="search-results-page">
      <div className="container">
        {!exactMatch ? (
          /* =========== NO RESULTS =========== */
          <div className="search-results-page__no-results">
            <div className="search-results-page__no-results-icon">
              <Search size={48} />
            </div>
            <h2 className="search-results-page__no-results-title">
              {t("noResultsTitle")}
            </h2>
            <p className="search-results-page__no-results-desc">
              {t("noResultsMessage")} <strong>&quot;{query}&quot;</strong>{" "}
              {t("noResultsInDictionary")}
            </p>
            <p className="search-results-page__no-results-hint">
              {t("suggestAI")}
            </p>
            <div className="search-results-page__actions">
              <button
                className="search-results-page__ai-btn"
                onClick={handleAskAI}
              >
                {isAuthenticated ? (
                  <>
                    <Bot size={20} />
                    {t("askAI")}
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    {t("loginToUseAI")}
                  </>
                )}
              </button>
              <button
                className="search-results-page__suggest-btn"
                onClick={handleSuggestTerm}
              >
                {isAuthenticated ? (
                  <>
                    <PlusCircle size={20} />
                    {t("suggestTerm")}
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    {t("loginToContribute")}
                  </>
                )}
              </button>
            </div>
            <p className="search-results-page__no-results-footer">
              {t("contributeDescription")}
            </p>
          </div>
        ) : (
          /* =========== HAS RESULTS =========== */
          <>
            {/* Title */}
            <div className="search-results-page__header">
              <h1 className="search-results-page__title">
                {t("title")} &quot;{query}&quot;
              </h1>
            </div>

            {/* Exact Match Section */}
            <section className="search-results-page__exact-match">
              <TermCard
                term={exactMatch}
                isFavorited={isFavorited}
                onFavoriteToggle={handleFavoriteToggle}
                showCategory={true}
                showMetadata={true}
                showActions={true}
              />
            </section>

            {/* Related Terms Section */}
            {allRelatedTerms.length > 0 && (
              <section className="search-results-page__related-terms">
                <h2 className="search-results-page__section-title">
                  <BookOpen size={20} />
                  {t("relatedTerms")} ({allRelatedTerms.length})
                </h2>
                <div className="search-results-page__related-grid">
                  {allRelatedTerms.map((related) => (
                    <Link
                      key={related._id}
                      href={`/terms/${related._id}`}
                      className="related-term-card"
                    >
                      <div className="related-term-card__header">
                        <h3 className="related-term-card__name">
                          {getText(related.term)}
                        </h3>
                        <ChevronRight
                          size={18}
                          className="related-term-card__arrow"
                        />
                      </div>
                      {related.definition && (
                        <p className="related-term-card__definition">
                          {truncateText(getText(related.definition), 100)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* AI Chat Modal */}
        {showAIChat && (
          <AIChat
            term={query}
            language={currentLanguage}
            onClose={handleCloseAIChat}
          />
        )}
      </div>
    </div>
  );
}
