"use client";

import React, { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FileText, Edit3 } from "lucide-react";
import { Contribution } from "@/services/contributionService";
import { diffWords } from "./diffWords";

function OriginalText({
  oldText,
  newText,
}: {
  oldText: string;
  newText: string;
}) {
  const parts = useMemo(
    () => diffWords(oldText || "", newText || ""),
    [oldText, newText],
  );

  return (
    <p className="diff-inline-text">
      {parts.map((part, i) => {
        if (part.added) return null;
        if (part.removed)
          return (
            <mark key={i} className="diff-mark diff-mark--removed">
              {part.value}
            </mark>
          );
        return <span key={i}>{part.value}</span>;
      })}
    </p>
  );
}

/**
 * Renders proposed text: shows unchanged and added words, hides removed words.
 * Added words are highlighted with green background.
 */
function EditedText({
  oldText,
  newText,
}: {
  oldText: string;
  newText: string;
}) {
  const parts = useMemo(
    () => diffWords(oldText || "", newText || ""),
    [oldText, newText],
  );

  return (
    <p className="diff-inline-text">
      {parts.map((part, i) => {
        if (part.removed) return null;
        if (part.added)
          return (
            <mark key={i} className="diff-mark diff-mark--added">
              {part.value}
            </mark>
          );
        return <span key={i}>{part.value}</span>;
      })}
    </p>
  );
}

// ─────────────────────────────────────────────
//  Kiểu dữ liệu và hàm hỗ trợ
// ─────────────────────────────────────────────

interface DiffCompareViewProps {
  contribution: Contribution;
}

type DiffFieldDef = {
  label: string;
  oldVal?: string;
  newVal?: string;
};

type LocaleKey = "vi" | "en" | "lo";

type CategoryLike =
  | {
      _id?: string;
      name?: string | Partial<Record<LocaleKey, string>>;
    }
  | string
  | null
  | undefined;

function toPlainText(value?: string) {
  if (!value) return "";

  if (typeof window === "undefined") {
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const el = document.createElement("div");
  el.innerHTML = value;
  return (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
}

function getLocalizedCategoryName(category: CategoryLike, locale: LocaleKey) {
  if (!category) return "";
  if (typeof category === "string") return category;

  if (typeof category.name === "string") {
    return category.name;
  }

  return (
    category.name?.[locale] ||
    category.name?.vi ||
    category.name?.en ||
    category.name?.lo ||
    ""
  );
}

function isChanged(a?: string, b?: string) {
  return (a ?? "").trim() !== (b ?? "").trim();
}

function hasAnyValue(...values: Array<string | undefined>) {
  return values.some((value) => (value ?? "").trim() !== "");
}

function getExamplesByLang(
  examples:
    | Array<{
        vi?: string;
        en?: string;
        lo?: string;
      }>
    | undefined,
  lang: LocaleKey,
) {
  return (examples ?? [])
    .map((example) => toPlainText(example?.[lang]))
    .filter((value) => value.trim() !== "")
    .join("\n");
}

export default function DiffCompareView({
  contribution,
}: DiffCompareViewProps) {
  const tModeration = useTranslations("moderationContributions");
  const locale = useLocale() as LocaleKey;

  const t = contribution.targetTerm;
  const c = contribution;

  const PART_OF_SPEECH_LABELS: Record<string, string> = {
    noun: tModeration("diffCompare.partOfSpeechValues.noun"),
    verb: tModeration("diffCompare.partOfSpeechValues.verb"),
    adjective: tModeration("diffCompare.partOfSpeechValues.adjective"),
    adverb: tModeration("diffCompare.partOfSpeechValues.adverb"),
    phrase: tModeration("diffCompare.partOfSpeechValues.phrase"),
    abbreviation: tModeration("diffCompare.partOfSpeechValues.abbreviation"),
  };

  const diffFields: DiffFieldDef[] = [];

  if (t) {
    diffFields.push({
      label: tModeration("diffCompare.labels.termVi"),
      oldVal: toPlainText(t.term?.vi),
      newVal: toPlainText(c.term?.vi),
    });

    if (hasAnyValue(t.term?.lo, c.term?.lo))
      diffFields.push({
        label: tModeration("diffCompare.labels.termLo"),
        oldVal: toPlainText(t.term.lo),
        newVal: toPlainText(c.term?.lo),
      });

    if (hasAnyValue(t.term?.en, c.term?.en))
      diffFields.push({
        label: tModeration("diffCompare.labels.termEn"),
        oldVal: toPlainText(t.term.en),
        newVal: toPlainText(c.term?.en),
      });

    diffFields.push({
      label: tModeration("diffCompare.labels.definitionVi"),
      oldVal: toPlainText(t.definition?.vi),
      newVal: toPlainText(c.definition?.vi),
    });

    if (hasAnyValue(t.definition?.lo, c.definition?.lo))
      diffFields.push({
        label: tModeration("diffCompare.labels.definitionLo"),
        oldVal: toPlainText(t.definition?.lo),
        newVal: toPlainText(c.definition?.lo),
      });

    if (hasAnyValue(t.definition?.en, c.definition?.en))
      diffFields.push({
        label: tModeration("diffCompare.labels.definitionEn"),
        oldVal: toPlainText(t.definition?.en),
        newVal: toPlainText(c.definition?.en),
      });

    if (hasAnyValue(t.detailedExplanation?.vi, c.detailedExplanation?.vi))
      diffFields.push({
        label: tModeration("diffCompare.labels.detailedExplanationVi"),
        oldVal: toPlainText(t.detailedExplanation?.vi),
        newVal: toPlainText(c.detailedExplanation?.vi),
      });

    if (hasAnyValue(t.detailedExplanation?.en, c.detailedExplanation?.en))
      diffFields.push({
        label: tModeration("diffCompare.labels.detailedExplanationEn"),
        oldVal: toPlainText(t.detailedExplanation?.en),
        newVal: toPlainText(c.detailedExplanation?.en),
      });

    if (hasAnyValue(t.detailedExplanation?.lo, c.detailedExplanation?.lo))
      diffFields.push({
        label: tModeration("diffCompare.labels.detailedExplanationLo"),
        oldVal: toPlainText(t.detailedExplanation?.lo),
        newVal: toPlainText(c.detailedExplanation?.lo),
      });

    const oldCategoryName = getLocalizedCategoryName(
      (t as { category?: CategoryLike }).category,
      locale,
    );
    const newCategoryName = getLocalizedCategoryName(
      c.category as unknown as CategoryLike,
      locale,
    );

    if (oldCategoryName || newCategoryName) {
      diffFields.push({
        label: tModeration("diffCompare.labels.category"),
        oldVal: oldCategoryName,
        newVal: newCategoryName,
      });
    }

    if (t.partOfSpeech)
      diffFields.push({
        label: tModeration("diffCompare.labels.partOfSpeech"),
        oldVal: PART_OF_SPEECH_LABELS[t.partOfSpeech] ?? t.partOfSpeech,
        newVal:
          PART_OF_SPEECH_LABELS[c.partOfSpeech ?? ""] ?? c.partOfSpeech ?? "",
      });
  }

  const oldExamplesVi = getExamplesByLang(t?.examples, "vi");
  const newExamplesVi = getExamplesByLang(c.examples, "vi");
  const oldExamplesEn = getExamplesByLang(t?.examples, "en");
  const newExamplesEn = getExamplesByLang(c.examples, "en");
  const oldExamplesLo = getExamplesByLang(t?.examples, "lo");
  const newExamplesLo = getExamplesByLang(c.examples, "lo");

  const examplesViChanged = isChanged(oldExamplesVi, newExamplesVi);
  const examplesEnChanged = isChanged(oldExamplesEn, newExamplesEn);
  const examplesLoChanged = isChanged(oldExamplesLo, newExamplesLo);

  const oldTags = t?.tags ?? [];
  const newTags = c.tags ?? [];
  const tagsChanged = oldTags.join(",") !== newTags.join(",");

  return (
    <>
      <div className="diff-legend">
        <span className="diff-legend__item">
          <mark className="diff-mark diff-mark--removed">
            {tModeration("diffCompare.legend.removed")}
          </mark>
        </span>
        <span className="diff-legend__item">
          <mark className="diff-mark diff-mark--added">
            {tModeration("diffCompare.legend.added")}
          </mark>
        </span>
        <span className="diff-legend__item diff-legend__unchanged">
          {tModeration("diffCompare.legend.unchanged")}
        </span>
      </div>

      <div className="diff-compare">
        <div className="diff-box diff-box--original">
          <div className="diff-header">
            <FileText size={16} />
            <span>{tModeration("diffCompare.originalContent")}</span>
          </div>
          <div className="diff-content">
            {diffFields.map((f) => {
              const changed = isChanged(f.oldVal, f.newVal);
              return (
                <div
                  key={f.label}
                  className={`diff-field${changed ? " diff-field--changed" : ""}`}
                >
                  <label>{f.label}:</label>
                  {changed ? (
                    <OriginalText
                      oldText={f.oldVal ?? ""}
                      newText={f.newVal ?? ""}
                    />
                  ) : (
                    <p>{f.oldVal || "-"}</p>
                  )}
                </div>
              );
            })}

            {hasAnyValue(oldExamplesVi, newExamplesVi) && (
              <div
                className={`diff-field${examplesViChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.examplesVi")}:</label>
                {examplesViChanged ? (
                  <OriginalText
                    oldText={oldExamplesVi}
                    newText={newExamplesVi}
                  />
                ) : (
                  <p>{oldExamplesVi || "-"}</p>
                )}
              </div>
            )}

            {hasAnyValue(oldExamplesEn, newExamplesEn) && (
              <div
                className={`diff-field${examplesEnChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.examplesEn")}:</label>
                {examplesEnChanged ? (
                  <OriginalText
                    oldText={oldExamplesEn}
                    newText={newExamplesEn}
                  />
                ) : (
                  <p>{oldExamplesEn || "-"}</p>
                )}
              </div>
            )}

            {hasAnyValue(oldExamplesLo, newExamplesLo) && (
              <div
                className={`diff-field${examplesLoChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.examplesLo")}:</label>
                {examplesLoChanged ? (
                  <OriginalText
                    oldText={oldExamplesLo}
                    newText={newExamplesLo}
                  />
                ) : (
                  <p>{oldExamplesLo || "-"}</p>
                )}
              </div>
            )}

            {oldTags.length > 0 && (
              <div
                className={`diff-field${tagsChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.tags")}:</label>
                <div className="diff-tags">
                  {oldTags.map((tag, i) => (
                    <span
                      key={i}
                      className={`badge badge--outline${
                        tagsChanged && !newTags.includes(tag)
                          ? " diff-tag--removed"
                          : ""
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="diff-divider">
          <div className="diff-divider__line" />
          <span className="diff-divider__icon">→</span>
          <div className="diff-divider__line" />
        </div>

        <div className="diff-box diff-box--suggested">
          <div className="diff-header">
            <Edit3 size={16} />
            <span>{tModeration("diffCompare.suggestedContent")}</span>
          </div>
          <div className="diff-content">
            {diffFields.map((f) => {
              const changed = isChanged(f.oldVal, f.newVal);
              return (
                <div
                  key={f.label}
                  className={`diff-field${changed ? " diff-field--changed" : ""}`}
                >
                  <label>{f.label}:</label>
                  {changed ? (
                    <EditedText
                      oldText={f.oldVal ?? ""}
                      newText={f.newVal ?? ""}
                    />
                  ) : (
                    <p className="diff-field__unchanged">-</p>
                  )}
                </div>
              );
            })}

            {hasAnyValue(oldExamplesVi, newExamplesVi) && (
              <div
                className={`diff-field${examplesViChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.examplesVi")}:</label>
                {examplesViChanged ? (
                  <EditedText
                    oldText={oldExamplesVi}
                    newText={newExamplesVi}
                  />
                ) : (
                  <p className="diff-field__unchanged">-</p>
                )}
              </div>
            )}

            {hasAnyValue(oldExamplesEn, newExamplesEn) && (
              <div
                className={`diff-field${examplesEnChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.examplesEn")}:</label>
                {examplesEnChanged ? (
                  <EditedText oldText={oldExamplesEn} newText={newExamplesEn} />
                ) : (
                  <p className="diff-field__unchanged">-</p>
                )}
              </div>
            )}

            {hasAnyValue(oldExamplesLo, newExamplesLo) && (
              <div
                className={`diff-field${examplesLoChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.examplesLo")}:</label>
                {examplesLoChanged ? (
                  <EditedText oldText={oldExamplesLo} newText={newExamplesLo} />
                ) : (
                  <p className="diff-field__unchanged">-</p>
                )}
              </div>
            )}

            {c.contributorNote && (
              <div className="diff-field diff-field--note">
                <label>
                  {tModeration("diffCompare.labels.contributorNote")}:
                </label>
                <p>{toPlainText(c.contributorNote)}</p>
              </div>
            )}

            {oldTags.length > 0 && (
              <div
                className={`diff-field${tagsChanged ? " diff-field--changed" : ""}`}
              >
                <label>{tModeration("diffCompare.labels.tags")}:</label>
                {tagsChanged ? (
                  <div className="diff-tags">
                    {newTags.map((tag, i) => (
                      <span
                        key={i}
                        className={`badge badge--outline${
                          !oldTags.includes(tag) ? " diff-tag--added" : ""
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="diff-field__unchanged">-</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
