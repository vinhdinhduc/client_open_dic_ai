"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "next-intl";
import aiAgentService, {
  ActionSuggestion,
  AIAgentContext,
} from "@/services/aiAgentService";
import { toast } from "react-hot-toast";
import {
  Bot,
  ChevronRight,
  X,
  Loader2,
  Lightbulb,
  ArrowRight,
  Star,
  Search,
  FileText,
  BookOpen,
  Navigation,
} from "lucide-react";
import "./AICometAgent.scss";

interface AICometAgentProps {
  context: AIAgentContext;
  showOnMount?: boolean;
  position?: "bottom-right" | "bottom-left";
}

type IconType = typeof Bot;

const ICON_MAP: Record<string, IconType> = {
  contribute: FileText,
  search: Search,
  navigate: Navigation,
  learn: BookOpen,
  read: BookOpen,
  explore: Lightbulb,
  default: Bot,
};

export default function AICometAgent({
  context,
  showOnMount = true,
  position = "bottom-right",
}: AICometAgentProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { currentLanguage } = useLanguage();
  const t = useTranslations("aiAgent");
  const tCommon = useTranslations("common");

  const [isOpen, setIsOpen] = useState(showOnMount);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const contextWithLang = {
          ...context,
          language: currentLanguage || "vi",
        };
        const result = await aiAgentService.getSuggestions(contextWithLang, 4);
        setSuggestions(result);
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [context, isAuthenticated, currentLanguage]);

  const handleSuggestionClick = useCallback(
    async (suggestion: ActionSuggestion) => {
      aiAgentService.provideFeedback({
        suggestionId: suggestion.id,
        userAction: "clicked",
      });

      const { action } = suggestion;

      try {
        const buildTermDetailUrl = (
          termId: string,
          options?: { openSuggestEdit?: boolean },
        ) => {
          const params = new URLSearchParams();
          if (options?.openSuggestEdit) {
            params.set("openSuggestEdit", "1");
            params.set("source", "ai-agent");
          }
          const suffix = params.toString();
          return suffix ? `/terms/${termId}?${suffix}` : `/terms/${termId}`;
        };

        if (action.type === "redirect") {
          router.push(action.target || "/");
        } else if (action.type === "suggest_term") {
          router.push(
            `/contribute?term=${encodeURIComponent(action.params?.term || "")}`,
          );
          setIsOpen(false);
        } else if (action.type === "ask_ai") {
          window.dispatchEvent(
            new CustomEvent("openAIChat", {
              detail: {
                term: action.params?.term || "",
                language: action.params?.language || currentLanguage,
              },
            }),
          );
          setIsOpen(false);
        } else if (action.type === "view_term") {
          const termId = action.params?.termId || "";
          if (!termId) {
            throw new Error("Missing termId for view_term action");
          }

          router.push(
            buildTermDetailUrl(termId, {
              openSuggestEdit: Boolean(action.params?.openSuggestEdit),
            }),
          );
          setIsOpen(false);
        } else if (action.type === "suggest_edit") {
          const termId = action.params?.termId || "";
          if (!termId) {
            throw new Error("Missing termId for suggest_edit action");
          }
          router.push(buildTermDetailUrl(termId, { openSuggestEdit: true }));
          setIsOpen(false);
        } else if (action.type === "explore_category") {
          router.push(
            `/terms?category=${encodeURIComponent(
              action.params?.categoryId || "",
            )}`,
          );
          setIsOpen(false);
        }

        toast.success(suggestion.title);
      } catch (error) {
        console.error("Failed to handle suggestion:", error);
        toast.error(tCommon("error"));
      }
    },
    [router, currentLanguage, tCommon],
  );

  /**
   * Xử lý dismiss suggestion
   */
  const handleDismiss = useCallback((suggestion: ActionSuggestion) => {
    aiAgentService.provideFeedback({
      suggestionId: suggestion.id,
      userAction: "dismissed",
    });

    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const getIcon = (iconName: string | undefined): IconType => {
    return ICON_MAP[iconName || "default"] || Bot;
  };

  const noSuggestions = suggestions.length === 0 && !isLoading;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className={`ai-comet-agent__trigger ai-comet-agent__trigger--${position}`}
          onClick={() => setIsOpen(true)}
          title={t("openAgent")}
          aria-label={t("openAgent")}
        >
          <Bot size={24} />
          {suggestions.length > 0 && (
            <span className="ai-comet-agent__badge">
              {Math.min(suggestions.length, 9)}
            </span>
          )}
        </button>
      )}

      {/* Agent Panel */}
      {isOpen && (
        <div
          className={`ai-comet-agent ai-comet-agent--${position}`}
          role="dialog"
          aria-label={t("agent")}
        >
          {/* Header */}
          <div className="ai-comet-agent__header">
            <div className="ai-comet-agent__header-content">
              <Bot size={20} className="ai-comet-agent__header-icon" />
              <h3 className="ai-comet-agent__title">{t("agent")}</h3>
            </div>
            <button
              className="ai-comet-agent__close"
              onClick={() => setIsOpen(false)}
              aria-label={t("close")}
              title={t("close")}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="ai-comet-agent__content">
            {isLoading ? (
              <div className="ai-comet-agent__loading">
                <Loader2
                  size={24}
                  className="ai-comet-agent__loading-spinner"
                />
                <p>{t("loading")}</p>
              </div>
            ) : noSuggestions ? (
              <div className="ai-comet-agent__empty">
                <Lightbulb size={32} />
                <p>{t("noSuggestions")}</p>
              </div>
            ) : (
              <div className="ai-comet-agent__suggestions">
                {suggestions.map((suggestion) => {
                  const Icon = getIcon(suggestion.icon);
                  const isExpanded = expandedSuggestion === suggestion.id;

                  return (
                    <div
                      key={suggestion.id}
                      className={`ai-comet-agent__suggestion ai-comet-agent__suggestion--${suggestion.type}`}
                    >
                      <div
                        className="ai-comet-agent__suggestion-header"
                        onClick={() =>
                          setExpandedSuggestion(
                            isExpanded ? null : suggestion.id,
                          )
                        }
                      >
                        <div className="ai-comet-agent__suggestion-icon">
                          <Icon size={16} />
                        </div>
                        <div className="ai-comet-agent__suggestion-info">
                          <h4 className="ai-comet-agent__suggestion-title">
                            {suggestion.title}
                          </h4>
                          {suggestion.priority > 0 && (
                            <span className="ai-comet-agent__priority">
                              {suggestion.priority === 3 && (
                                <>
                                  <Star size={12} />
                                  {t("highPriority")}
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <ChevronRight
                          size={18}
                          className={`ai-comet-agent__chevron ${
                            isExpanded
                              ? "ai-comet-agent__chevron--expanded"
                              : ""
                          }`}
                        />
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="ai-comet-agent__suggestion-details">
                          <p className="ai-comet-agent__suggestion-description">
                            {suggestion.description}
                          </p>

                          <div className="ai-comet-agent__suggestion-actions">
                            <button
                              className="ai-comet-agent__suggestion-action ai-comet-agent__suggestion-action--primary"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <ArrowRight size={14} />
                              {t("takeAction")}
                            </button>

                            <button
                              className="ai-comet-agent__suggestion-action ai-comet-agent__suggestion-action--secondary"
                              onClick={() => handleDismiss(suggestion)}
                            >
                              {t("dismiss")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="ai-comet-agent__footer">
            <p className="ai-comet-agent__footer-text">{t("helpText")}</p>
          </div>
        </div>
      )}
    </>
  );
}
