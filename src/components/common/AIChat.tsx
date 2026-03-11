"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { aiService, AIResponse } from "@/services/aiService";
import { saveMultiLangContributionData } from "@/utils/contributionStorage";
import { toast } from "react-hot-toast";
import {
  X,
  Send,
  Bot,
  Loader2,
  AlertCircle,
  BookOpen,
  FileText,
  Lightbulb,
  Tag,
  Link2,
  Hash,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import "./AIChat.scss";
import { useTranslations } from "next-intl";

interface AIChatProps {
  term: string;
  language?: string;
  onClose: () => void;
}

export default function AIChat({
  term,
  language = "vi",
  onClose,
}: AIChatProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(language);
  /** Cache AI responses per language */
  const cachedResponses = useRef<Record<string, AIResponse>>({});
  const hasCalledAPI = useRef(false);

  const t = useTranslations("aiChat");

  const handleAskAI = useCallback(
    async (lang?: string) => {
      const askLang = lang || selectedLang;
      if (!term.trim()) {
        return;
      }

      // If already cached, just show it
      if (cachedResponses.current[askLang]) {
        setResponse(cachedResponses.current[askLang]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await aiService.askAboutTerm({
          term: term.trim(),
          language: askLang,
        });
        cachedResponses.current[askLang] = result;
        setResponse(result);
      } catch (err: any) {
        console.error("AI Chat Error:", err);
        setError(err.message || t("errorConnection"));
        toast.error(t("errorNoResponse"));
      } finally {
        setIsLoading(false);
      }
    },
    [term, selectedLang, t],
  );

  // Tự động gọi AI khi component mount (chỉ gọi 1 lần)
  useEffect(() => {
    if (isAuthenticated && term && !hasCalledAPI.current) {
      hasCalledAPI.current = true;
      handleAskAI();
    }
  }, [isAuthenticated, term, handleAskAI]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    handleAskAI(lang);
  };

  const handleSearchOtherTerms = () => {
    onClose();
    router.push("/search");
  };

  const handleContribute = (data: AIResponse) => {
    if (!isAuthenticated) {
      toast.error(t("loginToContribute"));
      return;
    }

    try {
      // Build multi-lang contribution data from all cached responses
      const langs: Record<
        string,
        {
          term: string;
          definition: string;
          detailedExplanation?: string;
          examples?: string[];
        }
      > = {};

      for (const [lang, res] of Object.entries(cachedResponses.current)) {
        if (res.structured) {
          langs[lang] = {
            term: res.term || "",
            definition: res.definition || "",
            detailedExplanation: res.detailedExplanation,
            examples: res.examples,
          };
        }
      }

      // Ensure current response is included
      if (data.structured && !langs[data.language]) {
        langs[data.language] = {
          term: data.term || "",
          definition: data.definition || "",
          detailedExplanation: data.detailedExplanation,
          examples: data.examples,
        };
      }

      const storageKey = saveMultiLangContributionData({
        langs,
        partOfSpeech: data.partOfSpeech,
        relatedTerms: data.relatedTerms,
        tags: data.tags,
      });

      onClose();
      router.push(
        `/contribute?from=ai&mlkey=${encodeURIComponent(storageKey)}`,
      );
    } catch (error) {
      console.error("Failed to save contribution data:", error);
      toast.error(t("errorSavingData") || "Failed to save data");

      // Fallback: Chỉ truyền term qua URL
      onClose();
      router.push(`/contribute?term=${encodeURIComponent(data.term)}`);
    }
  };

  const renderStructuredResponse = (data: AIResponse) => (
    <div className="ai-chat__structured">
      {/* Header với badges */}
      <div className="ai-chat__header-info">
        {data.partOfSpeech && (
          <span className="ai-chat__badge ai-chat__badge--pos">
            {data.partOfSpeech}
          </span>
        )}
        {data.field && (
          <span className="ai-chat__badge ai-chat__badge--field">
            <Hash size={12} />
            {data.field}
          </span>
        )}
      </div>

      {/* Definition - Highlighted box giống TermDetailView */}
      {data.definition && (
        <section className="ai-chat__section ai-chat__section--definition">
          <h3 className="ai-chat__section-title">
            <BookOpen size={18} />
            {t("definition")}
          </h3>
          <div className="ai-chat__definition-box">{data.definition}</div>
        </section>
      )}

      {/* Detailed Explanation */}
      {data.detailedExplanation && (
        <section className="ai-chat__section">
          <h3 className="ai-chat__section-title">
            <FileText size={18} />
            {t("explanation")}
          </h3>
          <div className="ai-chat__text-content">
            <ReactMarkdown>{data.detailedExplanation}</ReactMarkdown>
          </div>
        </section>
      )}

      {/* Examples */}
      {data.examples && data.examples.length > 0 && (
        <section className="ai-chat__section">
          <h3 className="ai-chat__section-title">
            <Lightbulb size={18} />
            {t("examples")}
          </h3>
          <ul className="ai-chat__examples-list">
            {data.examples.map((example, index) => (
              <li key={index} className="ai-chat__example-item">
                {example}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Related Terms */}
      {data.relatedTerms && data.relatedTerms.length > 0 && (
        <section className="ai-chat__section">
          <h3 className="ai-chat__section-title">
            <Link2 size={18} />
            {t("relatedTerms")}
          </h3>
          <div className="ai-chat__related-terms">
            {data.relatedTerms.map((rt, index) => (
              <span key={index} className="ai-chat__related-term">
                {rt}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <section className="ai-chat__section">
          <h3 className="ai-chat__section-title">
            <Tag size={18} />
            {t("tags")}
          </h3>
          <div className="ai-chat__tags-wrap">
            {data.tags.map((tag, index) => (
              <span key={index} className="ai-chat__tag-item">
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Contribute CTA */}
      <div className="ai-chat__contribute">
        <div className="ai-chat__contribute-content">
          <h4 className="ai-chat__contribute-title">
            <Lightbulb size={18} /> {t("infoUseful")}
          </h4>
          <p className="ai-chat__contribute-text">
            {t("contributeQuestion")} <strong>"{data.term}"</strong>{" "}
            {t("contributeQuestionSuffix")}
          </p>
          <div className="ai-chat__contribute-actions">
            <button
              className="ai-chat__contribute-btn ai-chat__contribute-btn--primary"
              onClick={() => handleContribute(data)}
            >
              <FileText size={16} />
              {t("contributeButton")}
            </button>
            <button
              className="ai-chat__contribute-btn ai-chat__contribute-btn--secondary"
              onClick={onClose}
            >
              {t("later")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ai-chat-overlay" onClick={onClose}>
      <div className="ai-chat" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-chat__header">
          <div className="ai-chat__header-title">
            <Bot className="ai-chat__icon" size={24} />
            <div>
              <h3>{t("assistant")}</h3>
              <span className="ai-chat__subtitle">
                {t("about")}: <strong>{term}</strong>
              </span>
            </div>
          </div>
          <div className="ai-chat__lang-selector">
            <label>{t("responseLanguage")}:</label>
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isLoading}
            >
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
              <option value="lo">🇱🇦 ພາສາລາວ</option>
            </select>
          </div>
          <button
            className="ai-chat__close-btn"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="ai-chat__content">
          {isLoading && (
            <div className="ai-chat__loading">
              <Loader2 className="ai-chat__spinner" size={32} />
              <p>{t("loading")}</p>
            </div>
          )}

          {error && (
            <div className="ai-chat__error">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button
                className="ai-chat__retry-btn"
                onClick={() => handleAskAI()}
              >
                {t("retry")}
              </button>
            </div>
          )}

          {response && !isLoading && !error && (
            <div className="ai-chat__response">
              <div className="ai-chat__message">
                <div className="ai-chat__message-header">
                  <Bot size={20} />
                  <span>{t("assistant")}</span>
                  {response.model && (
                    <span className="ai-chat__model">({response.model})</span>
                  )}
                </div>

                {/* Render structured*/}
                {response.structured && renderStructuredResponse(response)}
              </div>

              <div className="ai-chat__footer-info">
                <p className="ai-chat__disclaimer">{t("disclaimer")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ai-chat__footer">
          <button
            className="ai-chat__action-btn ai-chat__action-btn--secondary"
            onClick={onClose}
          >
            {t("close")}
          </button>
          {response && (
            <button
              className="ai-chat__action-btn ai-chat__action-btn--primary"
              onClick={handleSearchOtherTerms}
            >
              <Send size={16} />
              {t("searchOtherTerms")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
