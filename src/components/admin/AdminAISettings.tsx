"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  Bot,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code2,
  RotateCcw,
  Copy,
  Check,
  Info,
} from "lucide-react";
import aiService, { AIConfig } from "@/services/aiService";
import "./AdminAISettings.scss";

// ─────────────────────────────────────────────────────────────────────────────
// Default prompts mirrored from aiService.js — kept in sync manually.
// These are what the system uses when a custom prompt field is left empty.
// ─────────────────────────────────────────────────────────────────────────────
const JSON_SCHEMA = `{
  "definition": "Định nghĩa ngắn gọn, chính xác (1-2 câu)",
  "detailedExplanation": "Giải thích chi tiết, dễ hiểu (khoảng 2 đoạn vừa đủ không quá dài)",
  "examples": ["Ví dụ thực tế 1"],
  "partOfSpeech": "noun | verb | adjective | adverb | phrase | abbreviation",
  "field": "Lĩnh vực chuyên môn",
  "relatedTerms": ["Thuật ngữ liên quan 1", "Thuật ngữ liên quan 2"],
  "tags": ["tag1", "tag2", "tag3"]
}`;

const DEFAULT_PROMPTS: Record<
  "definition" | "explanation" | "answer",
  Record<"vi" | "en" | "lo", string>
> = {
  /** getSystemPrompt() — vi/en/lo blocks from aiService.js */
  definition: {
    vi: `Bạn là trợ lý AI chuyên về hệ thống từ điển mở OpenDict đa ngôn ngữ.
Nhiệm vụ: giải thích thuật ngữ và trả về JSON chuẩn theo schema sau:
${JSON_SCHEMA}

Quy tắc:
- Trả lời bằng tiếng Việt
- definition: ngắn gọn, súc tích, chính xác (1-2 câu)
- detailedExplanation: chi tiết khoảng 2 đoạn vừa đủ không quá dài. Sử dụng \\n để xuống dòng giữa các đoạn
- examples: ít nhất 1 ví dụ thực tế, mỗi ví dụ là 1 câu hoàn chỉnh
- partOfSpeech: chọn MỘT trong: noun, verb, adjective, adverb, phrase, abbreviation
- field: lĩnh vực chuyên môn chính của thuật ngữ
- relatedTerms: 3-5 thuật ngữ liên quan trực tiếp
- tags: 3-5 từ khóa phân loại
- QUAN TRỌNG: Escape đúng các ký tự đặc biệt trong JSON (newline = \\n, quote = \\", backslash = \\\\)
- CHỈ trả về JSON thuần hợp lệ, không thêm text hay markdown code block`,

    en: `You are an AI assistant specialized in technical terminology dictionary.
Task: explain terms and return JSON matching this schema:
${JSON_SCHEMA}

Rules:
- Respond in English
- definition: concise, accurate (1-2 sentences)
- detailedExplanation: detailed about 2 paragraphs, not too long. Use \\n for line breaks between paragraphs
- examples: at least 1 real-world example, each a complete sentence
- partOfSpeech: choose ONE from: noun, verb, adjective, adverb, phrase, abbreviation
- field: primary field of expertise
- relatedTerms: 3-5 directly related terms
- tags: 3-5 classification keywords
- IMPORTANT: Properly escape special characters in JSON (newline = \\n, quote = \\", backslash = \\\\)
- Return ONLY valid pure JSON, no extra text or markdown code blocks`,

    lo: `ທ່ານເປັນຜູ້ຊ່ວຍ AI ຊ່ຽວຊານດ້ານວັດຈະນານຸກົມສັບຕ້ານເຕັກນິກ.
ວຽກງານ: ອະທິບາຍສັບຕ້ານ ແລະ ສົ່ງຄືນ JSON ຕາມ schema ນີ້:
${JSON_SCHEMA}

ກົດລະບຽບ:
- ຕອບເປັນພາສາລາວ
- definition: ສັ້ນ, ຊັດເຈນ (1-2 ປະໂຫຍກ)
- detailedExplanation: ລາຍລະອຽດ 2 ວັກ, ບໍ່ຍາວເກີນ. ໃຊ້ \\n ເພື່ອຂຶ້ນແຖວໃໝ່
- examples: ຢ່າງໜ້ອຍ 1 ຕົວຢ່າງຕົວຈິງ
- partOfSpeech: ເລືອກ 1 ຈາກ: noun, verb, adjective, adverb, phrase, abbreviation
- field: ຂົງເຂດຊ່ຽວຊານຫຼັກ
- relatedTerms: 3-5 ສັບຕ້ານທີ່ກ່ຽວຂ້ອງ
- tags: 3-5 ຄຳສຳຄັນ
- ສຳຄັນ: Escape ຕົວອັກສອນພິເສດໃນ JSON ຢ່າງຖືກຕ້ອງ
- ສົ່ງຄືນ JSON ທີ່ຖືກຕ້ອງເທົ່ານັ້ນ`,
  },

  /** Same system prompt; custom explanation is appended as supplement */
  explanation: {
    vi: `[Dùng chung system prompt với Definition]

Phần tuỳ chỉnh bên dưới sẽ được nối thêm dưới dạng:
"Hướng dẫn thêm cho detailedExplanation: <nội dung bạn nhập>"

Mặc định từ code — detailedExplanation rule:
- Chi tiết khoảng 2 đoạn vừa đủ, không quá dài
- Sử dụng \\n để xuống dòng giữa các đoạn
- Giải thích rõ ràng, dễ hiểu cho người mới`,

    en: `[Shares system prompt with Definition]

Your custom text will be appended as:
"Additional instruction for detailedExplanation: <your text>"

Default from code — detailedExplanation rule:
- Detailed about 2 paragraphs, not too long
- Use \\n for line breaks between paragraphs
- Clear and easy-to-understand explanations`,

    lo: `[ໃຊ້ system prompt ຮ່ວມກັບ Definition]

ຂໍ້ຄວາມທີ່ທ່ານໃສ່ຈະຖືກຕໍ່ເພີ່ມດ້ວຍ:
"ຄຳແນະນຳເພີ່ມເຕີມສຳລັບ detailedExplanation: <ຂໍ້ຄວາມຂອງທ່ານ>"

ຄ່າເລີ່ມຕົ້ນ — ກົດລະບຽບ detailedExplanation:
- ລາຍລະອຽດ 2 ວັກ, ບໍ່ຍາວເກີນ
- ໃຊ້ \\n ສຳລັບການຂຶ້ນແຖວໃໝ່`,
  },

  /** buildAssistantPrompt() — systemKnowledge blocks from aiService.js */
  answer: {
    vi: `Bạn là trợ lý AI của hệ thống UTB OpenDict.
Mục tiêu: trả lời tự nhiên, thân thiện, rõ ràng, dễ hiểu như người thật.

PHẠM VI BẮT BUỘC:
- Chỉ trả lời nội dung liên quan: từ điển, thuật ngữ, UTB OpenDict.
- Nếu câu hỏi ngoài phạm vi: từ chối lịch sự và gợi ý người dùng hỏi lại theo đúng phạm vi.

TRI THỨC HỆ THỐNG UTB OpenDict:
- Nền tảng từ điển thuật ngữ đa ngôn ngữ (Việt - Anh - Lào).
- Chức năng chính: tra cứu thuật ngữ, đăng ký/đăng nhập, đóng góp thuật ngữ, duyệt và quản lý thuật ngữ.
- Đăng ký: vào trang register, điền thông tin, xác thực tài khoản.
- Đăng nhập: vào trang login, nhập email và mật khẩu.
- Thêm thuật ngữ: vào trang contribute, nhập thuật ngữ + định nghĩa + ví dụ + lĩnh vực.

NĂNG LỰC AI:
- Nhận diện thuật ngữ & phân loại lĩnh vực.
- Dịch thuật ngữ giữa Anh - Việt - Lào.
- Gợi ý từ đồng nghĩa hoặc liên quan.

FORMAT ĐẦU RA:
- KHÔNG bắt buộc JSON — linh hoạt theo nội dung.
- Ưu tiên câu ngắn, rõ ý, tránh dài dòng.`,

    en: `You are the UTB OpenDict AI assistant.
Goal: respond naturally, clearly, and helpfully like a human assistant.

REQUIRED SCOPE:
- Only answer topics related to dictionary terms and UTB OpenDict.
- For out-of-scope queries, politely refuse and redirect.

UTB OpenDict KNOWLEDGE:
- Multilingual terminology dictionary platform (Vietnamese, English, Lao).
- Main features: term lookup, register/login, term contribution, term moderation.
- Register: open register page, submit account info.
- Login: open login page, use email and password.
- Add term: open contribute page, provide term, definition, examples, and field.

AI TERM CAPABILITIES:
- Term recognition & domain classification.
- EN-VI-LO translation.
- Synonym and related-term suggestions.

OUTPUT FORMAT:
- Do NOT force JSON — flexible output.
- Keep answers concise, friendly, easy to follow.`,

    lo: `ທ່ານແມ່ນຜູ້ຊ່ວຍ AI ຂອງ UTB OpenDict.
ເປົ້າໝາຍ: ຕອບໃຫ້ເປັນທຳມະຊາດ, ຊັດເຈນ, ເຂົ້າໃຈງ່າຍ.

ຂອບເຂດບັງຄັບ:
- ຕອບສະເພາະເນື້ອຫາທີ່ກ່ຽວກັບຄຳສັບ, ວັດຈະນານຸກົມ ແລະ UTB OpenDict.
- ຖ້ານອກຂອບເຂດ: ປະຕິເສດຢ່າງສຸພາບ.

ຄວາມຮູ້ UTB OpenDict:
- ລະບົບວັດຈະນານຸກົມຫຼາຍພາສາ (VI-EN-LO).
- ຟັງຊັນຫຼັກ: ຄົ້ນຫາ, ລົງທະບຽນ/ເຂົ້າລະບົບ, ສົ່ງ, ກວດອະນຸມັດ.

ຄວາມສາມາດ AI:
- ຈຳແນກ ແລະ ຈັດປະເພດຄຳສັບ.
- ແປ EN-VI-LO.
- ແນະນຳຄຳຄ້າຍຄື.

ຮູບແບບຄຳຕອບ:
- ບໍ່ຕ້ອງ JSON — ຮູບແບບທີ່ຍືດຫຍຸ່ນ.`,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Default Prompt Preview Panel
// ─────────────────────────────────────────────────────────────────────────────
interface DefaultPromptPanelProps {
  promptKey: keyof typeof DEFAULT_PROMPTS;
  lang: string;
  customValue: string;
  onReset: () => void;
}

function DefaultPromptPanel({
  promptKey,
  lang,
  customValue,
  onReset,
}: DefaultPromptPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const validLang = (["vi", "en", "lo"].includes(lang) ? lang : "vi") as
    | "vi"
    | "en"
    | "lo";
  const defaultText = DEFAULT_PROMPTS[promptKey][validLang];
  const isUsingDefault = !customValue || customValue.trim() === "";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(defaultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể copy vào clipboard");
    }
  }, [defaultText]);

  return (
    <div className="prompt-default-panel">
      {/* Status row */}
      <div className="prompt-default-panel__status-row">
        <span
          className={`prompt-status-badge ${
            isUsingDefault
              ? "prompt-status-badge--default"
              : "prompt-status-badge--custom"
          }`}
        >
          {isUsingDefault ? (
            <>
              <Code2 size={12} />
              Đang dùng mặc định từ code
            </>
          ) : (
            <>
              <Check size={12} />
              Đã tuỳ chỉnh
            </>
          )}
        </span>

        <div className="prompt-default-panel__actions">
          {!isUsingDefault && (
            <button
              type="button"
              className="prompt-default-btn prompt-default-btn--reset"
              onClick={onReset}
              title="Xoá tuỳ chỉnh, dùng lại prompt mặc định"
            >
              <RotateCcw size={13} />
              Xoá tuỳ chỉnh
            </button>
          )}
          <button
            type="button"
            className="prompt-default-btn prompt-default-btn--toggle"
            onClick={() => setIsExpanded((v) => !v)}
          >
            <Code2 size={13} />
            Xem mặc định
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="prompt-default-panel__preview">
          <div className="prompt-default-panel__preview-header">
            <span className="prompt-default-panel__preview-label">
              <Info size={13} />
              {isUsingDefault
                ? "Prompt này đang được áp dụng"
                : "Prompt mặc định (không được áp dụng vì đã có tuỳ chỉnh)"}
            </span>
            <button
              type="button"
              className="prompt-default-btn prompt-default-btn--copy"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  Đã copy
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="prompt-default-panel__code">{defaultText}</pre>
          {!isUsingDefault && (
            <p className="prompt-default-panel__append-note">
              <AlertCircle size={13} />
              Nội dung tuỳ chỉnh của bạn sẽ được nối thêm vào sau prompt trên.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminAISettings() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [promptLang, setPromptLang] = useState<string>("vi");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const PROMPT_LANGS = [
    { code: "vi", label: "Tiếng Việt" },
    { code: "en", label: "English" },
    { code: "lo", label: "ພາສາລາວ" },
  ];

  const [formData, setFormData] = useState({
    apiKey: "",
    provider: "gemini",
    model: "gemini-2.5-flash",
    maxTokens: 1000,
    promptDefinition: {} as Record<string, string>,
    promptExplanation: {} as Record<string, string>,
    promptAnswer: {} as Record<string, string>,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const data = await aiService.getConfig();

      setConfig(data);
      setHasExistingConfig(!!data.apiKey || !!data.hasApiKey);

      const isMaskedApiKey = data.apiKey && data.apiKey.includes("***");

      setFormData({
        apiKey: isMaskedApiKey ? "" : data.apiKey || "",
        provider: data.provider || "gemini",
        model: data.model || "gemini-2.5-flash",
        maxTokens: data.maxTokens || 1000,
        promptDefinition:
          data.promptDefinition && typeof data.promptDefinition === "object"
            ? data.promptDefinition
            : {},
        promptExplanation:
          data.promptExplanation && typeof data.promptExplanation === "object"
            ? data.promptExplanation
            : {},
        promptAnswer:
          data.promptAnswer && typeof data.promptAnswer === "object"
            ? data.promptAnswer
            : {},
      });
    } catch (error: any) {
      console.error("Load config error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setTestResult(null);

      if (formData.apiKey && formData.apiKey.length < 10) {
        toast.error("API Key không hợp lệ");
        return;
      }

      if (formData.maxTokens < 100 || formData.maxTokens > 8192) {
        toast.error("Max Tokens phải từ 100 đến 8192");
        return;
      }

      await aiService.updateConfig(formData);

      toast.success(
        hasExistingConfig
          ? "Đã cập nhật cấu hình AI thành công"
          : "Đã tạo mới cấu hình AI thành công",
      );
      await loadConfig();
    } catch (error: any) {
      console.error("Save config error:", error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      const result = await aiService.testConnection();
      setTestResult({
        success: result.success && result.configured,
        message: result.message,
      });

      if (result.success && result.configured) {
        toast.success("Kết nối AI thành công!");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      setTestResult({
        success: false,
        message: error.message,
      });
      toast.error(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "provider") {
      const defaultModels: Record<string, string> = {
        gemini: "gemini-2.5-flash",
        openai: "gpt-3.5-turbo",
        grok: "grok-3",
      };
      setFormData((prev) => ({
        ...prev,
        provider: value,
        model: defaultModels[value] || "",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "temperature" || name === "maxTokens"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  /** Clear a custom prompt for one lang → fall back to code default */
  const resetPrompt = (
    field: "promptDefinition" | "promptExplanation" | "promptAnswer",
    lang: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as Record<string, string>),
        [lang]: "",
      },
    }));
    toast.success("Đã xoá tuỳ chỉnh — prompt mặc định sẽ được dùng");
  };

  if (isLoading) {
    return (
      <div className="admin-settings-section">
        <div className="admin-settings-section__loading">
          <RefreshCw className="spin" size={32} />
          <p>Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-section">
      <div className="admin-settings-section__header">
        <Bot size={28} />
        <h2>Cài đặt AI</h2>
      </div>

      {/* Status Badge */}
      {config?.hasApiKey && (
        <div className="admin-settings-section__status">
          <CheckCircle size={18} />
          <span>API Key đã được cấu hình</span>
        </div>
      )}

      {/* Provider Selection */}
      <div className="admin-settings-section__group">
        <h3>Nhà cung cấp AI</h3>
        <div className="form-group">
          <label htmlFor="provider">Provider</label>
          <select
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="gemini">Google Gemini</option>
            <option value="grok">xAI Grok</option>
            <option value="openai">OpenAI (Coming soon)</option>
          </select>
          <small className="form-text">
            Chọn nhà cung cấp dịch vụ AI bạn muốn sử dụng
          </small>
        </div>
      </div>

      {/* API Configuration */}
      <div className="admin-settings-section__group">
        <h3>Cấu hình API</h3>

        <div className="form-group">
          <label htmlFor="apiKey">
            API Key
            {formData.provider === "gemini" && (
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-link"
              >
                <ExternalLink size={14} />
                Lấy API key
              </a>
            )}
            {formData.provider === "grok" && (
              <a
                href="https://console.x.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-link"
              >
                <ExternalLink size={14} />
                Lấy API key tại x.ai
              </a>
            )}
            {formData.provider === "openai" && (
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-link"
              >
                <ExternalLink size={14} />
                Lấy API key
              </a>
            )}
          </label>
          <div className="input-group">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder={
                config?.hasApiKey && !formData.apiKey
                  ? "API key hiện tại: " + (config.apiKey || "****")
                  : "Nhập API key mới..."
              }
              className="form-control"
            />
            <button
              type="button"
              className="input-group__btn"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? "Ẩn API key" : "Hiện API key"}
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <small className="form-text">
            {config?.hasApiKey && !formData.apiKey ? (
              <span className="text-success">
                <CheckCircle size={18} /> API key đã được mã hóa AES-256 và lưu
                trữ an toàn. Để thay đổi, nhập API key mới.
              </span>
            ) : (
              <span>
                API key sẽ được mã hóa AES-256-GCM trước khi lưu vào database
              </span>
            )}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="model">Model</label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="form-control"
          >
            {formData.provider === "gemini" && (
              <>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-flash-lite">
                  Gemini 2.5 Flash Lite
                </option>
                <option value="gemini-2.5-flash-tts">
                  Gemini 2.5 Flash TTS
                </option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemma-3-12b">Gemma 3 12B</option>
              </>
            )}
            {formData.provider === "grok" && (
              <>
                <option value="grok-3">Grok 3</option>
                <option value="grok-3-fast">Grok 3 Fast</option>
                <option value="grok-3-mini">Grok 3 Mini</option>
                <option value="grok-3-mini-fast">Grok 3 Mini Fast</option>
                <option value="grok-2-1212">Grok 2 (1212)</option>
              </>
            )}
            {formData.provider === "openai" && (
              <>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              </>
            )}
          </select>
          <small className="form-text">
            {formData.provider === "gemini" &&
              "Sử dụng Google Generative AI SDK — hỗ trợ đầy đủ các models mới nhất"}
            {formData.provider === "grok" &&
              "Sử dụng xAI API — cùng định dạng với OpenAI, base URL: api.x.ai"}
            {formData.provider === "openai" && "Sử dụng OpenAI API chính thức"}
          </small>
        </div>
      </div>

      {/* ─── Prompt Templates ─────────────────────────────────────────────── */}
      <div className="admin-settings-section__group">
        <div className="prompt-section-header">
          <h3>Mẫu Prompt AI</h3>
          <span className="prompt-section-badge">
            <Code2 size={13} />
            Prompt mặc định được nhúng từ code nguồn
          </span>
        </div>
        <p className="prompt-section-desc">
          Tuỳ chỉnh prompt gửi cho AI theo từng ngôn ngữ. Dùng{" "}
          <code>{"{term}"}</code> để đại diện thuật ngữ.
          <br />
          <strong>Lưu ý:</strong> Nếu để trống, hệ thống sẽ tự động dùng prompt
          mặc định được định nghĩa trong code — bấm <em>"Xem mặc định"</em> để
          xem nội dung đang chạy.
        </p>

        {/* Language Tabs */}
        <div className="prompt-lang-tabs">
          {PROMPT_LANGS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`admin-btn ${
                promptLang === lang.code
                  ? "admin-btn--primary"
                  : "admin-btn--secondary"
              }`}
              onClick={() => setPromptLang(lang.code)}
            >
              {lang.label}
              {/* Dot indicator: green if all 3 prompts customised for this lang */}
              {(formData.promptDefinition[lang.code] ||
                formData.promptExplanation[lang.code] ||
                formData.promptAnswer[lang.code]) && (
                <span className="lang-tab-dot" title="Có tuỳ chỉnh" />
              )}
            </button>
          ))}
        </div>

        {/* ── promptDefinition ── */}
        <div className="form-group">
          <label htmlFor="promptDefinition">
            Prompt Định nghĩa (
            {PROMPT_LANGS.find((l) => l.code === promptLang)?.label})
          </label>
          <DefaultPromptPanel
            promptKey="definition"
            lang={promptLang}
            customValue={formData.promptDefinition[promptLang] || ""}
            onReset={() => resetPrompt("promptDefinition", promptLang)}
          />
          <textarea
            id="promptDefinition"
            name="promptDefinition"
            value={formData.promptDefinition[promptLang] || ""}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                promptDefinition: {
                  ...prev.promptDefinition,
                  [promptLang]: e.target.value,
                },
              }));
            }}
            className="form-control"
            rows={3}
            placeholder="Để trống → dùng prompt mặc định từ code. VD: Hãy định nghĩa thuật ngữ CNTT '{term}' bằng tiếng Việt, ngắn gọn và chính xác."
          />
        </div>

        {/* ── promptExplanation ── */}
        <div className="form-group">
          <label htmlFor="promptExplanation">
            Prompt Giải thích chi tiết (
            {PROMPT_LANGS.find((l) => l.code === promptLang)?.label})
          </label>
          <DefaultPromptPanel
            promptKey="explanation"
            lang={promptLang}
            customValue={formData.promptExplanation[promptLang] || ""}
            onReset={() => resetPrompt("promptExplanation", promptLang)}
          />
          <textarea
            id="promptExplanation"
            name="promptExplanation"
            value={formData.promptExplanation[promptLang] || ""}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                promptExplanation: {
                  ...prev.promptExplanation,
                  [promptLang]: e.target.value,
                },
              }));
            }}
            className="form-control"
            rows={3}
            placeholder="Để trống → dùng prompt mặc định từ code. VD: Hãy giải thích chi tiết thuật ngữ CNTT '{term}' bằng tiếng Việt."
          />
        </div>

        {/* ── promptAnswer ── */}
        <div className="form-group">
          <label htmlFor="promptAnswer">
            Prompt Hỏi đáp / Chat Agent (
            {PROMPT_LANGS.find((l) => l.code === promptLang)?.label})
          </label>
          <DefaultPromptPanel
            promptKey="answer"
            lang={promptLang}
            customValue={formData.promptAnswer[promptLang] || ""}
            onReset={() => resetPrompt("promptAnswer", promptLang)}
          />
          <textarea
            id="promptAnswer"
            name="promptAnswer"
            value={formData.promptAnswer[promptLang] || ""}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                promptAnswer: {
                  ...prev.promptAnswer,
                  [promptLang]: e.target.value,
                },
              }));
            }}
            className="form-control"
            rows={3}
            placeholder="Để trống → dùng prompt mặc định từ code. VD: Trả lời câu hỏi về thuật ngữ CNTT '{term}': {question}"
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="admin-settings-section__group">
        <h3>Cài đặt nâng cao</h3>

        <div className="form-group">
          <label htmlFor="maxTokens">Max Tokens</label>
          <input
            type="number"
            id="maxTokens"
            name="maxTokens"
            min="100"
            max="4000"
            step="100"
            value={formData.maxTokens}
            onChange={handleInputChange}
            className="form-control"
          />
          <small className="form-text">
            Số token tối đa cho mỗi phản hồi (100-4000)
          </small>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`admin-settings-section__test-result ${
            testResult.success
              ? "admin-settings-section__test-result--success"
              : "admin-settings-section__test-result--error"
          }`}
        >
          {testResult.success ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <p>{testResult.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="admin-settings-section__actions">
        <button
          className="admin-btn admin-btn--secondary"
          onClick={handleTest}
          disabled={isTesting || isSaving}
        >
          {isTesting ? (
            <>
              <RefreshCw className="spin" size={18} />
              Đang test...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Test kết nối
            </>
          )}
        </button>

        <button
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={isSaving || isTesting}
        >
          {isSaving ? (
            <>
              <RefreshCw className="spin" size={18} />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={18} />
              Lưu cấu hình
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="admin-settings-section__info">
        <AlertCircle size={20} />
        <div>
          <h4>Hướng dẫn sử dụng</h4>
          <ul>
            <li>
              <strong>SDK:</strong> Sử dụng @google/generative-ai SDK chính thức
              - Hỗ trợ đầy đủ models mới nhất
            </li>
            <li>
              Lấy API key miễn phí tại{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google AI Studio
              </a>{" "}
              hoặc mua tại{" "}
              <a
                href="https://console.x.ai/"
                target="_blank"
                rel="noopener noreferrer"
              >
                xAI Console
              </a>{" "}
              (Grok)
            </li>
            <li>
              <strong>Bảo mật:</strong> API key được mã hóa AES-256-GCM trước
              khi lưu
            </li>
            <li>Nhấn &quot;Test kết nối&quot; để kiểm tra trước khi lưu</li>
            <li>
              <strong>Prompt:</strong> Để trống ô prompt = dùng mặc định từ
              code. Nhập nội dung = nối thêm vào sau prompt mặc định.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
