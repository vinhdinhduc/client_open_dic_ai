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
  Info,
  RefreshCw,
  Link2,
  Sparkles,
  X,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getTermById,
  updateTerm,
  CreateTermData,
  getAllTerms,
} from "@/services/termService";
import categoryService, { Category } from "@/services/categoryService";
import RichTextEditor from "@/components/common/RichTextEditor";
import { MultiLangText, Example, LangKey } from "./types";
import "./EditTermForm.scss";

interface EditTermFormProps {
  termId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LANG_TABS: { key: LangKey; label: string; flag: string }[] = [
  { key: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "lo", label: "ພາສາລາວ", flag: "🇱🇦" },
];

const getCategoryName = (name: string | MultiLangText | undefined): string => {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name.vi || name.en || name.lo || "";
};

const PART_OF_SPEECH_KEYS = [
  { value: "", labelKey: "selectPartOfSpeech" },
  { value: "noun", labelKey: "noun" },
  { value: "verb", labelKey: "verb" },
  { value: "adjective", labelKey: "adjective" },
  { value: "adverb", labelKey: "adverb" },
  { value: "phrase", labelKey: "phrase" },
  { value: "abbreviation", labelKey: "abbreviation" },
] as const;

const STATUS_KEYS = [
  { value: "approved", labelKey: "approved", color: "success" },
  { value: "pending", labelKey: "pending", color: "warning" },
  { value: "rejected", labelKey: "rejected", color: "danger" },
] as const;

export function EditTermForm({
  termId,
  onSuccess,
  onCancel,
}: EditTermFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("termForm");
  const termsBasePath = pathname?.includes("/moderator/")
    ? "/moderator/terms"
    : "/admin/terms";

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "approved",
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<LangKey>("vi");

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
  const [initialRelatedTermIds, setInitialRelatedTermIds] = useState<string[]>(
    [],
  );
  const [initialRelatedTermObjects, setInitialRelatedTermObjects] = useState<
    RelatedTermOption[]
  >([]);

  // Dữ liệu gốc để so sánh
  const [originalData, setOriginalData] = useState<CreateTermData | null>(null);

  // Lấy dữ liệu thuật ngữ và danh mục
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh mục và dữ liệu thuật ngữ song song
        const [categoriesResult, termData] = await Promise.all([
          categoryService.getCategories(),
          getTermById(termId),
        ]);

        setCategories(categoriesResult.data);
        setLoadingCategories(false);

        if (termData) {
          // Điền dữ liệu thuật ngữ vào form
          setTerm({
            vi: termData.term?.vi || "",
            en: termData.term?.en || "",
            lo: termData.term?.lo || "",
          });
          setDefinition({
            vi: termData.definition?.vi || "",
            en: termData.definition?.en || "",
            lo: termData.definition?.lo || "",
          });
          setDetailedExplanation({
            vi: termData.detailedExplanation?.vi || "",
            en: termData.detailedExplanation?.en || "",
            lo: termData.detailedExplanation?.lo || "",
          });

          if (termData.examples && termData.examples.length > 0) {
            setExamples(
              termData.examples.map((ex) => ({
                vi: ex.vi || "",
                en: ex.en || "",
                lo: ex.lo || "",
              })),
            );
          }

          setPartOfSpeech(termData.partOfSpeech || "");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const categoryData = termData.category as any;
          setCategoryId(categoryData?._id || categoryData?.id || "");
          setTags(termData.tags || []);
          setStatus(termData.status || "approved");

          // Tải các thuật ngữ liên quan
          if (termData.relatedTerms && termData.relatedTerms.length > 0) {
            const ids = termData.relatedTerms.map((rt) => rt._id);
            setRelatedTermIds(ids);
            setRelatedTermObjects(termData.relatedTerms);
            setInitialRelatedTermIds(ids);
            setInitialRelatedTermObjects(termData.relatedTerms);
          }

          // Lưu dữ liệu gốc để so sánh
          setOriginalData({
            term: {
              vi: termData.term?.vi || "",
              en: termData.term?.en,
              lo: termData.term?.lo,
            },
            definition: {
              vi: termData.definition?.vi || "",
              en: termData.definition?.en,
              lo: termData.definition?.lo,
            },
            detailedExplanation: termData.detailedExplanation,
            examples: termData.examples,
            partOfSpeech: termData.partOfSpeech,
            category: categoryData?._id || categoryData?.id || "",
            tags: termData.tags,
            status: termData.status,
          });
        } else {
          toast.error("Không tìm thấy thuật ngữ");
          router.push(termsBasePath);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [termId, router, termsBasePath]);

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
            (t) => t._id !== termId && !relatedTermIds.includes(t._id),
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
  }, [relatedSearchInput, relatedTermIds, termId]);

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

  // Đặt lại biểu mẫu to original data
  const handleReset = () => {
    if (originalData) {
      setTerm({
        vi: originalData.term?.vi || "",
        en: originalData.term?.en || "",
        lo: originalData.term?.lo || "",
      });
      setDefinition({
        vi: originalData.definition?.vi || "",
        en: originalData.definition?.en || "",
        lo: originalData.definition?.lo || "",
      });
      setDetailedExplanation({
        vi: originalData.detailedExplanation?.vi || "",
        en: originalData.detailedExplanation?.en || "",
        lo: originalData.detailedExplanation?.lo || "",
      });
      if (originalData.examples && originalData.examples.length > 0) {
        setExamples(
          originalData.examples.map((ex) => ({
            vi: ex.vi || "",
            en: ex.en || "",
            lo: ex.lo || "",
          })),
        );
      } else {
        setExamples([{ vi: "", en: "", lo: "" }]);
      }
      setPartOfSpeech(originalData.partOfSpeech || "");
      setCategoryId(originalData.category || "");
      setTags(originalData.tags || []);
      setStatus(originalData.status || "approved");
      setRelatedTermIds(initialRelatedTermIds);
      setRelatedTermObjects(initialRelatedTermObjects);
      toast.success("Đã khôi phục dữ liệu gốc");
    }
  };

  // Kiểm tra hợp lệ biểu mẫu
  const validateForm = (): boolean => {
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
    const termData: Partial<CreateTermData> = {
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

    termData.relatedTerms = relatedTermIds;

    try {
      const result = await updateTerm(termId, termData);
      if (result.success) {
        toast.success(t("updateSuccess"));
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(termsBasePath);
        }
      } else {
        toast.error(result.message || "Có lỗi xảy ra");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Không thể cập nhật thuật ngữ",
      );
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

  // Loading state
  if (loading) {
    return (
      <div className="edit-term-form edit-term-form--loading">
        <div className="loading-spinner">
          <Loader2 size={48} className="spin" />
          <p>Đang tải dữ liệu thuật ngữ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-term-form">
      {/* Header */}
      <div className="edit-term-form__header">
        <button
          type="button"
          className="back-btn"
          onClick={handleCancel}
          disabled={submitting}
        >
          <ArrowLeft size={20} />
          <span>{t("back")}</span>
        </button>
        <div className="header-info">
          <h1>
            <BookOpen size={24} />
            {t("editTitle")}
          </h1>
          <p>{t("editSubtitle")}</p>
        </div>
        <button
          type="button"
          className="reset-btn"
          onClick={handleReset}
          disabled={submitting}
          title="Khôi phục dữ liệu gốc"
        >
          <RefreshCw size={18} />
          <span>Khôi phục</span>
        </button>
      </div>

      {/* Language Tabs */}
      <div className="edit-term-form__tabs">
        {LANG_TABS.map(({ key, label, flag }) => (
          <button
            key={key}
            type="button"
            className={`tab-btn ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="tab-flag">{flag}</span>
            <span className="tab-label">{label}</span>
            {key === "vi" && <span className="required-indicator">*</span>}
          </button>
        ))}
      </div>

      <div className="edit-term-form__ai-banner">
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
      <form onSubmit={handleSubmit} className="edit-term-form__content">
        <div className="form-grid">
          {/* Left Column - Main Info */}
          <div className="form-column form-column--main">
            {/* Term Name */}
            <div className="form-group">
              <label className="form-label">
                <Languages size={16} />
                {t("term")}
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
                  {t("definition")}
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
                  {t("detailedExplanation")}
                  <span className="optional">{t("optional")}</span>
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
                {t("examples")}
                <span className="optional">{t("optional")}</span>
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
                {t("category")}{" "}
                <span className="required">{t("required")}</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-select"
                disabled={submitting || loadingCategories}
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {getCategoryName(cat.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Part of Speech */}
            <div className="form-group">
              <label className="form-label">{t("partOfSpeech")}</label>
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
                  setStatus(
                    e.target.value as "pending" | "approved" | "rejected",
                  )
                }
                className={`form-select status-select status-select--${status}`}
                disabled={submitting}
              >
                {STATUS_KEYS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
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
                <Info size={16} /> Lưu ý khi sửa
              </h4>
              <ul>
                <li>Các trường có dấu (*) là bắt buộc</li>
                <li>Thay đổi sẽ được lưu ngay sau khi nhấn Lưu</li>
                <li>Nhấn "Khôi phục" để quay về dữ liệu ban đầu</li>
                <li>Kiểm tra kỹ nội dung trước khi lưu</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="edit-term-form__actions">
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

export default EditTermForm;
