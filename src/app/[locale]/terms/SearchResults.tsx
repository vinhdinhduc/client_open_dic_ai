"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TermCardData } from "@/components/terms/types";
import TermCard from "@/components/terms/TermCard";
import { AIChat } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "react-hot-toast";
import { Bot, LogIn, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showAIChat, setShowAIChat] = useState(false);

  const handleFavoriteToggle = (termId: string, isFavorited: boolean) => {
    const newFavorites = new Set(favoriteIds);
    if (isFavorited) {
      newFavorites.add(termId);
    } else {
      newFavorites.delete(termId);
    }
    setFavoriteIds(newFavorites);
  };

  const handleAskAI = () => {
    if (!isAuthenticated) {
      toast.error(t("needLoginAI"));
      // Điều hướng đến trang đăng nhập với returnUrl
      router.push(`/login?returnUrl=/terms?q=${encodeURIComponent(query)}`);
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

    // Chuyển đến trang contribute với term từ query
    router.push(`/contribute?term=${encodeURIComponent(query)}`);
  };

  const handleCloseAIChat = () => {
    setShowAIChat(false);
  };

  return (
    <div className="search-results-page">
      <div className="container">
        {!terms || terms.length === 0 ? (
          <div className="search-results-page__count">
            <div className="search-results-page__empty-content">
              <h3>{t("noResultsTitle")}</h3>
              <p>
                {t("noResultsMessage")} <strong>&quot;{query}&quot;</strong>{" "}
                {t("noResultsInDictionary")}
              </p>
              <p className="search-results-page__empty-suggestion">
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
              <p className="search-results-page__empty-help">
                {t("contributeDescription")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="search-results-page__title">
              {t("title")} &quot;{query}&quot;
            </h1>
            <div className="search-results-page__list">
              {terms?.map((term) => (
                <TermCard
                  key={term._id}
                  term={term}
                  isFavorited={favoriteIds.has(term._id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  showCategory={true}
                  showMetadata={true}
                  showActions={true}
                />
              ))}
            </div>
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

        {(!terms || terms.length === 0) && (
          <div className="search-results-page__empty">
            {t("noMatchingResults")}
          </div>
        )}
      </div>
    </div>
  );
}
