"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TermCardData } from "@/components/terms/types";
import TermCard from "@/components/terms/TermCard";
import { AIChat } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "react-hot-toast";
import { Bot, LogIn } from "lucide-react";

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
      toast.error("Bạn cần đăng nhập để sử dụng tính năng AI");
      // Điều hướng đến trang đăng nhập với returnUrl
      router.push(`/login?returnUrl=/terms?q=${encodeURIComponent(query)}`);
      return;
    }

    setShowAIChat(true);
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
              <h3>Không tìm thấy thuật ngữ trong hệ thống</h3>
              <p>
                Chúng tôi không tìm thấy thuật ngữ{" "}
                <strong>&quot;{query}&quot;</strong> trong từ điển.
              </p>
              <p className="search-results-page__empty-suggestion">
                Bạn có thể hỏi AI để tìm hiểu thêm về thuật ngữ này.
              </p>
              <button
                className="search-results-page__ai-btn"
                onClick={handleAskAI}
              >
                {isAuthenticated ? (
                  <>
                    <Bot size={20} />
                    Hỏi AI về thuật ngữ này
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Đăng nhập để sử dụng AI
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="search-results-page__title">
              Kết quả tìm kiếm cho &quot;{query}&quot;
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
            Không tìm thấy kết quả phù hợp
          </div>
        )}
      </div>
    </div>
  );
}
