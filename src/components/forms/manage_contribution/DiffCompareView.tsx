"use client";

import React, { useMemo } from "react";
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
//  Types & helpers
// ─────────────────────────────────────────────

interface DiffCompareViewProps {
  contribution: Contribution;
}

const PART_OF_SPEECH_LABELS: Record<string, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  phrase: "Cụm từ",
  abbreviation: "Từ viết tắt",
};

type DiffFieldDef = {
  label: string;
  oldVal?: string;
  newVal?: string;
};

function isChanged(a?: string, b?: string) {
  return (a ?? "").trim() !== (b ?? "").trim();
}

// ─────────────────────────────────────────────
//  DiffCompareView
// ─────────────────────────────────────────────

export default function DiffCompareView({
  contribution,
}: DiffCompareViewProps) {
  const t = contribution.targetTerm;
  const c = contribution;

  // ── Build field list ──────────────────────────
  const diffFields: DiffFieldDef[] = [];

  if (t) {
    diffFields.push({
      label: "Thuật ngữ (Vi)",
      oldVal: t.term?.vi,
      newVal: c.term?.vi,
    });

    if (t.term?.lo)
      diffFields.push({
        label: "Thuật ngữ (Lo)",
        oldVal: t.term.lo,
        newVal: c.term?.lo,
      });

    if (t.term?.en)
      diffFields.push({
        label: "Thuật ngữ (En)",
        oldVal: t.term.en,
        newVal: c.term?.en,
      });

    diffFields.push({
      label: "Định nghĩa (Vi)",
      oldVal: t.definition?.vi,
      newVal: c.definition?.vi,
    });

    if (t.definition?.lo)
      diffFields.push({
        label: "Định nghĩa (Lo)",
        oldVal: t.definition.lo,
        newVal: c.definition?.lo,
      });

    if (t.definition?.en)
      diffFields.push({
        label: "Định nghĩa (En)",
        oldVal: t.definition.en,
        newVal: c.definition?.en,
      });

    if (t.detailedExplanation?.vi)
      diffFields.push({
        label: "Giải thích chi tiết",
        oldVal: t.detailedExplanation.vi,
        newVal: c.detailedExplanation?.vi,
      });

    if (t.partOfSpeech)
      diffFields.push({
        label: "Từ loại",
        oldVal: PART_OF_SPEECH_LABELS[t.partOfSpeech] ?? t.partOfSpeech,
        newVal:
          PART_OF_SPEECH_LABELS[c.partOfSpeech ?? ""] ?? c.partOfSpeech ?? "",
      });
  }

  // ── Examples ────────────────────────────────
  const oldExamplesText = (t?.examples ?? [])
    .map((e) => e.vi || e.lo || e.en)
    .join("\n");
  const newExamplesText = (c.examples ?? [])
    .map((e) => e.vi || e.lo || e.en)
    .join("\n");
  const examplesChanged = isChanged(oldExamplesText, newExamplesText);

  // ── Tags ─────────────────────────────────────
  const oldTags = t?.tags ?? [];
  const newTags = c.tags ?? [];
  const tagsChanged = oldTags.join(",") !== newTags.join(",");

  // ── Render ───────────────────────────────────
  return (
    <>
      {/* Legend */}
      <div className="diff-legend">
        <span className="diff-legend__item">
          <mark className="diff-mark diff-mark--removed">bị xóa</mark>
        </span>
        <span className="diff-legend__item">
          <mark className="diff-mark diff-mark--added">được thêm</mark>
        </span>
        <span className="diff-legend__item diff-legend__unchanged">
          không đổi
        </span>
      </div>

      <div className="diff-compare">
        {/* ── Left column: Original content ── */}
        <div className="diff-box diff-box--original">
          <div className="diff-header">
            <FileText size={16} />
            <span>Nội dung gốc</span>
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

            {/* Examples */}
            {oldExamplesText && (
              <div
                className={`diff-field${examplesChanged ? " diff-field--changed" : ""}`}
              >
                <label>Ví dụ:</label>
                {examplesChanged ? (
                  <OriginalText
                    oldText={oldExamplesText}
                    newText={newExamplesText}
                  />
                ) : (
                  (t?.examples ?? []).map((ex, i) => (
                    <p key={i}>{ex.vi || ex.lo || ex.en}</p>
                  ))
                )}
              </div>
            )}

            {/* Tags */}
            {oldTags.length > 0 && (
              <div
                className={`diff-field${tagsChanged ? " diff-field--changed" : ""}`}
              >
                <label>Tags:</label>
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

        {/* ── Divider ── */}
        <div className="diff-divider">
          <div className="diff-divider__line" />
          <span className="diff-divider__icon">→</span>
          <div className="diff-divider__line" />
        </div>

        {/* ── Right column: Proposed content ── */}
        <div className="diff-box diff-box--suggested">
          <div className="diff-header">
            <Edit3 size={16} />
            <span>Nội dung đề xuất</span>
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

            {/* Examples */}
            {oldExamplesText && (
              <div
                className={`diff-field${examplesChanged ? " diff-field--changed" : ""}`}
              >
                <label>Ví dụ:</label>
                {examplesChanged ? (
                  <EditedText
                    oldText={oldExamplesText}
                    newText={newExamplesText}
                  />
                ) : (
                  <p className="diff-field__unchanged">-</p>
                )}
              </div>
            )}

            {/* Contributor note — right side only */}
            {c.contributorNote && (
              <div className="diff-field diff-field--note">
                <label>Ghi chú người đóng góp:</label>
                <p>{c.contributorNote}</p>
              </div>
            )}

            {/* Tags */}
            {oldTags.length > 0 && (
              <div
                className={`diff-field${tagsChanged ? " diff-field--changed" : ""}`}
              >
                <label>Tags:</label>
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
