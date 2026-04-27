"use client";

import React, { useState, useEffect } from "react";
import AIFieldAssist from "@/components/common/AIFieldAssist";
import { aiService } from "@/services/aiService";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Tag,
  FileText,
  Languages,
  TicketPercent,
  Info,
  Link2,
  Sparkles,
  X,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createTerm,
  CreateTermData,
  getAllTerms,
} from "@/services/termService";
import categoryService, { Category } from "@/services/categoryService";
import RichTextEditor from "@/components/common/RichTextEditor";
import { MultiLangText, Example, LangKey } from "./types";
import "./AddTermForm.scss";

interface AddTermFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LANG_TABS: { key: LangKey; label: string; flag: string }[] = [
  { key: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "lo", label: "ພາສາລາວ", flag: "🇱🇦" },
];

const PART_OF_SPEECH_KEYS = [
  { value: "", labelKey: "selectPartOfSpeech" },
  { value: "noun", labelKey: "noun" },
  { value: "verb", labelKey: "verb" },
  { value: "adjective", labelKey: "adjective" },
  { value: "adverb", labelKey: "adverb" },
  { value: "phrase", labelKey: "phrase" },
  { value: "abbreviation", labelKey: "abbreviation" },
] as const;

// Hàm hỗ trợ lấy tên danh mục dạng chuỗi
const getCategoryName = (
  name: string | { vi: string; en?: string; lo?: string } | undefined,
): string => {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name.vi || name.en || "";
};

export function AddTermForm({ onSuccess, onCancel }: AddTermFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("termForm");
  const termsBasePath = pathname?.includes("/moderator/")
    ? "/moderator/terms"
    : "/admin/terms";

  // Trạng thái biểu mẫu
  const [term, setTerm] = useState<MultiLangText>({ vi: "", en: "", lo: "" });
  const [definition, setDefinition] = useState<MultiLangText>({
    vi: "",
    en: "",
    lo: "",
  });
  const [detailedExplanation, setDetailedExplanation] = useState<MultiLangText>(
    { vi: "", en: "", lo: "" },
  );
  const [examples, setExamples] = useState<Example[]>([
    { vi: "", en: "", lo: "" },
  ]);
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"pending" | "approved">("approved");

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<LangKey>("vi");
  const [submitting, setSubmitting] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Related terms state
  type RelatedTermOption = {
    _id: string;
    term: { vi?: string; en?: string; lo?: string };
  };
  const [relatedTermIds, setRelatedTermIds] = useState<string[]>([]);
  const [relatedTermObjects, setRelatedTermObjects] = useState<
    RelatedTermOption[]
  >([]);
  const [relatedSearchInput, setRelatedSearchInput] = useState("");
  const [relatedSearchResults, setRelatedSearchResults] = useState<
    RelatedTermOption[]
  >([]);
  const [relatedSearchLoading, setRelatedSearchLoading] = useState(false);
  const [showRelatedDropdown, setShowRelatedDropdown] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getCategories();
        setCategories(result.data);
      } catch (error) {
        console.error("Error fetching categories: ", error);
        toast.error("Không thể tải danh mục");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Tìm kiếm thuật ngữ liên quan có debounce
  useEffect(() => {
    if (!relatedSearchInput.trim()) {
      setRelatedSearchResults([]);
      setShowRelatedDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setRelatedSearchLoading(true);
      try {
        const res = await getAllTerms(
          "all",
          "approved",
          1,
          10,
          relatedSearchInput.trim(),
        );
        if (res.success) {
          const filtered = res.data.terms.filter(
            (t) => !relatedTermIds.includes(t._id),
          );
          setRelatedSearchResults(filtered);
          setShowRelatedDropdown(true);
        }
      } catch {
        // bỏ qua
      } finally {
        setRelatedSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [relatedSearchInput, relatedTermIds]);

  // Hàm xử lý cho các trường đa ngôn ngữ
  const handleMultiLangChange = (
    setter: React.Dispatch<React.SetStateAction<MultiLangText>>,
    lang: LangKey,
    value: string,
  ) => {
    setter((prev) => ({ ...prev, [lang]: value }));
  };

  const handleExampleChange = (index: number, lang: LangKey, value: string) => {
    setExamples((prev) => {
      const newExamples = [...prev];
      newExamples[index] = { ...newExamples[index], [lang]: value };
      return newExamples;
    });
  };

  const addExample = () => {
    setExamples((prev) => [...prev, { vi: "", en: "", lo: "" }]);
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      setExamples((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Hàm xử lý thẻ
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAISuggestAll = async () => {
    const termContext = term[activeTab]?.trim() || term.vi?.trim() || "";

    if (!termContext) {
      toast.error(t("aiSuggestAllNoTerm"));
      return;
    }

    setIsAISuggesting(true);
    try {
      const data = await aiService.askAboutTerm({
        term: termContext,
        language: activeTab,
      });

      setDefinition((prev) => ({
        ...prev,
        [activeTab]: data.definition || prev[activeTab] || "",
      }));
      setDetailedExplanation((prev) => ({
        ...prev,
        [activeTab]: data.detailedExplanation || prev[activeTab] || "",
      }));

      if (data.examples?.length) {
        setExamples((prev) =>
          data.examples!.map((exampleText, index) => ({
            ...(prev[index] || { vi: "", en: "", lo: "" }),
            [activeTab]: exampleText,
          })),
        );
      }

      if (data.partOfSpeech) {
        setPartOfSpeech(data.partOfSpeech);
      }

      if (data.tags?.length) {
        setTags(data.tags);
      }

      toast.success(t("aiSuggestAllSuccess"));
    } catch (error: any) {
      toast.error(error?.message || t("errorGeneral"));
    } finally {
      setIsAISuggesting(false);
    }
  };

  // Kiểm tra hợp lệ biểu mẫu
  const validateForm = (): boolean => {
    if (!term.vi?.trim() && !term.en?.trim() && !term.lo?.trim()) {
      toast.error(t("errorAtLeastOneTerm"));
      return false;
    }
    if (
      !definition.vi?.trim() &&
      !definition.en?.trim() &&
      !definition.lo?.trim()
    ) {
      toast.error(t("errorAtLeastOneDef"));
      return false;
    }
    if (!categoryId) {
      toast.error(t("errorCategory"));
      return false;
    }
    return true;
  };

  // Hàm xử lý gửi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    // Build term data
    const termData: CreateTermData = {
      term: {
        vi: term.vi?.trim() || undefined,
        en: term.en?.trim() || undefined,
        lo: term.lo?.trim() || undefined,
      },
      definition: {
        vi: definition.vi?.trim() || undefined,
        en: definition.en?.trim() || undefined,
        lo: definition.lo?.trim() || undefined,
      },
      category: categoryId,
      status,
    };

    // Optional fields
    if (Object.values(detailedExplanation).some((v) => v?.trim())) {
      termData.detailedExplanation = {
        vi: detailedExplanation.vi?.trim() || undefined,
        en: detailedExplanation.en?.trim() || undefined,
        lo: detailedExplanation.lo?.trim() || undefined,
      };
    }

    const filteredExamples = examples.filter((ex) =>
      Object.values(ex).some((v) => v?.trim()),
    );
    if (filteredExamples.length > 0) {
      termData.examples = filteredExamples.map((ex) => ({
        vi: ex.vi?.trim() || undefined,
        en: ex.en?.trim() || undefined,
        lo: ex.lo?.trim() || undefined,
      }));
    }

    if (partOfSpeech) {
      termData.partOfSpeech = partOfSpeech;
    }

    if (tags.length > 0) {
      termData.tags = tags;
    }

    if (relatedTermIds.length > 0) {
      termData.relatedTerms = relatedTermIds;
    }

    try {
      const result = await createTerm(termData);
      if (result.success) {
        toast.success(t("createSuccess"));
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(termsBasePath);
        }
      } else {
        toast.error(result.message || t("errorGeneral"));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể tạo thuật ngữ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="add-term-form">
      {/* Header */}
      <div className="add-term-form__header">
        <button
          type="button"
          className="back-btn"
          onClick={handleCancel}
          disabled={submitting}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="header-info">
          <h1>
            <BookOpen size={24} />
            Thêm thuật ngữ mới
          </h1>
          <p>Điền thông tin để tạo thuật ngữ mới vào từ điển</p>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="add-term-form__tabs">
        {LANG_TABS.map(({ key, label, flag }) => (
          <button
            key={key}
            type="button"
            className={`tab-btn ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="tab-flag">{flag}</span>
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="add-term-form__ai-banner">
        <button
          type="button"
          className="ai-suggest-btn"
          onClick={handleAISuggestAll}
          disabled={submitting || isAISuggesting}
        >
          {isAISuggesting ? (
            <>
              <Loader2 size={18} className="spin" />
              {t("aiSuggestAllLoading")}
            </>
          ) : (
            <>
              <Sparkles size={18} />
              {t("aiSuggestAll")}
            </>
          )}
        </button>
        <p className="ai-suggest-hint">
          {t("aiSuggestAllHint", {
            lang:
              LANG_TABS.find((item) => item.key === activeTab)?.label ||
              activeTab,
          })}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="add-term-form__content">
        <div className="form-grid">
          {/* Left Column - Main Info */}
          <div className="form-column form-column--main">
            {/* Term Name */}
            <div className="form-group">
              <label className="form-label">
                <Languages size={16} />
                Thuật ngữ
              </label>
              <input
                type="text"
                value={term[activeTab] || ""}
                onChange={(e) =>
                  handleMultiLangChange(setTerm, activeTab, e.target.value)
                }
                placeholder={`Nhập thuật ngữ (${LANG_TABS.find((l) => l.key === activeTab)?.label})`}
                className="form-input"
                disabled={submitting}
              />
            </div>

            {/* Definition */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">
                  <FileText size={16} />
                  Định nghĩa
                </label>
                <AIFieldAssist
                  termContext={term[activeTab] || term.vi || ""}
                  fieldType="definition"
                  language={activeTab}
                  onInsert={(content) =>
                    handleMultiLangChange(setDefinition, activeTab, content)
                  }
                  disabled={!term[activeTab]?.trim() && !term.vi?.trim()}
                />
              </div>
              <RichTextEditor
                value={definition[activeTab] || ""}
                onChange={(value) =>
                  handleMultiLangChange(setDefinition, activeTab, value)
                }
                placeholder={`Nhập định nghĩa (${LANG_TABS.find((l) => l.key === activeTab)?.label})`}
                minHeight={100}
              />
            </div>

            {/* Detailed Explanation */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">
                  <BookOpen size={16} />
                  Giải thích chi tiết
                  <span className="optional">(không bắt buộc)</span>
                </label>
                <AIFieldAssist
                  termContext={term[activeTab] || term.vi || ""}
                  fieldType="explanation"
                  language={activeTab}
                  onInsert={(content) =>
                    handleMultiLangChange(
                      setDetailedExplanation,
                      activeTab,
                      content,
                    )
                  }
                  disabled={!term[activeTab]?.trim() && !term.vi?.trim()}
                />
              </div>
              <RichTextEditor
                value={detailedExplanation[activeTab] || ""}
                onChange={(value) =>
                  handleMultiLangChange(
                    setDetailedExplanation,
                    activeTab,
                    value,
                  )
                }
                placeholder="Giải thích thêm về thuật ngữ..."
                minHeight={120}
              />
            </div>

            {/* Examples */}
            <div className="form-group">
              <label className="form-label">
                Ví dụ
                <span className="optional">(không bắt buộc)</span>
              </label>
              <div className="examples-list">
                {examples.map((example, index) => (
                  <div key={index} className="example-item">
                    <span className="example-number">{index + 1}</span>
                    <input
                      type="text"
                      value={example[activeTab] || ""}
                      onChange={(e) =>
                        handleExampleChange(index, activeTab, e.target.value)
                      }
                      placeholder={`Ví dụ ${index + 1} (${LANG_TABS.find((l) => l.key === activeTab)?.label})`}
                      className="form-input"
                      disabled={submitting}
                    />
                    {examples.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeExample(index)}
                        disabled={submitting}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-example-btn"
                onClick={addExample}
                disabled={submitting}
              >
                <Plus size={16} />
                Thêm ví dụ
              </button>
            </div>
          </div>

          {/* Right Column - Meta Info */}
          <div className="form-column form-column--meta">
            {/* Category */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={16} />
                Danh mục <span className="required">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-select"
                disabled={submitting || loadingCategories}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {getCategoryName(cat.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Part of Speech */}
            <div className="form-group">
              <label className="form-label">Từ loại</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="form-select"
                disabled={submitting}
              >
                {PART_OF_SPEECH_KEYS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">{t("status")}</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "pending" | "approved")
                }
                className="form-select"
                disabled={submitting}
              >
                <option value="approved">{t("approved")}</option>
                <option value="pending">{t("pending")}</option>
              </select>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">
                {t("tags")}
                <span className="optional">{t("optional")}</span>
              </label>
              <div className="tags-input-wrapper">
                <div className="tags-list">
                  {tags.map((tag) => (
                    <span key={tag} className="tag-item">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={submitting}
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="tag-input-row">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={t("tagPlaceholder")}
                    className="form-input"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="add-tag-btn"
                    onClick={handleAddTag}
                    disabled={submitting || !tagInput.trim()}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Related Terms */}
            <div className="form-group">
              <label className="form-label">
                <Link2 size={16} />
                {t("relatedTerms")}
                <span className="optional">{t("optional")}</span>
              </label>
              {relatedTermObjects.length > 0 && (
                <div className="tags-list related-terms-list">
                  {relatedTermObjects.map((rt) => (
                    <span key={rt._id} className="tag-item tag-item--related">
                      {rt.term?.vi || rt.term?.en || "Thuật ngữ"}
                      <button
                        type="button"
                        onClick={() => {
                          setRelatedTermIds((prev) =>
                            prev.filter((id) => id !== rt._id),
                          );
                          setRelatedTermObjects((prev) =>
                            prev.filter((obj) => obj._id !== rt._id),
                          );
                        }}
                        disabled={submitting}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="related-search-wrapper">
                <div className="related-search-input">
                  <Search size={15} />
                  <input
                    type="text"
                    value={relatedSearchInput}
                    onChange={(e) => setRelatedSearchInput(e.target.value)}
                    onFocus={() =>
                      relatedSearchResults.length > 0 &&
                      setShowRelatedDropdown(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowRelatedDropdown(false), 150)
                    }
                    placeholder={t("searchRelated")}
                    className="form-input"
                    disabled={submitting}
                  />
                  {relatedSearchLoading && (
                    <Loader2 size={14} className="spin" />
                  )}
                </div>
                {showRelatedDropdown && (
                  <div className="related-dropdown">
                    {relatedSearchResults.length > 0 ? (
                      relatedSearchResults.map((result) => (
                        <button
                          key={result._id}
                          type="button"
                          className="related-dropdown__item"
                          onMouseDown={() => {
                            setRelatedTermIds((prev) => [...prev, result._id]);
                            setRelatedTermObjects((prev) => [...prev, result]);
                            setRelatedSearchInput("");
                            setRelatedSearchResults([]);
                            setShowRelatedDropdown(false);
                          }}
                        >
                          <span className="related-dropdown__vi">
                            {result.term?.vi || "—"}
                          </span>
                          {result.term?.en && (
                            <span className="related-dropdown__en">
                              {result.term.en}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="related-dropdown__empty">
                        Không tìm thấy thuật ngữ
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="info-box">
              <h4>
                <Info size={16} /> Lưu ý
              </h4>
              <ul>
                <li>Các trường có dấu (*) là bắt buộc</li>
                <li>Nên điền đầy đủ cả 3 ngôn ngữ nếu có thể</li>
                <li>Ví dụ giúp người dùng hiểu rõ hơn về thuật ngữ</li>
                <li>Tags giúp tìm kiếm thuật ngữ dễ dàng hơn</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="add-term-form__actions">
          <button
            type="button"
            className="btn btn--cancel"
            onClick={handleCancel}
            disabled={submitting}
          >
            {t("cancel", { ns: "common" })}
          </button>
          <button
            type="submit"
            className="btn btn--submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save size={18} />
                {t("save")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
