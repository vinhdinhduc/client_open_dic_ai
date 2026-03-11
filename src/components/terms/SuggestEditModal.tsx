"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks";
import { suggestEdit } from "@/services/termService";
import { TermDetail, SuggestEditData, MultiLangText, Example } from "./types";
import { X, Edit3, Loader2, Plus, Trash2, Languages } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import StepGuide, { GuideStep } from "@/components/common/StepGuide";
import { toast } from "react-hot-toast";
import "./SuggestEditModal.scss";

interface SuggestEditModalProps {
  term: TermDetail;
  onClose: () => void;
  aiContent?: {
    lang: string;
    definition?: string;
    detailedExplanation?: string;
    examples?: string[];
  };
}

type LangKey = "vi" | "en" | "lo";

export default function SuggestEditModal({
  term,
  onClose,
  aiContent,
}: SuggestEditModalProps) {
  const t = useTranslations("term");
  const tEdit = useTranslations("suggestEdit");
  const tCommon = useTranslations("common");
  const { currentLanguage } = useLanguage();

  const langName = (tab: LangKey) =>
    tab === "vi"
      ? tEdit("langVi")
      : tab === "en"
        ? tEdit("langEn")
        : tEdit("langLo");

  // Form state - pre-fill with existing data, overlay AI suggestions when provided
  const aiLang = aiContent?.lang as LangKey | undefined;

  const [termText, setTermText] = useState<MultiLangText>({
    vi: term.term.vi || "",
    en: term.term.en || "",
    lo: term.term.lo || "",
  });

  const [definition, setDefinition] = useState<MultiLangText>({
    vi:
      aiLang === "vi" && aiContent?.definition
        ? aiContent.definition
        : term.definition.vi || "",
    en:
      aiLang === "en" && aiContent?.definition
        ? aiContent.definition
        : term.definition.en || "",
    lo:
      aiLang === "lo" && aiContent?.definition
        ? aiContent.definition
        : term.definition.lo || "",
  });

  const [detailedExplanation, setDetailedExplanation] = useState<MultiLangText>(
    {
      vi:
        aiLang === "vi" && aiContent?.detailedExplanation
          ? aiContent.detailedExplanation
          : term.detailedExplanation?.vi || "",
      en:
        aiLang === "en" && aiContent?.detailedExplanation
          ? aiContent.detailedExplanation
          : term.detailedExplanation?.en || "",
      lo:
        aiLang === "lo" && aiContent?.detailedExplanation
          ? aiContent.detailedExplanation
          : term.detailedExplanation?.lo || "",
    },
  );

  const buildInitialExamples = (): Example[] => {
    if (aiLang && aiContent?.examples?.length) {
      const aiExamples = aiContent.examples.map(
        (ex) => ({ [aiLang]: ex }) as Example,
      );
      return aiExamples;
    }
    return term.examples?.length ? term.examples : [{ vi: "", en: "", lo: "" }];
  };

  const [examples, setExamples] = useState<Example[]>(buildInitialExamples);

  const [partOfSpeech, setPartOfSpeech] = useState<string>(
    term.partOfSpeech || "",
  );
  const [tags, setTags] = useState<string[]>(term.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [contributorNote, setContributorNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<LangKey>(
    (aiLang as LangKey) || "vi",
  );

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

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      setTags((prev) => [...prev, val]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const PART_OF_SPEECH_OPTIONS = [
    { value: "noun", label: tEdit("partOfSpeech.noun") },
    { value: "verb", label: tEdit("partOfSpeech.verb") },
    { value: "adjective", label: tEdit("partOfSpeech.adjective") },
    { value: "adverb", label: tEdit("partOfSpeech.adverb") },
    { value: "phrase", label: tEdit("partOfSpeech.phrase") },
    { value: "abbreviation", label: tEdit("partOfSpeech.abbreviation") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      partOfSpeech: partOfSpeech || undefined,
      tags: tags.length ? tags : undefined,
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

  const guideSteps: GuideStep[] = [
    {
      title: tEdit("guide.step1Title"),
      description: tEdit("guide.step1Desc"),
    },
    {
      title: tEdit("guide.step2Title"),
      description: tEdit("guide.step2Desc"),
      tip: tEdit("guide.step2Tip"),
    },
    {
      title: tEdit("guide.step3Title"),
      description: tEdit("guide.step3Desc"),
      tip: tEdit("guide.step3Tip"),
    },
    {
      title: tEdit("guide.step4Title"),
      description: tEdit("guide.step4Desc"),
    },
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

        <StepGuide title={tEdit("guide.title")} steps={guideSteps} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="suggest-edit-modal__form">
          {/* Term Name */}
          <div className="form-group">
            <label className="form-label">{tEdit("termLabel")}</label>
            <input
              type="text"
              value={termText[activeTab] || ""}
              onChange={(e) =>
                handleMultiLangChange(setTermText, activeTab, e.target.value)
              }
              placeholder={tEdit("termPlaceholder", {
                lang: langName(activeTab),
              })}
              className="form-input"
            />
          </div>

          {/* Definition */}
          <div className="form-group">
            <label className="form-label">{tEdit("definitionLabel")}</label>
            <RichTextEditor
              key={`definition-${activeTab}`}
              value={definition[activeTab] || ""}
              onChange={(value) =>
                handleMultiLangChange(setDefinition, activeTab, value)
              }
              placeholder={tEdit("definitionPlaceholder", {
                lang: langName(activeTab),
              })}
              minHeight={80}
            />
          </div>

          {/* Detailed Explanation */}
          <div className="form-group">
            <label className="form-label">
              {tEdit("detailedExplanation")}
              <span className="optional">{tEdit("optional")}</span>
            </label>
            <RichTextEditor
              key={`expl-${activeTab}`}
              value={detailedExplanation[activeTab] || ""}
              onChange={(value) =>
                handleMultiLangChange(setDetailedExplanation, activeTab, value)
              }
              placeholder={tEdit("detailedExplanationPlaceholder", {
                lang: langName(activeTab),
              })}
              minHeight={100}
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
                    placeholder={tEdit("examplePlaceholder", {
                      index: index + 1,
                    })}
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

          {/* Part of Speech */}
          <div className="form-group">
            <label className="form-label">
              {tEdit("partOfSpeechLabel")}
              <span className="optional">{tEdit("optional")}</span>
            </label>
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              className="form-select"
            >
              <option value="">{tEdit("partOfSpeechPlaceholder")}</option>
              {PART_OF_SPEECH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              {tEdit("tagLabel")}
              <span className="optional">{tEdit("optional")}</span>
            </label>
            <div className="tag-input-wrapper">
              <div className="tag-chips">
                {tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      className="tag-chip__remove"
                      onClick={() => removeTag(tag)}
                    >
                      <X size={12} />
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
                  placeholder={tEdit("tagPlaceholder")}
                  className="form-input"
                />
                <button
                  type="button"
                  className="add-example-btn"
                  onClick={addTag}
                >
                  <Plus size={16} />
                  {tEdit("addTag")}
                </button>
              </div>
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
