"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { X, Copy, Check } from "lucide-react";
import "./detailModal.scss";

interface AuditLog {
  _id: string;
  action: string;
  actor: {
    _id: string;
    email: string;
    fullName?: string;
    role?: string;
  };
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  reason?: string;
  status: "success" | "failed";
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface DetailModalProps {
  log: AuditLog;
  onClose: () => void;
}

export default function DetailModal({ log, onClose }: DetailModalProps) {
  const t = useTranslations("auditLogs.modal");
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderJson = (obj: any, depth = 0) => {
    if (obj === null || obj === undefined) {
      return <span className="json-null">null</span>;
    }

    if (typeof obj === "boolean") {
      return <span className="json-boolean">{obj.toString()}</span>;
    }

    if (typeof obj === "number") {
      return <span className="json-number">{obj}</span>;
    }

    if (typeof obj === "string") {
      return <span className="json-string">"{obj.replace(/"/g, '\\"')}"</span>;
    }

    if (Array.isArray(obj)) {
      return (
        <div className="json-array">
          <span className="json-bracket">[</span>
          {obj.length > 0 && (
            <div
              className="json-items"
              style={{ marginLeft: `${depth + 1}em` }}
            >
              {obj.map((item, idx) => (
                <div key={idx} className="json-item">
                  {renderJson(item, depth + 1)}
                  {idx < obj.length - 1 && (
                    <span className="json-comma">,</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <span className="json-bracket">]</span>
        </div>
      );
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      return (
        <div className="json-object">
          <span className="json-bracket">{"{"}</span>
          {keys.length > 0 && (
            <div
              className="json-items"
              style={{ marginLeft: `${depth + 1}em` }}
            >
              {keys.map((key, idx) => (
                <div key={key} className="json-property">
                  <span className="json-key">"{key}"</span>
                  <span className="json-colon">:</span>
                  <span className="json-value">
                    {renderJson(obj[key], depth + 1)}
                  </span>
                  {idx < keys.length - 1 && (
                    <span className="json-comma">,</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <span className="json-bracket">{"}"}</span>
        </div>
      );
    }

    return <span>{JSON.stringify(obj)}</span>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{log.action}</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Overview Section */}
          <div className="section">
            <h3 className="section-title">{t("overview")}</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>{t("time")}</label>
                <span>{formatDateTime(log.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>{t("actor")}</label>
                <span>
                  {log.actor.email}
                  {log.actor.role && ` (${log.actor.role})`}
                </span>
              </div>
              <div className="info-item">
                <label>{t("resourceType")}</label>
                <span>{log.resourceType}</span>
              </div>
              <div className="info-item">
                <label>{t("resourceName")}</label>
                <span>{log.resourceName || "N/A"}</span>
              </div>
              <div className="info-item">
                <label>{t("status")}</label>
                <span
                  className={`status-badge ${
                    log.status === "success"
                      ? "status-success"
                      : "status-failed"
                  }`}
                >
                  {log.status === "success" ? t("success") : t("failed")}
                </span>
              </div>
              {log.reason && (
                <div className="info-item">
                  <label>{t("reason")}</label>
                  <span>{log.reason}</span>
                </div>
              )}
              {log.errorMessage && (
                <div className="info-item error">
                  <label>{t("error")}</label>
                  <span>{log.errorMessage}</span>
                </div>
              )}
              {log.ipAddress && (
                <div className="info-item">
                  <label>{t("ipAddress")}</label>
                  <span className="ip-address">{log.ipAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Changes Section */}
          {log.changes && (log.changes.before || log.changes.after) && (
            <div className="section">
              <h3 className="section-title">{t("changes")}</h3>
              <div className="diff-container">
                <div className="diff-column before">
                  <div className="diff-header">
                    <h4>{t("before")}</h4>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(log.changes?.before, null, 2),
                          0,
                        )
                      }
                      className="copy-btn"
                      title={t("copy")}
                    >
                      {copiedIndex === 0 ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <div className="json-display">
                    {log.changes.before ? (
                      renderJson(log.changes.before)
                    ) : (
                      <span className="json-null">null</span>
                    )}
                  </div>
                </div>

                <div className="diff-divider"></div>

                <div className="diff-column after">
                  <div className="diff-header">
                    <h4>{t("after")}</h4>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(log.changes?.after, null, 2),
                          1,
                        )
                      }
                      className="copy-btn"
                      title={t("copy")}
                    >
                      {copiedIndex === 1 ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <div className="json-display">
                    {log.changes.after ? (
                      renderJson(log.changes.after)
                    ) : (
                      <span className="json-null">null</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Agent Section */}
          {log.userAgent && (
            <div className="section">
              <h3 className="section-title">{t("userAgent")}</h3>
              <div className="user-agent">
                <span>{log.userAgent}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-close">
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
