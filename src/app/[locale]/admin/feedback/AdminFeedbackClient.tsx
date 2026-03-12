"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import contactService from "@/services/contactService";
import { useTranslations } from "next-intl";

interface Feedback {
  _id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: string;
  adminNote: string;
  createdAt: string;
}

interface ModeratorApp {
  _id: string;
  name: string;
  email: string;
  reason: string;
  experience: string;
  status: string;
  adminNote: string;
  createdAt: string;
}

type TabType = "feedback" | "moderator";

export default function AdminFeedbackClient() {
  const t = useTranslations("adminFeedback");
  const [activeTab, setActiveTab] = useState<TabType>("feedback");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [applications, setApplications] = useState<ModeratorApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<
    Feedback | ModeratorApp | null
  >(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const loadFeedbacks = useCallback(async () => {
    try {
      const res = await contactService.getFeedbacks({
        status: statusFilter || undefined,
      });
      setFeedbacks(res.data.feedbacks);
    } catch (err: any) {
      toast.error(err.message || t("loadFeedbackError"));
    }
  }, [statusFilter]);

  const loadApplications = useCallback(async () => {
    try {
      const res = await contactService.getModeratorApplications({
        status: statusFilter || undefined,
      });
      setApplications(res.data.applications);
    } catch (err: any) {
      toast.error(err.message || t("loadApplicationsError"));
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    if (activeTab === "feedback") {
      loadFeedbacks().finally(() => setLoading(false));
    } else {
      loadApplications().finally(() => setLoading(false));
    }
  }, [activeTab, statusFilter, loadFeedbacks, loadApplications]);

  const handleUpdateFeedback = async (id: string, status: string) => {
    try {
      await contactService.updateFeedbackStatus(id, { status, adminNote });
      toast.success(t("updateSuccess"));
      setSelectedItem(null);
      setAdminNote("");
      loadFeedbacks();
    } catch {
      toast.error(t("updateError"));
    }
  };

  const handleReviewApplication = async (id: string, status: string) => {
    try {
      await contactService.reviewModeratorApplication(id, {
        status,
        adminNote,
      });
      toast.success(
        status === "approved"
          ? t("applicationApproved")
          : t("applicationRejected"),
      );
      setSelectedItem(null);
      setAdminNote("");
      loadApplications();
    } catch {
      toast.error(t("applicationError"));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { icon: React.ReactNode; label: string; cls: string }
    > = {
      pending: {
        icon: <Clock size={14} />,
        label: t("statusPending"),
        cls: "badge--warning",
      },
      reviewed: {
        icon: <Eye size={14} />,
        label: t("statusReviewed"),
        cls: "badge--info",
      },
      resolved: {
        icon: <CheckCircle size={14} />,
        label: t("statusResolved"),
        cls: "badge--success",
      },
      approved: {
        icon: <CheckCircle size={14} />,
        label: t("statusApproved"),
        cls: "badge--success",
      },
      rejected: {
        icon: <XCircle size={14} />,
        label: t("statusRejected"),
        cls: "badge--danger",
      },
    };
    const b = badges[status] || badges.pending;
    return (
      <span className={`admin-badge ${b.cls}`}>
        {b.icon} {b.label}
      </span>
    );
  };

  const typeLabels: Record<string, string> = {
    feedback: t("typeFeedback"),
    bug: t("typeBugReport"),
    feature: t("typeSuggestion"),
    other: t("typeOther"),
  };

  return (
    <div className="admin-feedback">
      <div className="admin-feedback__header">
        <h1>{t("title")}</h1>
      </div>

      {/* Tabs */}
      <div className="admin-feedback__tabs">
        <button
          className={`admin-tab ${activeTab === "feedback" ? "admin-tab--active" : ""}`}
          onClick={() => {
            setActiveTab("feedback");
            setStatusFilter("");
          }}
        >
          <MessageSquare size={18} /> {t("tabFeedback")}
        </button>
        <button
          className={`admin-tab ${activeTab === "moderator" ? "admin-tab--active" : ""}`}
          onClick={() => {
            setActiveTab("moderator");
            setStatusFilter("");
          }}
        >
          <UserPlus size={18} /> {t("tabApplications")}
        </button>
      </div>

      {/* Filter */}
      <div className="admin-feedback__filter">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">{t("allStatuses")}</option>
          {activeTab === "feedback" ? (
            <>
              <option value="pending">{t("statusPending")}</option>
              <option value="reviewed">{t("statusReviewed")}</option>
              <option value="resolved">{t("statusResolved")}</option>
            </>
          ) : (
            <>
              <option value="pending">{t("statusPending")}</option>
              <option value="approved">{t("statusApproved")}</option>
              <option value="rejected">{t("statusRejected")}</option>
            </>
          )}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="admin-feedback__loading">
          <RefreshCw className="spin" size={24} />
          <p>{t("loading")}</p>
        </div>
      ) : activeTab === "feedback" ? (
        <div className="admin-feedback__list">
          {feedbacks.length === 0 ? (
            <p className="admin-feedback__empty">{t("noFeedback")}</p>
          ) : (
            feedbacks.map((fb) => (
              <div
                key={fb._id}
                className={`admin-feedback__item ${selectedItem?._id === fb._id ? "admin-feedback__item--active" : ""}`}
                onClick={() => {
                  setSelectedItem(fb);
                  setAdminNote(fb.adminNote || "");
                }}
              >
                <div className="admin-feedback__item-header">
                  <strong>{fb.name}</strong>
                  <span className="admin-feedback__item-type">
                    {typeLabels[fb.type] || fb.type}
                  </span>
                  {getStatusBadge(fb.status)}
                </div>
                <p className="admin-feedback__item-email">{fb.email}</p>
                <p className="admin-feedback__item-message">{fb.message}</p>
                <time className="admin-feedback__item-date">
                  {new Date(fb.createdAt).toLocaleDateString("vi")}
                </time>

                {selectedItem?._id === fb._id && (
                  <div
                    className="admin-feedback__actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      placeholder={t("adminNotePlaceholder")}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={2}
                    />
                    <div className="admin-feedback__action-btns">
                      <button
                        className="admin-btn admin-btn--secondary"
                        onClick={() => handleUpdateFeedback(fb._id, "reviewed")}
                      >
                        <Eye size={16} /> {t("markReviewed")}
                      </button>
                      <button
                        className="admin-btn admin-btn--primary"
                        onClick={() => handleUpdateFeedback(fb._id, "resolved")}
                      >
                        <CheckCircle size={16} /> {t("resolved")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="admin-feedback__list">
          {applications.length === 0 ? (
            <p className="admin-feedback__empty">{t("noApplications")}</p>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className={`admin-feedback__item ${selectedItem?._id === app._id ? "admin-feedback__item--active" : ""}`}
                onClick={() => {
                  setSelectedItem(app);
                  setAdminNote(app.adminNote || "");
                }}
              >
                <div className="admin-feedback__item-header">
                  <strong>{app.name}</strong>
                  {getStatusBadge(app.status)}
                </div>
                <p className="admin-feedback__item-email">{app.email}</p>
                <p className="admin-feedback__item-message">
                  <strong>{t("reason")}</strong> {app.reason}
                </p>
                {app.experience && (
                  <p className="admin-feedback__item-message">
                    <strong>{t("experience")}</strong> {app.experience}
                  </p>
                )}
                <time className="admin-feedback__item-date">
                  {new Date(app.createdAt).toLocaleDateString("vi")}
                </time>

                {selectedItem?._id === app._id && app.status === "pending" && (
                  <div
                    className="admin-feedback__actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <textarea
                      placeholder={t("adminNotePlaceholder")}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={2}
                    />
                    <div className="admin-feedback__action-btns">
                      <button
                        className="admin-btn admin-btn--danger"
                        onClick={() =>
                          handleReviewApplication(app._id, "rejected")
                        }
                      >
                        <XCircle size={16} /> {t("reject")}
                      </button>
                      <button
                        className="admin-btn admin-btn--primary"
                        onClick={() =>
                          handleReviewApplication(app._id, "approved")
                        }
                      >
                        <CheckCircle size={16} /> {t("approve")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .admin-feedback {
          padding: 1.5rem;
        }
        .admin-feedback__header h1 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        .admin-feedback__tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .admin-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .admin-tab--active {
          background: var(--primary, #16a34a);
          color: #fff;
          border-color: var(--primary, #16a34a);
        }
        .admin-feedback__filter {
          margin-bottom: 1rem;
        }
        .admin-feedback__filter select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }
        .admin-feedback__filter select option {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .admin-feedback__loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem;
          color: var(--text-secondary);
        }
        .admin-feedback__empty {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }
        .admin-feedback__item {
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background: var(--bg-secondary);
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .admin-feedback__item:hover {
          border-color: var(--primary, #16a34a);
        }
        .admin-feedback__item--active {
          border-color: var(--primary, #16a34a);
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
        }
        .admin-feedback__item-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.375rem;
          flex-wrap: wrap;
        }
        .admin-feedback__item-type {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-secondary);
        }
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }
        .badge--warning {
          background: #fef3c7;
          color: #92400e;
        }
        .badge--info {
          background: #dbeafe;
          color: #1e40af;
        }
        .badge--success {
          background: #dcfce7;
          color: #166534;
        }
        .badge--danger {
          background: #fecaca;
          color: #991b1b;
        }
        .admin-feedback__item-email {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0 0 0.5rem;
        }
        .admin-feedback__item-message {
          font-size: 0.875rem;
          color: var(--text-primary);
          margin: 0 0 0.375rem;
          line-height: 1.5;
        }
        .admin-feedback__item-date {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .admin-feedback__actions {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }
        .admin-feedback__actions textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 0.5rem;
        }
        .admin-feedback__action-btns {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .admin-btn:hover {
          opacity: 0.85;
        }
        .admin-btn--primary {
          background: var(--primary, #16a34a);
          color: #fff;
        }
        .admin-btn--secondary {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        .admin-btn--danger {
          background: #dc2626;
          color: #fff;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
