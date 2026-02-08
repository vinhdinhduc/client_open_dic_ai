"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { aiService, AIResponse } from "@/services/aiService";
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

interface AIChatProps {
  term: string;
  language?: string;
  onClose: () => void;
}

// Labels theo ngôn ngữ
const labels: Record<string, Record<string, string>> = {
  vi: {
    assistant: "Trợ lý AI",
    about: "Tìm hiểu về",
    close: "Đóng",
    loading: "Đang hỏi AI về thuật ngữ...",
    retry: "Thử lại",
    askAgain: "Hỏi lại",
    definition: "Định nghĩa",
    explanation: "Giải thích chi tiết",
    examples: "Ví dụ",
    relatedTerms: "Thuật ngữ liên quan",
    tags: "Từ khóa",
    field: "Lĩnh vực",
    disclaimer:
      "💡 Thông tin được cung cấp bởi AI có thể không chính xác 100%. Vui lòng kiểm chứng từ các nguồn đáng tin cậy.",
  },
  en: {
    assistant: "AI Assistant",
    about: "Learn about",
    close: "Close",
    loading: "Asking AI about the term...",
    retry: "Retry",
    askAgain: "Ask again",
    definition: "Definition",
    explanation: "Detailed Explanation",
    examples: "Examples",
    relatedTerms: "Related Terms",
    tags: "Tags",
    field: "Field",
    disclaimer:
      "💡 Information provided by AI may not be 100% accurate. Please verify from reliable sources.",
  },
  lo: {
    assistant: "ຜູ້ຊ່ວຍ AI",
    about: "ຮຽນຮູ້ກ່ຽວກັບ",
    close: "ປິດ",
    loading: "ກຳລັງຖາມ AI ກ່ຽວກັບຄຳສັບ...",
    retry: "ລອງໃໝ່",
    askAgain: "ຖາມອີກ",
    definition: "ຄວາມໝາຍ",
    explanation: "ຄຳອະທິບາຍລະອຽດ",
    examples: "ຕົວຢ່າງ",
    relatedTerms: "ຄຳສັບທີ່ກ່ຽວຂ້ອງ",
    tags: "ແທັກ",
    field: "ຂົງເຂດ",
    disclaimer:
      "💡 ຂໍ້ມູນທີ່ສະໜອງໂດຍ AI ອາດບໍ່ຖືກຕ້ອງ 100%. ກະລຸນາກວດສອບຈາກແຫຼ່ງທີ່ເຊື່ອຖືໄດ້.",
  },
};

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

  const t = labels[language] || labels.vi;

  // Tự động gọi AI khi component mount
  useEffect(() => {
    if (isAuthenticated && term) {
      handleAskAI();
    }
  }, [term, language]);

  const handleAskAI = async () => {
    if (!term.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.askAboutTerm({
        term: term.trim(),
        language,
      });
      console.log("AI Response:", result);
      setResponse(result);
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      setError(err.message || "Đã có lỗi xảy ra khi kết nối với AI");
      toast.error("Không thể nhận phản hồi từ AI");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle contribute - chuyển đến trang đóng góp thuật ngữ với data từ AI
   */
  const handleContribute = (data: AIResponse) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đóng góp thuật ngữ");
      return;
    }

    // Encode AI data để truyền qua URL
    const aiData = encodeURIComponent(
      JSON.stringify({
        term: data.term,
        definition: data.definition,
        detailedExplanation: data.detailedExplanation,
        examples: data.examples,
        partOfSpeech: data.partOfSpeech,
        field: data.field,
        relatedTerms: data.relatedTerms,
        tags: data.tags,
        language: data.language,
      }),
    );

    // Đóng modal và chuyển đến trang contribute
    onClose();
    router.push(`/contribute?aiData=${aiData}`);
  };

  /**
   * Render structured AI response khớp cấu trúc Term model - format như TermDetailView
   */
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
            {t.definition}
          </h3>
          <div className="ai-chat__definition-box">{data.definition}</div>
        </section>
      )}

      {/* Detailed Explanation */}
      {data.detailedExplanation && (
        <section className="ai-chat__section">
          <h3 className="ai-chat__section-title">
            <FileText size={18} />
            {t.explanation}
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
            {t.examples}
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
            {t.relatedTerms}
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
            {t.tags}
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
            💡 Thông tin này hữu ích?
          </h4>
          <p className="ai-chat__contribute-text">
            Bạn có muốn đóng góp thuật ngữ <strong>"{data.term}"</strong> vào hệ
            thống từ điển để mọi người cùng tra cứu không?
          </p>
          <div className="ai-chat__contribute-actions">
            <button
              className="ai-chat__contribute-btn ai-chat__contribute-btn--primary"
              onClick={() => handleContribute(data)}
            >
              <FileText size={16} />
              Đóng góp thuật ngữ này
            </button>
            <button
              className="ai-chat__contribute-btn ai-chat__contribute-btn--secondary"
              onClick={onClose}
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render fallback (raw markdown) khi AI không trả về JSON
   */
  const renderFallbackResponse = (data: AIResponse) => (
    <div className="ai-chat__fallback">
      <div className="ai-chat__fallback-notice">
        <AlertCircle size={20} />
        <p>
          <strong>Lưu ý:</strong> AI trả về định dạng không chuẩn. Dưới đây là
          phản hồi gốc:
        </p>
      </div>
      <div className="ai-chat__message-content">
        <ReactMarkdown>{data.response || ""}</ReactMarkdown>
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
              <h3>{t.assistant}</h3>
              <span className="ai-chat__subtitle">
                {t.about}: <strong>{term}</strong>
              </span>
            </div>
          </div>
          <button
            className="ai-chat__close-btn"
            onClick={onClose}
            aria-label={t.close}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="ai-chat__content">
          {isLoading && (
            <div className="ai-chat__loading">
              <Loader2 className="ai-chat__spinner" size={32} />
              <p>{t.loading}</p>
            </div>
          )}

          {error && (
            <div className="ai-chat__error">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button className="ai-chat__retry-btn" onClick={handleAskAI}>
                {t.retry}
              </button>
            </div>
          )}

          {response && !isLoading && !error && (
            <div className="ai-chat__response">
              <div className="ai-chat__message">
                <div className="ai-chat__message-header">
                  <Bot size={20} />
                  <span>{t.assistant}</span>
                  {response.model && (
                    <span className="ai-chat__model">({response.model})</span>
                  )}
                </div>

                {/* Render structured hoặc fallback */}
                {response.structured
                  ? renderStructuredResponse(response)
                  : renderFallbackResponse(response)}
              </div>

              <div className="ai-chat__footer-info">
                <p className="ai-chat__disclaimer">{t.disclaimer}</p>
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
            {t.close}
          </button>
          {response && (
            <button
              className="ai-chat__action-btn ai-chat__action-btn--primary"
              onClick={handleAskAI}
              disabled={isLoading}
            >
              <Send size={16} />
              {t.askAgain}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
