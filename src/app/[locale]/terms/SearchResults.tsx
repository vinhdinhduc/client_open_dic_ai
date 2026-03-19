"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TermCardData } from "@/components/terms/types";
import TermCard from "@/components/terms/TermCard";
import { AIChat } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "react-hot-toast";
import { Bot, LogIn, PlusCircle, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  addFavorite,
  checkFavorite,
  removeFavorite,
} from "@/services/favoriteService";
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
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated || terms.length === 0) {
      setFavoriteMap({});
      return;
    }

    const loadFavoriteStatus = async () => {
      const entries = await Promise.all(
        terms.map(async (term) => {
          try {
            const res = await checkFavorite(term._id);
            return [term._id, Boolean(res.data?.isFavorited)] as const;
          } catch {
            return [term._id, false] as const;
          }
        }),
      );

      if (!cancelled) {
        setFavoriteMap(Object.fromEntries(entries));
      }
    };

    loadFavoriteStatus();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, terms]);

  const handleFavoriteToggle = async (
    termId: string,
    nextFavorited: boolean,
  ) => {
    if (!isAuthenticated) return;

    setFavoriteMap((prev) => ({
      ...prev,
      [termId]: nextFavorited,
    }));

    try {
      if (nextFavorited) {
        await addFavorite(termId);
      } else {
        await removeFavorite(termId);
      }
    } catch {
      setFavoriteMap((prev) => ({
        ...prev,
        [termId]: !nextFavorited,
      }));
      toast.error(tCommon("error"));
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

  return (
    <div className="search-results-page">
      <div className="container">
        {terms.length === 0 ? (
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

            <section className="search-results-page__related-terms">
              <div className="search-results-page__related-grid">
                {terms.map((term) => (
                  <TermCard
                    key={term._id}
                    term={term}
                    isFavorited={Boolean(favoriteMap[term._id])}
                    onFavoriteToggle={handleFavoriteToggle}
                    showCategory={true}
                    showMetadata={true}
                    showActions={true}
                  />
                ))}
              </div>
            </section>
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
