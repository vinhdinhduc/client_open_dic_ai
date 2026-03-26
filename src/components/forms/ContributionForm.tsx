"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { contributionService } from "@/services/contributionService";
import categoryService from "@/services/categoryService";
import {
  loadContributionData,
  loadMultiLangContributionData,
  clearContributionData,
} from "@/utils/contributionStorage";
import { toast } from "react-hot-toast";
import { PlusCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import AIFieldAssist from "@/components/common/AIFieldAssist";
import StepGuide, { GuideStep } from "@/components/common/StepGuide";
import { aiService } from "@/services/aiService";
import "./ContributionForm.scss";
import type { MultiLangText, Example, PartOfSpeech } from "@/types/term.types";
import type { CategoryRef } from "@/types/category.types";
import type { NewTermContributionData } from "@/types/contribution.types";

const cleanNbsp = (s?: string) =>
  s?.replace(/&nbsp;/gi, " ").replace(/\u00A0/g, " ");

interface ContributionFormData extends Omit<
  NewTermContributionData,
  "examples"
> {
  examples?: Example[];
  partOfSpeech?: PartOfSpeech;
  relatedTerms?: string[];
  tags?: string[];
}

type LanguageTab = "vi" | "en" | "lo";

interface SimilarTermSuggestion {
  _id: string;
  term?: MultiLangText;
  category?: {
    _id?: string;
    name?: MultiLangText;
    slug?: string;
  };
  url: string;
  isSameCategory?: boolean;
  isExactMatch?: boolean;
}

export default function ContributionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const t = useTranslations("contribution");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const langName = (tab: LanguageTab) =>
    tab === "vi" ? t("langVi") : tab === "en" ? t("langEn") : t("langLo");

  const [isLoading, setIsLoading] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageTab>("vi");
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [similarTerms, setSimilarTerms] = useState<SimilarTermSuggestion[]>([]);
  const [formData, setFormData] = useState<ContributionFormData>({
    type: "new_term",
    term: { vi: "" },
    definition: { vi: "" },
    detailedExplanation: { vi: "" },
    examples: [{ vi: "" }],
    relatedTerms: [],
    tags: [],
    category: "",
    contributorNote: "",
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success && response.data) {
          setCategories((response.data as CategoryRef[]) || []);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const fromAI = searchParams.get("from");
    const storageKey = searchParams.get("key");
    const mlKey = searchParams.get("mlkey");
    const aiData = searchParams.get("aiData");
    const termFromQuery = searchParams.get("term");

    if (fromAI === "ai" && mlKey) {
      // Multi-language AI data
      const mlData = loadMultiLangContributionData(decodeURIComponent(mlKey));

      if (mlData) {
        const newTerm: MultiLangText = {};
        const newDef: MultiLangText = {};
        const newExpl: MultiLangText = {};
        const langExamples: Record<string, string[]> = {};

        for (const [lang, entry] of Object.entries(mlData.langs)) {
          if (entry.term) newTerm[lang as keyof MultiLangText] = entry.term;
          if (entry.definition)
            newDef[lang as keyof MultiLangText] = entry.definition;
          if (entry.detailedExplanation)
            newExpl[lang as keyof MultiLangText] = entry.detailedExplanation;
          if (entry.examples?.length) langExamples[lang] = entry.examples;
        }

        // Merge examples across languages
        const maxExamples = Math.max(
          ...Object.values(langExamples).map((e) => e.length),
          0,
        );
        const mergedExamples: Example[] =
          maxExamples > 0
            ? Array.from({ length: maxExamples }, (_, i) => {
                const ex: Example = {};
                for (const [lang, exArr] of Object.entries(langExamples)) {
                  if (exArr[i]) (ex as any)[lang] = exArr[i];
                }
                return ex;
              })
            : [{ vi: "" }];

        setFormData((prev) => ({
          ...prev,
          term: { ...prev.term, ...newTerm },
          definition: { ...prev.definition, ...newDef },
          detailedExplanation: { ...prev.detailedExplanation, ...newExpl },
          examples: mergedExamples,
          partOfSpeech: (mlData.partOfSpeech as PartOfSpeech) || undefined,
          relatedTerms: mlData.relatedTerms || [],
          tags: mlData.tags || [],
        }));

        clearContributionData(decodeURIComponent(mlKey));

        // Set active tab to first available language
        const availableLangs = Object.keys(mlData.langs) as LanguageTab[];
        if (availableLangs.length > 0) {
          setCurrentLang(availableLangs[0]);
        }

        toast.success(t("aiDataLoaded"));
      }
    } else if (fromAI === "ai" && storageKey) {
      const data = loadContributionData(decodeURIComponent(storageKey));

      if (data) {
        const lang = (
          data.language && ["vi", "en", "lo"].includes(data.language)
            ? data.language
            : "vi"
        ) as LanguageTab;

        setFormData((prev) => ({
          ...prev,
          term: {
            ...prev.term,
            [lang]: data.term || "",
          },
          definition: {
            ...prev.definition,
            [lang]: data.definition || "",
          },
          detailedExplanation: {
            ...prev.detailedExplanation,
            [lang]: data.detailedExplanation || "",
          },
          examples: data.examples?.length
            ? data.examples.map((ex: string) => ({ [lang]: ex }) as Example)
            : [{ vi: "" }],
          partOfSpeech: (data.partOfSpeech as PartOfSpeech) || undefined,
          relatedTerms: data.relatedTerms || [],
          tags: data.tags || [],
        }));

        clearContributionData(decodeURIComponent(storageKey));
        if (
          data.language &&
          data.language !== "vi" &&
          ["en", "lo"].includes(data.language)
        ) {
          setCurrentLang(data.language as LanguageTab);
        }
        toast.success(t("aiDataLoaded"));
      }
    } else if (aiData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(aiData));
        const lang = (
          parsed.language && ["vi", "en", "lo"].includes(parsed.language)
            ? parsed.language
            : "vi"
        ) as LanguageTab;

        setFormData((prev) => ({
          ...prev,
          term: {
            ...prev.term,
            [lang]: parsed.term || termFromQuery || "",
          },
          definition: {
            ...prev.definition,
            [lang]: parsed.definition || "",
          },
          detailedExplanation: {
            ...prev.detailedExplanation,
            [lang]: parsed.detailedExplanation || "",
          },
          examples: parsed.examples
            ? parsed.examples.map((ex: string) => ({ [lang]: ex }) as Example)
            : [{ vi: "" }],
          partOfSpeech: (parsed.partOfSpeech as PartOfSpeech) || undefined,
          relatedTerms: parsed.relatedTerms || [],
          tags: parsed.tags || [],
        }));
        if (lang !== "vi") setCurrentLang(lang);
      } catch (error) {
        console.error("Failed to parse AI data from URL:", error);
      }
    } else if (termFromQuery) {
      setFormData((prev) => ({
        ...prev,
        term: { vi: termFromQuery },
      }));
    }
  }, [searchParams, t]);

  const handleInputChange = (
    field: keyof ContributionFormData,
    value: any,
    lang?: keyof MultiLangText,
  ) => {
    if (field === "term" || field === "category") {
      setSimilarTerms([]);
    }

    if (lang) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...(prev[field] as any),
          [lang]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAISuggestAll = async () => {
    const termText =
      formData.term[currentLang]?.trim() ||
      formData.term.vi?.trim() ||
      formData.term.en?.trim() ||
      formData.term.lo?.trim();
    if (!termText) {
      toast.error(t("aiSuggestAllNoTerm"));
      return;
    }
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      return;
    }
    setIsAISuggesting(true);
    try {
      const data = await aiService.askAboutTerm({
        term: termText,
        language: currentLang,
      });
      if (data.structured) {
        setFormData((prev) => ({
          ...prev,
          definition: {
            ...prev.definition,
            [currentLang]:
              data.definition || prev.definition[currentLang] || "",
          },
          detailedExplanation: {
            ...prev.detailedExplanation,
            [currentLang]:
              data.detailedExplanation ||
              prev.detailedExplanation?.[currentLang] ||
              "",
          },
          examples:
            data.examples && data.examples.length > 0
              ? data.examples.map((ex, i) => ({
                  ...(prev.examples?.[i] || {}),
                  [currentLang]: ex,
                }))
              : prev.examples,
          partOfSpeech:
            (data.partOfSpeech as PartOfSpeech) || prev.partOfSpeech,
          relatedTerms:
            data.relatedTerms && data.relatedTerms.length > 0
              ? data.relatedTerms
              : prev.relatedTerms,
          tags: data.tags && data.tags.length > 0 ? data.tags : prev.tags,
        }));
        toast.success(t("aiSuggestAllSuccess"));
      } else {
        toast.error(t("aiDataError"));
      }
    } catch (err: any) {
      toast.error(err.message || t("aiDataError"));
    } finally {
      setIsAISuggesting(false);
    }
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...(prev.examples || []), { vi: "" }],
    }));
  };

  const removeExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples?.filter((_, i) => i !== index),
    }));
  };

  const updateExample = (
    index: number,
    value: string,
    lang: LanguageTab = "vi",
  ) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples?.map((ex, i) =>
        i === index ? { ...ex, [lang]: value } : ex,
      ),
    }));
  };

  const addRelatedTerm = () => {
    setFormData((prev) => ({
      ...prev,
      relatedTerms: [...(prev.relatedTerms || []), ""],
    }));
  };

  const removeRelatedTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      relatedTerms: prev.relatedTerms?.filter((_, i) => i !== index),
    }));
  };

  const updateRelatedTerm = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedTerms: prev.relatedTerms?.map((term, i) =>
        i === index ? value : term,
      ),
    }));
  };

  const addTag = () => {
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), ""],
    }));
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      router.push(`/login?returnUrl=${window.location.pathname}`);
      return;
    }

    const termLangCount = [
      formData.term.vi?.trim(),
      formData.term.en?.trim(),
      formData.term.lo?.trim(),
    ].filter(Boolean).length;
    if (termLangCount < 2) {
      toast.error(t("termRequired"));
      return;
    }

    const defFilled =
      formData.definition.vi?.trim() ||
      formData.definition.en?.trim() ||
      formData.definition.lo?.trim();
    if (!defFilled) {
      toast.error(t("definitionRequired"));
      return;
    }

    if (!formData.category) {
      toast.error(t("categoryRequired"));
      return;
    }

    setIsLoading(true);
    setSimilarTerms([]);

    try {
      // Clean up data
      const submissionData = {
        type: "new_term" as const,
        term: {
          vi: cleanNbsp(formData.term.vi)?.trim() || undefined,
          lo: cleanNbsp(formData.term.lo)?.trim() || undefined,
          en: cleanNbsp(formData.term.en)?.trim() || undefined,
        },
        definition: {
          vi: cleanNbsp(formData.definition.vi)?.trim() || undefined,
          lo: cleanNbsp(formData.definition.lo)?.trim() || undefined,
          en: cleanNbsp(formData.definition.en)?.trim() || undefined,
        },
        detailedExplanation:
          formData.detailedExplanation?.vi?.trim() ||
          formData.detailedExplanation?.en?.trim() ||
          formData.detailedExplanation?.lo?.trim()
            ? {
                vi:
                  cleanNbsp(formData.detailedExplanation?.vi)?.trim() ||
                  undefined,
                lo:
                  cleanNbsp(formData.detailedExplanation?.lo)?.trim() ||
                  undefined,
                en:
                  cleanNbsp(formData.detailedExplanation?.en)?.trim() ||
                  undefined,
              }
            : undefined,
        examples: formData.examples
          ?.filter((ex) => ex.vi?.trim() || ex.lo?.trim() || ex.en?.trim())
          .map((ex) => ({
            vi: cleanNbsp(ex.vi)?.trim() || undefined,
            lo: cleanNbsp(ex.lo)?.trim() || undefined,
            en: cleanNbsp(ex.en)?.trim() || undefined,
          })),

        category: formData.category,
        partOfSpeech: formData.partOfSpeech || undefined,
        tags: formData.tags?.filter((tag) => tag.trim()) || undefined,
        contributorNote: formData.contributorNote?.trim() || undefined,
      };

      const result =
        await contributionService.createContribution(submissionData);
      if (result.success) {
        toast.success(t("success"));
        router.push("/profile/contributions");
      } else {
        toast.error(tCommon("error"));
      }
    } catch (error: any) {
      console.error("Contribution error:", error);
      const apiError = error?.response?.data;
      const apiSuggestions = apiError?.errors?.similarTerms;

      if (Array.isArray(apiSuggestions)) {
        setSimilarTerms(apiSuggestions);
      }

      toast.error(apiError?.message || error.message || t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const guideSteps: GuideStep[] = [
    {
      title: t("guide.step1Title"),
      description: t("guide.step1Desc"),
      tip: t("guide.step1Tip"),
    },
    {
      title: t("guide.step2Title"),
      description: t("guide.step2Desc"),
      tip: t("guide.step2Tip"),
    },
    {
      title: t("guide.step3Title"),
      description: t("guide.step3Desc"),
      tip: t("guide.step3Tip"),
    },
    {
      title: t("guide.step4Title"),
      description: t("guide.step4Desc"),
      tip: t("guide.step4Tip"),
    },
  ];

  return (
    <div className="contribution-form">
      <div className="contribution-form__header">
        <h1>{t("title")}</h1>
        <p className="contribution-form__subtitle">{t("newTerm")}</p>
      </div>

      <StepGuide title={t("guide.title")} steps={guideSteps} />

      <form onSubmit={handleSubmit} className="contribution-form__form">
        <div className="contribution-form__ai-banner">
          <button
            type="button"
            className="btn btn--ai-suggest"
            onClick={handleAISuggestAll}
            disabled={
              isAISuggesting ||
              !(
                formData.term[currentLang]?.trim() ||
                formData.term.vi?.trim() ||
                formData.term.en?.trim() ||
                formData.term.lo?.trim()
              )
            }
          >
            {isAISuggesting ? (
              <>
                <Loader2 size={18} className="spinner" />
                {t("aiSuggestAllLoading")}
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {t("aiSuggestAll")}
              </>
            )}
          </button>
          <p className="contribution-form__ai-hint">
            {currentLang === "vi"
              ? "🇻🇳 Tiếng Việt"
              : currentLang === "en"
                ? "🇬🇧 English"
                : "🇱🇦 ພາສາລາວ"}
          </p>
        </div>

        {similarTerms.length > 0 && (
          <div className="contribution-form__similar-terms" role="alert">
            <h3>{t("similarTermsTitle")}</h3>
            <p>{t("similarTermsDescription")}</p>
            <ul>
              {similarTerms.map((item) => {
                const termLabel =
                  item.term?.[locale as LanguageTab] ||
                  item.term?.vi ||
                  item.term?.en ||
                  item.term?.lo ||
                  "(Không có tên)";

                const categoryLabel =
                  item.category?.name?.[locale as LanguageTab] ||
                  item.category?.name?.vi ||
                  item.category?.name?.en ||
                  item.category?.name?.lo ||
                  "Danh mục khác";

                return (
                  <li key={item._id}>
                    <Link href={item.url}>{termLabel}</Link>
                    <span> - {categoryLabel}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Language Tabs */}
        <div className="language-tabs">
          <button
            type="button"
            className={`language-tab ${currentLang === "vi" ? "active" : ""} ${formData.term.vi || formData.definition.vi ? "has-content" : ""}`}
            onClick={() => setCurrentLang("vi")}
          >
            🇻🇳 Tiếng Việt
            {(formData.term.vi || formData.definition.vi) && (
              <span className="content-indicator">●</span>
            )}
          </button>
          <button
            type="button"
            className={`language-tab ${currentLang === "en" ? "active" : ""} ${formData.term.en || formData.definition.en ? "has-content" : ""}`}
            onClick={() => setCurrentLang("en")}
          >
            🇬🇧 English
            {(formData.term.en || formData.definition.en) && (
              <span className="content-indicator">●</span>
            )}
          </button>
          <button
            type="button"
            className={`language-tab ${currentLang === "lo" ? "active" : ""} ${formData.term.lo || formData.definition.lo ? "has-content" : ""}`}
            onClick={() => setCurrentLang("lo")}
          >
            🇱🇦 ພາສາລາວ
            {(formData.term.lo || formData.definition.lo) && (
              <span className="content-indicator">●</span>
            )}
          </button>
        </div>

        {/* Basic Information */}
        <section className="form-section">
          <h2 className="form-section__title">{t("basicInfo")}</h2>

          <div className="form-group">
            <label className="form-label required">{t("termLabel")}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t("termPlaceholder", {
                lang: langName(currentLang),
              })}
              value={formData.term[currentLang] || ""}
              onChange={(e) =>
                handleInputChange("term", e.target.value, currentLang)
              }
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label required">
                {t("definitionLabel")}
              </label>
              <AIFieldAssist
                termContext={
                  formData.term[currentLang] || formData.term.vi || ""
                }
                fieldType="definition"
                language={currentLang}
                onInsert={(content) =>
                  handleInputChange("definition", content, currentLang)
                }
                disabled={
                  !(
                    formData.term[currentLang]?.trim() ||
                    formData.term.vi?.trim()
                  )
                }
              />
            </div>
            <RichTextEditor
              key={`definition-${currentLang}`}
              value={formData.definition[currentLang] || ""}
              onChange={(value) =>
                handleInputChange("definition", value, currentLang)
              }
              placeholder={t("definitionPlaceholder", {
                lang: langName(currentLang),
              })}
              minHeight={80}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">{t("categoryLabel")}</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              required
            >
              <option value="">{t("categoryPlaceholder")}</option>
              {categories.map((cat) => {
                const categoryId = (cat as any).id || cat._id;
                const catName = cat.name;
                const categoryName =
                  typeof catName === "string"
                    ? catName
                    : (catName as any)[locale] ||
                      catName.vi ||
                      catName.en ||
                      catName.lo ||
                      "";
                return (
                  <option key={categoryId} value={categoryId}>
                    {categoryName}
                  </option>
                );
              })}
            </select>
          </div>
        </section>

        {/* Detailed Information */}
        <section className="form-section">
          <h2 className="form-section__title">{t("detailedInfo")}</h2>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">
                {t("detailedExplanationLabel")}
              </label>
              <AIFieldAssist
                termContext={
                  formData.term[currentLang] || formData.term.vi || ""
                }
                fieldType="explanation"
                language={currentLang}
                onInsert={(content) =>
                  handleInputChange("detailedExplanation", content, currentLang)
                }
                disabled={
                  !(
                    formData.term[currentLang]?.trim() ||
                    formData.term.vi?.trim()
                  )
                }
              />
            </div>
            <RichTextEditor
              key={`expl-${currentLang}`}
              value={formData.detailedExplanation?.[currentLang] || ""}
              onChange={(value) =>
                handleInputChange("detailedExplanation", value, currentLang)
              }
              placeholder={t("detailedExplanationPlaceholder", {
                lang: langName(currentLang),
              })}
              minHeight={120}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("partOfSpeechLabel")}</label>
            <select
              className="form-select"
              value={formData.partOfSpeech || ""}
              onChange={(e) =>
                handleInputChange("partOfSpeech", e.target.value)
              }
            >
              <option value="">{t("partOfSpeechPlaceholder")}</option>
              <option value="noun">{t("partOfSpeech.noun")}</option>
              <option value="verb">{t("partOfSpeech.verb")}</option>
              <option value="adjective">{t("partOfSpeech.adjective")}</option>
              <option value="adverb">{t("partOfSpeech.adverb")}</option>
              <option value="phrase">{t("partOfSpeech.phrase")}</option>
              <option value="abbreviation">
                {t("partOfSpeech.abbreviation")}
              </option>
            </select>
          </div>

          {/* Examples */}
          <div className="form-group">
            <label className="form-label">{t("examplesLabel")}</label>
            {formData.examples?.map((example, index) => (
              <div key={index} className="array-input-item">
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("examplePlaceholder", {
                    lang: langName(currentLang),
                  })}
                  value={example[currentLang] || ""}
                  onChange={(e) =>
                    updateExample(index, e.target.value, currentLang)
                  }
                />
                {formData.examples!.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon btn-icon--danger"
                    onClick={() => removeExample(index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={addExample}
            >
              <PlusCircle size={16} />
              {t("addExample")}
            </button>
          </div>

          {/* Related Terms */}
          <div className="form-group">
            <label className="form-label">{t("relatedTermsLabel")}</label>
            {formData.relatedTerms?.map((term, index) => (
              <div key={index} className="array-input-item">
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("relatedTermPlaceholder")}
                  value={term}
                  onChange={(e) => updateRelatedTerm(index, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-icon btn-icon--danger"
                  onClick={() => removeRelatedTerm(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={addRelatedTerm}
            >
              <PlusCircle size={16} />
              {t("addRelatedTerm")}
            </button>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">{t("tagsLabel")}</label>
            {formData.tags?.map((tag, index) => (
              <div key={index} className="array-input-item">
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("tagPlaceholder")}
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-icon btn-icon--danger"
                  onClick={() => removeTag(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={addTag}
            >
              <PlusCircle size={16} />
              {t("addTag")}
            </button>
          </div>

          {/* Contributor Note */}
          <div className="form-group">
            <label className="form-label">{t("contributorNoteLabel")}</label>
            <textarea
              className="form-textarea"
              placeholder={t("contributorNotePlaceholder")}
              value={formData.contributorNote || ""}
              onChange={(e) =>
                handleInputChange("contributorNote", e.target.value)
              }
              rows={3}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" size={16} />
                {t("submitting")}
              </>
            ) : (
              <>
                <Send size={16} />
                {t("submit")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
