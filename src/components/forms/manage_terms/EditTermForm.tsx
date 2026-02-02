"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getTermById,
  updateTerm,
  CreateTermData,
} from "@/services/termService";
import categoryService, { Category } from "@/services/categoryService";
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

const PART_OF_SPEECH_OPTIONS = [
  { value: "", label: "Chọn từ loại" },
  { value: "noun", label: "Danh từ (Noun)" },
  { value: "verb", label: "Động từ (Verb)" },
  { value: "adjective", label: "Tính từ (Adjective)" },
  { value: "adverb", label: "Trạng từ (Adverb)" },
  { value: "phrase", label: "Cụm từ (Phrase)" },
  { value: "abbreviation", label: "Từ viết tắt (Abbreviation)" },
];

const STATUS_OPTIONS = [
  { value: "approved", label: "Đã duyệt", color: "success" },
  { value: "pending", label: "Chờ duyệt", color: "warning" },
  { value: "rejected", label: "Từ chối", color: "danger" },
];

export function EditTermForm({
  termId,
  onSuccess,
  onCancel,
}: EditTermFormProps) {
  const router = useRouter();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
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

  // Original data for comparison
  const [originalData, setOriginalData] = useState<CreateTermData | null>(null);

  // Fetch term data and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories and term data in parallel
        const [categoriesResult, termData] = await Promise.all([
          categoryService.getCategories(),
          getTermById(termId),
        ]);

        setCategories(categoriesResult);
        setLoadingCategories(false);

        if (termData) {
          // Populate form with term data
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

          // Store original data for comparison
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
          router.push("/admin/terms");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [termId, router]);

  // Handlers for multi-lang fields
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

  // Tags handlers
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

  // Reset form to original data
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
      toast.success("Đã khôi phục dữ liệu gốc");
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!term.vi?.trim()) {
      toast.error("Thuật ngữ tiếng Việt là bắt buộc");
      setActiveTab("vi");
      return false;
    }
    if (!definition.vi?.trim()) {
      toast.error("Định nghĩa tiếng Việt là bắt buộc");
      setActiveTab("vi");
      return false;
    }
    if (!categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return false;
    }
    return true;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    // Build term data
    const termData: Partial<CreateTermData> = {
      term: {
        vi: term.vi!.trim(),
        en: term.en?.trim() || undefined,
        lo: term.lo?.trim() || undefined,
      },
      definition: {
        vi: definition.vi!.trim(),
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

    try {
      const result = await updateTerm(termId, termData);
      if (result.success) {
        toast.success("Cập nhật thuật ngữ thành công!");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/terms");
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
          <span>Quay lại</span>
        </button>
        <div className="header-info">
          <h1>
            <BookOpen size={24} />
            Chỉnh sửa thuật ngữ
          </h1>
          <p>Cập nhật thông tin thuật ngữ trong từ điển</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="edit-term-form__content">
        <div className="form-grid">
          {/* Left Column - Main Info */}
          <div className="form-column form-column--main">
            {/* Term Name */}
            <div className="form-group">
              <label className="form-label">
                <Languages size={16} />
                Thuật ngữ
                {activeTab === "vi" && <span className="required">*</span>}
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
              <label className="form-label">
                <FileText size={16} />
                Định nghĩa
                {activeTab === "vi" && <span className="required">*</span>}
              </label>
              <textarea
                value={definition[activeTab] || ""}
                onChange={(e) =>
                  handleMultiLangChange(
                    setDefinition,
                    activeTab,
                    e.target.value,
                  )
                }
                placeholder={`Nhập định nghĩa (${LANG_TABS.find((l) => l.key === activeTab)?.label})`}
                rows={4}
                className="form-textarea"
                disabled={submitting}
              />
            </div>

            {/* Detailed Explanation */}
            <div className="form-group">
              <label className="form-label">
                <BookOpen size={16} />
                Giải thích chi tiết
                <span className="optional">(không bắt buộc)</span>
              </label>
              <textarea
                value={detailedExplanation[activeTab] || ""}
                onChange={(e) =>
                  handleMultiLangChange(
                    setDetailedExplanation,
                    activeTab,
                    e.target.value,
                  )
                }
                placeholder="Giải thích thêm về thuật ngữ..."
                rows={5}
                className="form-textarea"
                disabled={submitting}
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
                    {cat.name}
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
                {PART_OF_SPEECH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
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
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">
                Thẻ (Tags)
                <span className="optional">(không bắt buộc)</span>
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
                    placeholder="Nhập tag và nhấn Enter"
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
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn--submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={18} />
                Cập nhật thuật ngữ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTermForm;
