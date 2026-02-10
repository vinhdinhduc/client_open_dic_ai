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
  { value: "incorrect", label: "Thông tin không chính xác", Icon: XCircle },
  { value: "spam", label: "Spam hoặc quảng cáo", Icon: ShieldX },
  {
    value: "inappropriate",
    label: "Nội dung không phù hợp",
    Icon: AlertTriangle,
  },
  { value: "duplicate", label: "Thuật ngữ trùng lặp", Icon: Copy },
  { value: "other", label: "Lý do khác", Icon: MessageSquare },
] as const;

export default function ReportModal({
  termId,
  termName,
  onClose,
}: ReportModalProps) {
  const t = useTranslations("term");

  const [selectedReason, setSelectedReason] = useState<
    ReportData["reason"] | null
  >(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error("Vui lòng chọn lý do báo cáo");
      return;
    }

    setSubmitting(true);
    try {
      const res: ApiResponse<null> = await reportTerm(termId, {
        reason: selectedReason,
        description: description.trim() || undefined,
      });
      if (res.success) {
        toast.success("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất.");
      }
      onClose();
    } catch (error) {
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại.");
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
            <h2>Báo cáo thuật ngữ</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Term Info */}
        <div className="report-modal__term-info">
          <AlertTriangle size={18} />
          <span>
            Bạn đang báo cáo: <strong>{termName}</strong>
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="report-modal__form">
          {/* Reason Selection */}
          <div className="form-group">
            <label className="form-label">Lý do báo cáo *</label>
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
                    <span className="reason-label">{reason.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Mô tả chi tiết
              <span className="optional">(không bắt buộc)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
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
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn--submit"
              disabled={submitting || !selectedReason}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Flag size={16} />
                  Gửi báo cáo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
