"use client";

import React from "react";
import { X, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import "@/app/[locale]/admin/moderation/moderation.scss";

export type ConfirmType = "approve" | "reject" | "delete" | "warning";

interface ConfirmModalProps {
  isOpen: boolean;
  type: ConfirmType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  reasonNote?: string;
  onReasonNoteChange?: (note: string) => void;
  quickReasons?: string[];
  requireReason?: boolean;
}

export default function ConfirmModal({
  isOpen,
  type,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  loading = false,
  reasonNote = "",
  onReasonNoteChange,
  quickReasons = [],
  requireReason = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isConfirmDisabled = loading || (requireReason && !reasonNote.trim());

  const getIcon = () => {
    switch (type) {
      case "approve":
        return (
          <CheckCircle
            size={48}
            className="confirm-icon confirm-icon--success"
          />
        );
      case "reject":
        return (
          <XCircle size={48} className="confirm-icon confirm-icon--danger" />
        );
      case "delete":
        return (
          <AlertTriangle
            size={48}
            className="confirm-icon confirm-icon--danger"
          />
        );
      case "warning":
      default:
        return (
          <AlertTriangle
            size={48}
            className="confirm-icon confirm-icon--warning"
          />
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "approve":
        return "btn btn--success";
      case "reject":
      case "delete":
        return "btn btn--danger";
      case "warning":
      default:
        return "btn btn--warning";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      className="modal-overlay modal-overlay--confirm"
      onClick={handleBackdropClick}
    >
      <div
        className={`confirm-modal ${type === "reject" && onReasonNoteChange ? "confirm-modal--wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="confirm-modal__close"
          onClick={onCancel}
          disabled={loading}
        >
          <X size={20} />
        </button>

        <div className="confirm-modal__icon">{getIcon()}</div>

        <div className="confirm-modal__content">
          <h3 className="confirm-modal__title">{title}</h3>
          <p className="confirm-modal__message">{message}</p>

          {/* Rejection Reason Section */}
          {type === "reject" && onReasonNoteChange && (
            <div className="confirm-modal__reason-section">
              {quickReasons.length > 0 && (
                <div className="quick-reasons">
                  <label className="quick-reasons__label">
                    Lựa chọn nhanh lý do từ chối:
                  </label>
                  <div className="quick-reasons__buttons">
                    {quickReasons.map((reason, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`quick-reason-btn ${
                          reasonNote === reason ? "active" : ""
                        }`}
                        onClick={() => onReasonNoteChange(reason)}
                        disabled={loading}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="rejection-reason">
                  {requireReason ? (
                    <>
                      Lý do từ chối <span className="required">*</span>
                    </>
                  ) : (
                    "Lý do từ chối (không bắt buộc)"
                  )}
                </label>
                <textarea
                  id="rejection-reason"
                  value={reasonNote}
                  onChange={(e) => onReasonNoteChange(e.target.value)}
                  placeholder="Nhập lý do từ chối đóng góp..."
                  rows={3}
                  className="form-textarea"
                  disabled={loading}
                />
                {requireReason && !reasonNote.trim() && (
                  <span className="error-text">
                    Vui lòng nhập lý do từ chối
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="confirm-modal__actions">
          <button
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={getConfirmButtonClass()}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinning" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
