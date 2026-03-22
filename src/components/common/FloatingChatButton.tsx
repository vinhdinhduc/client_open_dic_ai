"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "next-intl";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { aiService } from "@/services/aiService";
import { searchTerms } from "@/services/termService";
import { saveMultiLangContributionData } from "@/utils/contributionStorage";
import "./FloatingChatButton.scss";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  action?: {
    type: "contribute";
    term?: string;
  };
}

interface EditPrefillPayload {
  lang: string;
  definition?: string;
  detailedExplanation?: string;
  examples?: string[];
}

interface QuickNavigationTarget {
  path: string;
  label: string;
}

export default function FloatingChatButton() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { currentLanguage } = useLanguage();
  const t = useTranslations("floatingChat");
  const d = useTranslations("layout");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  const greetingPrompt = useMemo(() => {
    const fullName = user?.fullName?.trim();
    if (!fullName) {
      return null;
    }

    const email = user?.email?.trim().toLowerCase();
    if (!email || !email.endsWith("@utb.edu.vn")) {
      return t("promptHelloName", { name: fullName });
    }

    const studentRegex = /^[a-zA-Z0-9]+\.k\d+[a-zA-Z]+(-[a-z])?@utb\.edu\.vn$/;
    if (studentRegex.test(email)) {
      return t("promptHelloStudent", { name: fullName });
    }

    return t("promptHelloTeacher", { name: fullName });
  }, [t, user?.email, user?.fullName]);

  const promptMessages = useMemo(
    () => [
      t("promptIdea1"),
      t("promptIdea2"),
      t("promptIdea3"),
      ...(greetingPrompt ? [greetingPrompt] : []),
      d("faqPrompt1"),
      d("faqPrompt2"),
      d("faqPrompt3"),
      d("faqPrompt4"),
      d("faqPrompt5"),
    ],
    [d, greetingPrompt, t],
  );

  useEffect(() => {
    if (isOpen || promptMessages.length === 0) {
      setShowPrompt(false);
      return;
    }

    let hideTimeout: NodeJS.Timeout | null = null;

    const showHint = () => {
      setShowPrompt(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      hideTimeout = setTimeout(() => setShowPrompt(false), 2600);
    };

    const startDelay = setTimeout(showHint, 1200);
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % promptMessages.length);
      showHint();
    }, 6200);

    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [isOpen, promptMessages]);

  const extractContributeTerm = (text: string): string | null => {
    const normalized = text.trim().replace(/\s+/g, " ");

    const patterns = [
      /(?:tôi\s+muốn\s+)?đóng\s+góp(?:\s+thuật\s+ngữ)?\s+(.+)/i,
      /(?:please\s+)?contribute(?:\s+the)?(?:\s+term)?\s+(.+)/i,
      /(?:muốn\s+)?đề\s+xuất(?:\s+thuật\s+ngữ)?\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match?.[1]) {
        const rawTerm = match[1]
          .replace(/^[:\-–]+\s*/, "")
          .replace(/[.!?]+$/g, "")
          .trim();

        if (rawTerm.length >= 2) {
          return rawTerm;
        }
      }
    }

    return null;
  };

  const extractSearchTerm = (text: string): string | null => {
    const normalized = text.trim().replace(/\s+/g, " ");
    const patterns = [
      /(?:tôi\s+muốn\s+)?tìm\s+kiếm(?:\s+thuật\s+ngữ)?\s+(.+)/i,
      /(?:hãy\s+)?tìm\s+(?:thuật\s+ngữ\s+)?(.+)/i,
      /(?:please\s+)?search(?:\s+for)?(?:\s+term)?\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match?.[1]) {
        const rawTerm = match[1]
          .replace(/^[:\-–]+\s*/, "")
          .replace(/[.!?]+$/g, "")
          .trim();

        if (rawTerm.length >= 2) {
          return rawTerm;
        }
      }
    }

    return null;
  };

  const extractSuggestEditTerm = (text: string): string | null => {
    const normalized = text.trim().replace(/\s+/g, " ");
    const patterns = [
      /(?:tôi\s+muốn\s+)?gợi\s*ý\s+chỉnh\s*sửa(?:\s+thuật\s+ngữ)?\s+(.+)/i,
      /(?:tôi\s+muốn\s+)?chỉnh\s*sửa(?:\s+thuật\s+ngữ)?\s+(.+)/i,
      /(?:please\s+)?suggest\s+edits?(?:\s+for)?(?:\s+term)?\s+(.+)/i,
      /(?:please\s+)?edit(?:\s+the)?(?:\s+term)?\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match?.[1]) {
        const rawTerm = match[1]
          .replace(/^[:\-–]+\s*/, "")
          .replace(/[.!?]+$/g, "")
          .trim();

        if (rawTerm.length >= 2) {
          return rawTerm;
        }
      }
    }

    return null;
  };

  const findMatchedTerm = useCallback(
    async (rawTerm: string) => {
      const lang = currentLanguage || "vi";
      const result = await searchTerms(rawTerm, lang);
      const terms = result?.terms || [];

      if (terms.length === 0) {
        return null;
      }

      const exact = terms.find((item) => {
        const values = Object.values(item.term || {}).map((v) =>
          String(v || "")
            .trim()
            .toLowerCase(),
        );
        return values.includes(rawTerm.trim().toLowerCase());
      });

      return exact || terms[0] || null;
    },
    [currentLanguage],
  );

  const saveEditPrefillPayload = (payload: EditPrefillPayload): string => {
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(
      `floating-chat:edit:${key}`,
      JSON.stringify({ ...payload, createdAt: Date.now() }),
    );
    return key;
  };

  const detectQuickNavigation = useCallback(
    (text: string): QuickNavigationTarget | null => {
      const normalized = text
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

      const hasAny = (keywords: string[]) =>
        keywords.some((keyword) => normalized.includes(keyword));

      const wantsPassword = hasAny([
        "doi mat khau",
        "thay doi mat khau",
        "change password",
        "set password",
        "cap nhat mat khau",
      ]);
      if (wantsPassword) {
        return {
          path: "/profile?section=password",
          label: t("destChangePassword"),
        };
      }

      const wantsSearchHistory = hasAny([
        "lich su tim kiem",
        "lich su tra cuu",
        "search history",
        "history tim kiem",
      ]);
      if (wantsSearchHistory) {
        return {
          path: "/profile/search-history",
          label: t("destSearchHistory"),
        };
      }

      const wantsModeratorApplication = hasAny([
        "dang ky kiem duyet vien",
        "dang ki kiem duyet vien",
        "dang ky lam kiem duyet vien",
        "register moderator",
        "become moderator",
        "apply moderator",
        "ung tuyen kiem duyet vien",
      ]);
      if (wantsModeratorApplication) {
        return {
          path: "/contact?tab=moderator",
          label: t("destModeratorApplication"),
        };
      }

      const wantsFeedback = hasAny([
        "phan hoi",
        "gop y",
        "feedback",
        "bao loi",
        "report bug",
        "de xuat tinh nang",
      ]);
      if (wantsFeedback) {
        return {
          path: "/contact?tab=feedback",
          label: t("destFeedback"),
        };
      }

      const wantsRedeem = hasAny([
        "doi diem ren luyen",
        "doi diem uy tin",
        "doi diem",
        "redeem",
        "training points",
        "redeem points",
      ]);
      if (wantsRedeem) {
        return {
          path: "/profile/reputation?tab=redeem",
          label: t("destRedeemPoints"),
        };
      }

      const wantsReputation = hasAny([
        "diem ren luyen",
        "diem uy tin",
        "uy tin",
        "reputation",
        "xem diem",
      ]);
      if (wantsReputation) {
        return {
          path: "/profile/reputation",
          label: t("destReputation"),
        };
      }

      return null;
    },
    [t],
  );

  const openContributionWithAIPrefill = useCallback(
    async (term: string) => {
      const lang = currentLanguage || "vi";

      const aiData = await aiService.askAboutTerm({
        term,
        language: lang,
      });

      const termValue = aiData.term || term;
      const definitionValue = aiData.definition || aiData.response || "";

      const storageKey = saveMultiLangContributionData({
        langs: {
          [lang]: {
            term: termValue,
            definition: definitionValue,
            detailedExplanation: aiData.detailedExplanation,
            examples: aiData.examples,
          },
        },
        partOfSpeech: aiData.partOfSpeech,
        relatedTerms: aiData.relatedTerms,
        tags: aiData.tags,
      });

      router.push(
        `/contribute?from=ai&mlkey=${encodeURIComponent(storageKey)}`,
      );
      setIsOpen(false);
    },
    [currentLanguage, router],
  );

  const handleNavigateToContribute = useCallback(
    (term?: string) => {
      if (term) {
        router.push(`/contribute?term=${encodeURIComponent(term)}`);
      } else {
        router.push("/contribute");
      }
      setIsOpen(false);
    },
    [router],
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !isAuthenticated) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // If user wants to contribute, fetch AI definition and prefill contribution form.
      const quickNavigation = detectQuickNavigation(currentInput);
      if (quickNavigation) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `${t("quickNavigateSuccess")} \n\n${quickNavigation.label}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        router.push(quickNavigation.path);
        setIsOpen(false);
        return;
      }

      const searchTerm = extractSearchTerm(currentInput);

      const suggestEditTerm = extractSuggestEditTerm(currentInput);

      if (suggestEditTerm) {
        const selected = await findMatchedTerm(suggestEditTerm);

        if (!selected) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `${t("searchNotFound")} \n\n"${suggestEditTerm}"`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          return;
        }

        const lang = currentLanguage || "vi";
        let aiEditKey = "";

        try {
          const aiData = await aiService.askAboutTerm({
            term: suggestEditTerm,
            language: lang,
          });

          const payload: EditPrefillPayload = {
            lang,
            definition: aiData.definition || undefined,
            detailedExplanation: aiData.detailedExplanation || undefined,
            examples: aiData.examples?.length ? aiData.examples : undefined,
          };

          if (
            payload.definition ||
            payload.detailedExplanation ||
            payload.examples?.length
          ) {
            aiEditKey = saveEditPrefillPayload(payload);
          }
        } catch (error) {
          console.warn("Unable to prefill suggest-edit from AI:", error);
        }

        const selectedTermName =
          selected.term?.[lang as "vi" | "en" | "lo"] ||
          selected.term?.vi ||
          selected.term?.en ||
          selected.term?.lo ||
          suggestEditTerm;

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `${t("suggestEditNavigateSuccess")} \n\n"${selectedTermName}"`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const searchParams = new URLSearchParams({
          openSuggestEdit: "1",
          source: "floating-chat",
        });
        if (aiEditKey) {
          searchParams.set("aiEditKey", aiEditKey);
        }

        router.push(`/terms/${selected._id}?${searchParams.toString()}`);
        setIsOpen(false);
        return;
      }

      if (searchTerm) {
        const lang = currentLanguage || "vi";
        const selected = await findMatchedTerm(searchTerm);

        if (selected) {
          const selectedTermName =
            selected.term?.[lang as "vi" | "en" | "lo"] ||
            selected.term?.vi ||
            selected.term?.en ||
            selected.term?.lo ||
            searchTerm;

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `${t("searchNavigateSuccess")} \n\n"${selectedTermName}"`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          router.push(`/terms/${selected._id}`);
          setIsOpen(false);
          return;
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `${t("searchNotFound")} \n\n"${searchTerm}"`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      const contributeTerm = extractContributeTerm(currentInput);

      if (contributeTerm && contributeTerm.trim().length > 0) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `${t("contributeSupport")} \n\n"${contributeTerm}"`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        await openContributionWithAIPrefill(contributeTerm);
        return;
      }

      // Call AI service to get a response about the term/query
      const response = await aiService.askAboutTerm({
        term: currentInput.trim(),
        language: currentLanguage || "vi",
      });

      let assistantContent = t("defaultResponse");

      if (response.structured) {
        // Build a formatted response from structured data
        const parts: string[] = [];

        if (response.definition) {
          parts.push(`**${t("definition")}**: ${response.definition}`);
        }

        if (response.detailedExplanation) {
          parts.push(
            `**${t("explanation")}**: ${response.detailedExplanation}`,
          );
        }

        if (response.examples && response.examples.length > 0) {
          parts.push(`**${t("examples")}**: ${response.examples.join(", ")}`);
        }

        if (response.relatedTerms && response.relatedTerms.length > 0) {
          parts.push(
            `**${t("relatedTerms")}**: ${response.relatedTerms.join(", ")}`,
          );
        }

        assistantContent = parts.join("\n\n") || t("defaultResponse");
      } else if (response.response) {
        assistantContent = response.response;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || t("errorSending"));

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: t("errorResponse"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputValue,
    isAuthenticated,
    currentLanguage,
    router,
    t,
    findMatchedTerm,
    detectQuickNavigation,
    openContributionWithAIPrefill,
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {!isOpen && (
        <div className="floating-chat-dock">
          {showPrompt && (
            <div
              className="floating-chat-dock__prompt"
              role="status"
              aria-live="polite"
            >
              <Sparkles size={14} />
              <span>{promptMessages[promptIndex]}</span>
            </div>
          )}
          <button
            className="floating-chat-dock__button"
            onClick={() => setIsOpen(true)}
            title={t("openChat")}
            aria-label={t("openChat")}
          >
            <MessageCircle size={22} />
            <span className="floating-chat-dock__pulse"></span>
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <button
            className="floating-chat-overlay"
            onClick={() => setIsOpen(false)}
            aria-label={t("close")}
          />

          <aside
            className="floating-chat-sidebar"
            role="dialog"
            aria-label={t("chatTitle")}
          >
            <div className="floating-chat-sidebar__header">
              <div className="floating-chat-sidebar__title-wrap">
                <MessageCircle size={18} />
                <h3 className="floating-chat-sidebar__title">
                  {t("chatTitle")}
                </h3>
              </div>
              <button
                className="floating-chat-sidebar__close"
                onClick={() => setIsOpen(false)}
                aria-label={t("close")}
                title={t("close")}
              >
                <X size={20} />
              </button>
            </div>

            <div className="floating-chat-sidebar__messages">
              {messages.length === 0 && (
                <div className="floating-chat-sidebar__welcome">
                  <MessageCircle size={32} />
                  <h4>{greetingPrompt || t("welcome")}</h4>
                  <p>{t("welcomeMessage")}</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    className={`floating-chat-sidebar__message floating-chat-sidebar__message--${msg.role}`}
                  >
                    <div className="floating-chat-sidebar__message-content">
                      {msg.content}
                    </div>
                  </div>
                  {msg.action && msg.action.type === "contribute" && (
                    <div className="floating-chat-sidebar__action-button">
                      <button
                        className="floating-chat-sidebar__contribute-btn"
                        onClick={() =>
                          handleNavigateToContribute(msg.action?.term)
                        }
                      >
                        <ArrowRight size={16} />
                        {t("goToContribute")}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="floating-chat-sidebar__message floating-chat-sidebar__message--assistant">
                  <div className="floating-chat-sidebar__message-content floating-chat-sidebar__message-content--loading">
                    <Loader2
                      size={16}
                      className="floating-chat-sidebar__spinner"
                    />
                    {t("typing")}
                  </div>
                </div>
              )}
            </div>

            <div className="floating-chat-sidebar__input-area">
              <textarea
                className="floating-chat-sidebar__input"
                placeholder={t("placeholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                rows={3}
              />
              <button
                className="floating-chat-sidebar__send"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                aria-label={t("send")}
                title={t("send")}
              >
                <Send size={18} />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
