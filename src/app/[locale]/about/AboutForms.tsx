"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { Send, UserPlus } from "lucide-react";
import contactService from "@/services/contactService";

export default function AboutForms() {
  const t = useTranslations("aboutPage");

  // Biểu mẫu phản hồi
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    email: "",
    type: "feedback",
    message: "",
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Biểu mẫu đăng ký moderator
  const [moderatorData, setModeratorData] = useState({
    name: "",
    email: "",
    reason: "",
    experience: "",
  });
  const [moderatorLoading, setModeratorLoading] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackData.name || !feedbackData.email || !feedbackData.message) {
      return;
    }
    setFeedbackLoading(true);
    try {
      await contactService.submitFeedback(feedbackData);
      toast.success(t("feedbackSuccess"));
      setFeedbackData({ name: "", email: "", type: "feedback", message: "" });
    } catch {
      toast.error(t("feedbackError"));
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleModeratorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatorData.name || !moderatorData.email || !moderatorData.reason) {
      return;
    }
    setModeratorLoading(true);
    try {
      await contactService.submitModeratorApplication(moderatorData);
      toast.success(t("moderatorSuccess"));
      setModeratorData({ name: "", email: "", reason: "", experience: "" });
    } catch {
      toast.error(t("moderatorError"));
    } finally {
      setModeratorLoading(false);
    }
  };

  return (
    <>
      {/* Feedback Form */}
      <article className="about-card about-card--full">
        <div className="about-card__icon">
          <Send size={24} />
        </div>
        <h2 className="about-card__title">{t("feedbackTitle")}</h2>
        <p className="about-card__text">{t("feedbackSubtitle")}</p>

        <form className="about-form" onSubmit={handleFeedbackSubmit}>
          <div className="about-form__row">
            <div className="about-form__group">
              <label>{t("feedbackName")}</label>
              <input
                type="text"
                value={feedbackData.name}
                onChange={(e) =>
                  setFeedbackData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t("feedbackNamePlaceholder")}
                required
              />
            </div>
            <div className="about-form__group">
              <label>{t("feedbackEmail")}</label>
              <input
                type="email"
                value={feedbackData.email}
                onChange={(e) =>
                  setFeedbackData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder={t("feedbackEmailPlaceholder")}
                required
              />
            </div>
          </div>

          <div className="about-form__group">
            <label>{t("feedbackType")}</label>
            <select
              value={feedbackData.type}
              onChange={(e) =>
                setFeedbackData((p) => ({ ...p, type: e.target.value }))
              }
            >
              <option value="feedback">{t("feedbackTypeFeedback")}</option>
              <option value="bug">{t("feedbackTypeBug")}</option>
              <option value="feature">{t("feedbackTypeFeature")}</option>
              <option value="other">{t("feedbackTypeOther")}</option>
            </select>
          </div>

          <div className="about-form__group">
            <label>{t("feedbackMessage")}</label>
            <textarea
              value={feedbackData.message}
              onChange={(e) =>
                setFeedbackData((p) => ({ ...p, message: e.target.value }))
              }
              placeholder={t("feedbackMessagePlaceholder")}
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="about-form__submit"
            disabled={feedbackLoading}
          >
            {feedbackLoading ? t("feedbackSubmitting") : t("feedbackSubmit")}
          </button>
        </form>
      </article>

      {/* Moderator Registration Form */}
      <article className="about-card about-card--full">
        <div className="about-card__icon">
          <UserPlus size={24} />
        </div>
        <h2 className="about-card__title">{t("moderatorTitle")}</h2>
        <p className="about-card__text">{t("moderatorSubtitle")}</p>

        <form className="about-form" onSubmit={handleModeratorSubmit}>
          <div className="about-form__row">
            <div className="about-form__group">
              <label>{t("moderatorName")}</label>
              <input
                type="text"
                value={moderatorData.name}
                onChange={(e) =>
                  setModeratorData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t("moderatorNamePlaceholder")}
                required
              />
            </div>
            <div className="about-form__group">
              <label>{t("moderatorEmail")}</label>
              <input
                type="email"
                value={moderatorData.email}
                onChange={(e) =>
                  setModeratorData((p) => ({ ...p, email: e.target.value }))
                }
                placeholder={t("moderatorEmailPlaceholder")}
                required
              />
            </div>
          </div>

          <div className="about-form__group">
            <label>{t("moderatorReason")}</label>
            <textarea
              value={moderatorData.reason}
              onChange={(e) =>
                setModeratorData((p) => ({ ...p, reason: e.target.value }))
              }
              placeholder={t("moderatorReasonPlaceholder")}
              rows={3}
              required
            />
          </div>

          <div className="about-form__group">
            <label>{t("moderatorExperience")}</label>
            <textarea
              value={moderatorData.experience}
              onChange={(e) =>
                setModeratorData((p) => ({ ...p, experience: e.target.value }))
              }
              placeholder={t("moderatorExperiencePlaceholder")}
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="about-form__submit"
            disabled={moderatorLoading}
          >
            {moderatorLoading ? t("moderatorSubmitting") : t("moderatorSubmit")}
          </button>
        </form>
      </article>
    </>
  );
}
