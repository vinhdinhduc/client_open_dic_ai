"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks";
import { suggestEdit } from "@/services/termService";
import { TermDetail, SuggestEditData, MultiLangText, Example } from "./types";
import { X, Edit3, Loader2, Plus, Trash2, Languages } from "lucide-react";
import { toast } from "react-hot-toast";
import "./SuggestEditModal.scss";

interface SuggestEditModalProps {
  term: TermDetail;
  onClose: () => void;
}

type LangKey = "vi" | "en" | "lo";

export default function SuggestEditModal({
  term,
  onClose,
}: SuggestEditModalProps) {
  const t = useTranslations("term");
  const tEdit = useTranslations("suggestEdit");
  const tCommon = useTranslations("common");
  const { currentLanguage } = useLanguage();

  // Form state - pre-fill with existing data
  const [termText, setTermText] = useState<MultiLangText>({
    vi: term.term.vi || "",
    en: term.term.en || "",
    lo: term.term.lo || "",
  });

  const [definition, setDefinition] = useState<MultiLangText>({
    vi: term.definition.vi || "",
    en: term.definition.en || "",
    lo: term.definition.lo || "",
  });

  const [detailedExplanation, setDetailedExplanation] = useState<MultiLangText>(
    {
      vi: term.detailedExplanation?.vi || "",
      en: term.detailedExplanation?.en || "",
      lo: term.detailedExplanation?.lo || "",
    },
  );

  const [examples, setExamples] = useState<Example[]>(
    term.examples?.length ? term.examples : [{ vi: "", en: "", lo: "" }],
  );

  const [contributorNote, setContributorNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<LangKey>("vi");

  // Helpers
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!termText.vi?.trim()) {
      toast.error(tEdit("termViRequired"));
      return;
    }

    if (!definition.vi?.trim()) {
      toast.error(tEdit("definitionViRequired"));
      return;
    }

    if (!contributorNote.trim()) {
      toast.error(tEdit("noteRequired"));
      return;
    }

    const data: SuggestEditData = {
      type: "edit_term",
      targetTerm: term._id,
      term: termText,
      definition,
      detailedExplanation: Object.values(detailedExplanation).some((v) => v)
        ? detailedExplanation
        : undefined,
      examples: examples.filter((ex) => Object.values(ex).some((v) => v)),
      category: term.category?._id || "",
      contributorNote: contributorNote.trim(),
    };

    setSubmitting(true);
    try {
      await suggestEdit(data);
      toast.success(tEdit("success"));
      onClose();
    } catch (error) {
      toast.error(tEdit("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const LANG_TABS: { key: LangKey; label: string; flag: string }[] = [
    { key: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { key: "en", label: "English", flag: "🇬🇧" },
    { key: "lo", label: "ພາສາລາວ", flag: "🇱🇦" },
  ];

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="suggest-edit-modal">
        {/* Header */}
        <div className="suggest-edit-modal__header">
          <div className="header-title">
            <Edit3 size={20} />
            <h2>{tEdit("title")}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="suggest-edit-modal__tabs">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="suggest-edit-modal__form">
          {/* Term Name */}
          <div className="form-group">
            <label className="form-label">
              {tEdit("termLabel")}{" "}
              {activeTab === "vi" && <span className="required">*</span>}
            </label>
            <input
              type="text"
              value={termText[activeTab] || ""}
              onChange={(e) =>
                handleMultiLangChange(setTermText, activeTab, e.target.value)
              }
              placeholder={`Nhập thuật ngữ (${LANG_TABS.find((l) => l.key === activeTab)?.label})`}
              className="form-input"
            />
          </div>

          {/* Definition */}
          <div className="form-group">
            <label className="form-label">
              {tEdit("definitionLabel")}{" "}
              {activeTab === "vi" && <span className="required">*</span>}
            </label>
            <textarea
              value={definition[activeTab] || ""}
              onChange={(e) =>
                handleMultiLangChange(setDefinition, activeTab, e.target.value)
              }
              placeholder={`Nhập định nghĩa (${LANG_TABS.find((l) => l.key === activeTab)?.label})`}
              rows={3}
              className="form-textarea"
            />
          </div>

          {/* Detailed Explanation */}
          <div className="form-group">
            <label className="form-label">
              {tEdit("detailedExplanation")}
              <span className="optional">{tEdit("optional")}</span>
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
              rows={4}
              className="form-textarea"
            />
          </div>

          {/* Examples */}
          <div className="form-group">
            <label className="form-label">
              {tEdit("exampleLabel")}
              <span className="optional">{tEdit("optional")}</span>
            </label>
            <div className="examples-list">
              {examples.map((example, index) => (
                <div key={index} className="example-item">
                  <input
                    type="text"
                    value={example[activeTab] || ""}
                    onChange={(e) =>
                      handleExampleChange(index, activeTab, e.target.value)
                    }
                    placeholder={`Ví dụ ${index + 1}`}
                    className="form-input"
                  />
                  {examples.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeExample(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-example-btn"
                onClick={addExample}
              >
                <Plus size={16} />
                {tEdit("addExample")}
              </button>
            </div>
          </div>

          {/* Contributor Note */}
          <div className="form-group form-group--note">
            <label className="form-label">
              {tEdit("noteLabel")} <span className="required">*</span>
            </label>
            <textarea
              value={contributorNote}
              onChange={(e) => setContributorNote(e.target.value)}
              placeholder={tEdit("notePlaceholder")}
              rows={3}
              className="form-textarea"
              maxLength={500}
            />
            <span className="char-count">{contributorNote.length}/500</span>
          </div>

          {/* Actions */}
          <div className="suggest-edit-modal__actions">
            <button
              type="button"
              className="btn btn--cancel"
              onClick={onClose}
              disabled={submitting}
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              className="btn btn--submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  {tEdit("submitting")}
                </>
              ) : (
                <>
                  <Edit3 size={16} />
                  {tEdit("submit")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
