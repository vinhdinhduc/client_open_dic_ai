"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { reportTerm } from "@/services/termService";
import { ApiResponse, ReportData } from "./types";
import {
  X,
  Flag,
  AlertTriangle,
  Loader2,
  XCircle,
  ShieldX,
  Copy,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./ReportModal.scss";

interface ReportModalProps {
  termId: string;
  termName: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "incorrect", Icon: XCircle },
  { value: "spam", Icon: ShieldX },
  { value: "inappropriate", Icon: AlertTriangle },
  { value: "duplicate", Icon: Copy },
  { value: "other", Icon: MessageSquare },
] as const;

export default function ReportModal({
  termId,
  termName,
  onClose,
}: ReportModalProps) {
  const t = useTranslations("report");

  const [selectedReason, setSelectedReason] = useState<
    ReportData["reason"] | null
  >(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error(t("reasonRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const res: ApiResponse<null> = await reportTerm(termId, {
        reason: selectedReason,
        description: description.trim() || undefined,
      });
      if (res.success) {
        toast.success(t("success"));
      }
      onClose();
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="report-modal">
        {/* Header */}
        <div className="report-modal__header">
          <div className="header-title">
            <Flag size={20} />
            <h2>{t("title")}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Term Info */}
        <div className="report-modal__term-info">
          <AlertTriangle size={18} />
          <span>
            {t("reporting")} <strong>{termName}</strong>
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="report-modal__form">
          {/* Reason Selection */}
          <div className="form-group">
            <label className="form-label">{t("reasonLabel")} *</label>
            <div className="reason-list">
              {REPORT_REASONS.map((reason) => {
                const IconComponent = reason.Icon;
                return (
                  <label
                    key={reason.value}
                    className={`reason-item ${selectedReason === reason.value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={() => setSelectedReason(reason.value)}
                      className="reason-radio"
                    />
                    <span className="reason-icon">
                      <IconComponent size={18} />
                    </span>
                    <span className="reason-label">
                      {t(`reasons.${reason.value}` as any)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              {t("descriptionLabel")}
              <span className="optional">{t("optional")}</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={4}
              className="form-textarea"
              maxLength={500}
            />
            <span className="char-count">{description.length}/500</span>
          </div>

          {/* Actions */}
          <div className="report-modal__actions">
            <button
              type="button"
              className="btn btn--cancel"
              onClick={onClose}
              disabled={submitting}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="btn btn--submit"
              disabled={submitting || !selectedReason}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  <Flag size={16} />
                  {t("submit")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
