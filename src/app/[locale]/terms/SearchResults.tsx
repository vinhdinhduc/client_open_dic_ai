"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TermCardData } from "@/components/terms/types";
import TermCard from "@/components/terms/TermCard";
import { AIChat, AICometAgent } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "react-hot-toast";
import { Bot, LogIn, PlusCircle, Search, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { AIAgentContext } from "@/services/aiAgentService";
import {
  addFavorite,
  checkFavorite,
  removeFavorite,
} from "@/services/favoriteService";
import reputationService from "@/services/reputationService";
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
  const { isAuthenticated, user } = useAuth();
  const { currentLanguage } = useLanguage();
  const t = useTranslations("searchResults");
  const tCommon = useTranslations("common");
  const [terms] = useState<TermCardData[]>(initialTerms);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [showAIChat, setShowAIChat] = useState(false);
  const [userReputationLevel, setUserReputationLevel] = useState<
    number | undefined
  >();

  const isQueryMatchingAnyTerm = terms.some((term) => {
    const q = query.trim().toLowerCase();
    const names = Object.values(term.term ?? {}).map((v) =>
      String(v).toLowerCase(),
    );
    return names.some((name) => name.includes(q) || q.includes(name));
  });

  const showSuggestedSection = terms.length > 0 && !isQueryMatchingAnyTerm;

  // Load user reputation level for AI Agent context
  useEffect(() => {
    if (!isAuthenticated) {
      setUserReputationLevel(undefined);
      return;
    }

    const loadReputation = async () => {
      try {
        const userRep = await reputationService.getUserReputation(
          user?._id || "",
        );
        setUserReputationLevel(userRep?.totalPoints || 0);
      } catch (error) {
        console.error("Failed to load reputation:", error);
      }
    };

    loadReputation();
  }, [isAuthenticated]);

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
          <>
            {/* Title */}
            <div className="search-results-page__header">
              <h1 className="search-results-page__title">
                {!isQueryMatchingAnyTerm ? t("noExactMatch") : t("title")}
                {query && `: "${query}"`}
              </h1>
            </div>

            {showSuggestedSection && (
              <div className="search-results-page__mismatch-banner">
                <div className="search-results-page__mismatch-banner-content">
                  <Bot
                    size={20}
                    className="search-results-page__mismatch-banner-icon"
                  />
                  <p className="search-results-page__mismatch-banner-text">
                    {t("noExactMatch", { query })}{" "}
                    <span>{t("tryAskingAI")}</span>
                  </p>
                </div>
                <button
                  className="search-results-page__ai-btn search-results-page__ai-btn--sm"
                  onClick={handleAskAI}
                >
                  {isAuthenticated ? (
                    <>
                      <Bot size={16} />
                      {t("askAI")}
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      {t("loginToUseAI")}
                    </>
                  )}
                </button>
              </div>
            )}

            <section className="search-results-page__related-terms">
              {/* Show "Terms you might know" label only on mismatch */}
              {showSuggestedSection && (
                <h2 className="search-results-page__section-title">
                  <Lightbulb size={20} />
                  {t("termsMightKnow")}
                </h2>
              )}

              <div className="search-results-page__results-grid">
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

        {/* AI Comet Agent - Floating Assistant */}
        {isAuthenticated && (
          <AICometAgent
            context={
              {
                currentPage: "search",
                searchQuery: query,
                language: currentLanguage || "vi",
                userReputationLevel: userReputationLevel,
                viewedTerms: terms.map((t) => t._id),
              } as AIAgentContext
            }
            showOnMount={false}
            position="bottom-left"
          />
        )}
      </div>
    </div>
  );
}
