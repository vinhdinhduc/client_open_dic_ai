"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Loader2,
  CheckCircle,
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { aiService, AIResponse } from "@/services/aiService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import "./AIFieldAssist.scss";

type FieldType = "definition" | "explanation";

interface AIFieldAssistProps {
  /** Tên thuật ngữ dùng làm ngữ cảnh cho AI */
  termContext: string;
  /** Loại field cần hỗ trợ */
  fieldType: FieldType;
  /** Ngôn ngữ hiện tại của field */
  language: string;
  /** Callback khi người dùng chấp nhận nội dung do AI tạo */
  onInsert: (content: string) => void;
  /** Có hiển thị nút hay không (ẩn khi term chưa nhập) */
  disabled?: boolean;
}

const FIELD_LABELS: Record<FieldType, string> = {
  definition: "định nghĩa",
  explanation: "giải thích chi tiết",
};

const LANG_FLAGS: Record<string, string> = {
  vi: "🇻🇳",
  en: "🇬🇧",
  lo: "🇱🇦",
};

export default function AIFieldAssist({
  termContext,
  fieldType,
  language,
  onInsert,
  disabled = false,
}: AIFieldAssistProps) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(language);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync language khi prop thay đổi
  useEffect(() => {
    setSelectedLang(language);
    // Reset kết quả khi đổi ngôn ngữ
    setResult(null);
    setError(null);
  }, [language]);

  // Đóng panel khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleGenerate = useCallback(async () => {
    if (!termContext.trim()) {
      toast.error("Vui lòng nhập tên thuật ngữ trước khi dùng AI hỗ trợ");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng AI");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiService.askAboutTerm({
        term: termContext.trim(),
        language: selectedLang,
      });
      setResult(data);
    } catch (err: any) {
      const msg = err.message || "Không thể kết nối với dịch vụ AI";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [termContext, selectedLang, isAuthenticated]);

  const getFieldContent = (data: AIResponse): string => {
    if (fieldType === "definition") return data.definition || "";
    if (fieldType === "explanation") return data.detailedExplanation || "";
    return "";
  };

  const handleApply = () => {
    if (!result) return;
    const content = getFieldContent(result);
    if (!content) {
      toast.error("AI không trả về nội dung cho trường này");
      return;
    }
    // Bọc plain text trong thẻ <p> nếu chưa có HTML
    const htmlContent = content.startsWith("<") ? content : `<p>${content}</p>`;
    onInsert(htmlContent);
    setIsOpen(false);
    setResult(null);
    toast.success("Đã áp dụng nội dung AI vào trường");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="ai-field-assist">
      <button
        ref={triggerRef}
        type="button"
        className={`ai-field-assist__trigger ${isOpen ? "active" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        title={
          disabled
            ? "Nhập tên thuật ngữ để dùng AI hỗ trợ"
            : `AI hỗ trợ điền ${FIELD_LABELS[fieldType]}`
        }
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <Sparkles size={13} />
        <span>AI</span>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="ai-field-assist__panel"
          role="dialog"
          aria-label="AI hỗ trợ điền nội dung"
        >
          {/* Header */}
          <div className="ai-field-assist__panel-header">
            <div className="ai-field-assist__panel-title">
              <Bot size={16} />
              <span>
                AI hỗ trợ – <em>{FIELD_LABELS[fieldType]}</em>
              </span>
            </div>
            <button
              type="button"
              className="ai-field-assist__panel-close"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng"
            >
              <X size={14} />
            </button>
          </div>

          {/* Context info */}
          <div className="ai-field-assist__context">
            <span className="ai-field-assist__context-label">Thuật ngữ:</span>
            <strong className="ai-field-assist__context-term">
              {termContext || <em>(chưa nhập)</em>}
            </strong>
          </div>

          {/* Language + Generate */}
          <div className="ai-field-assist__actions">
            <select
              className="ai-field-assist__lang-select"
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                setResult(null);
              }}
              disabled={isLoading}
            >
              <option value="vi">{LANG_FLAGS.vi} Tiếng Việt</option>
              <option value="en">{LANG_FLAGS.en} English</option>
              <option value="lo">{LANG_FLAGS.lo} ພາສາລາວ</option>
            </select>
            <button
              type="button"
              className="ai-field-assist__generate-btn"
              onClick={handleGenerate}
              disabled={isLoading || !termContext.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Tạo nội dung
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="ai-field-assist__error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && !isLoading && (
            <div className="ai-field-assist__result">
              <div className="ai-field-assist__result-content">
                {getFieldContent(result) || (
                  <span className="ai-field-assist__result-empty">
                    AI không tạo được nội dung cho trường này
                  </span>
                )}
              </div>
              {getFieldContent(result) && (
                <button
                  type="button"
                  className="ai-field-assist__apply-btn"
                  onClick={handleApply}
                >
                  <CheckCircle size={14} />
                  Áp dụng
                </button>
              )}
            </div>
          )}

          <p className="ai-field-assist__disclaimer">
            ⚠ Nội dung AI có thể không chính xác. Vui lòng kiểm tra trước khi
            gửi.
          </p>
        </div>
      )}
    </div>
  );
}
