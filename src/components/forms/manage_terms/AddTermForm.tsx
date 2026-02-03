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
  TicketPercent,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { createTerm, CreateTermData } from "@/services/termService";
import categoryService, { Category } from "@/services/categoryService";
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

const PART_OF_SPEECH_OPTIONS = [
  { value: "", label: "Chọn từ loại" },
  { value: "noun", label: "Danh từ (Noun)" },
  { value: "verb", label: "Động từ (Verb)" },
  { value: "adjective", label: "Tính từ (Adjective)" },
  { value: "adverb", label: "Trạng từ (Adverb)" },
  { value: "phrase", label: "Cụm từ (Phrase)" },
  { value: "abbreviation", label: "Từ viết tắt (Abbreviation)" },
];

// Helper function to get category name as string
const getCategoryName = (
  name: string | { vi: string; en?: string; lo?: string } | undefined,
): string => {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name.vi || name.en || "";
};

export function AddTermForm({ onSuccess, onCancel }: AddTermFormProps) {
  const router = useRouter();

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
  const [status, setStatus] = useState<"pending" | "approved">("approved");

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<LangKey>("vi");
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    const termData: CreateTermData = {
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
      const result = await createTerm(termData);
      if (result.success) {
        toast.success("Tạo thuật ngữ thành công!");
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
            {key === "vi" && <span className="required-indicator">*</span>}
          </button>
        ))}
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
                  setStatus(e.target.value as "pending" | "approved")
                }
                className="form-select"
                disabled={submitting}
              >
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
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
                Lưu thuật ngữ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
