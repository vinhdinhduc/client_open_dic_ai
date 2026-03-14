"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import contactService from "@/services/contactService";

export default function ContactForm() {
  const t = useTranslations("contactPage");
  const [activeTab, setActiveTab] = useState<"feedback" | "moderator">(
    "feedback",
  );
  const [loading, setLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState<{
    name: string;
    email: string;
    subject: string;
    message: string;
  }>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [moderatorForm, setModeratorForm] = useState<{
    name: string;
    email: string;
    reason: string;
    languages: string;
  }>({
    name: "",
    email: "",
    reason: "",
    languages: "",
  });

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactService.submitFeedback({
        name: feedbackForm.name,
        email: feedbackForm.email,
        type: "feedback",
        subject: feedbackForm.subject,
        message: feedbackForm.message,
      });

      if (res.success) {
        toast.success(t("feedbackSuccess"));
        setFeedbackForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      toast.error(t("feedbackError"));
    } finally {
      setLoading(false);
    }
  };

  const handleModeratorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactService.submitModeratorApplication({
        name: moderatorForm.name,
        email: moderatorForm.email,
        reason: moderatorForm.reason,
        experience: moderatorForm.languages,
      });
      if (res.success) {
        toast.success(t("moderatorSuccess"));
        setModeratorForm({ name: "", email: "", reason: "", languages: "" });
      }
    } catch (error) {
      toast.error(t("moderatorError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form">
      <div className="contact-form__tabs">
        <button
          className={`contact-form__tab ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => setActiveTab("feedback")}
        >
          {t("feedbackTitle")}
        </button>
        <button
          className={`contact-form__tab ${activeTab === "moderator" ? "active" : ""}`}
          onClick={() => setActiveTab("moderator")}
        >
          {t("moderatorTitle")}
        </button>
      </div>

      {activeTab === "feedback" && (
        <form className="contact-form__form" onSubmit={handleFeedbackSubmit}>
          <p className="contact-form__desc">{t("feedbackDesc")}</p>
          <div className="contact-form__field">
            <label>{t("feedbackNameLabel")}</label>
            <input
              type="text"
              required
              placeholder={t("feedbackNamePlaceholder")}
              value={feedbackForm.name}
              onChange={(e) =>
                setFeedbackForm({ ...feedbackForm, name: e.target.value })
              }
            />
          </div>
          <div className="contact-form__field">
            <label>{t("feedbackEmailLabel")}</label>
            <input
              type="email"
              required
              placeholder={t("feedbackEmailPlaceholder")}
              value={feedbackForm.email}
              onChange={(e) =>
                setFeedbackForm({ ...feedbackForm, email: e.target.value })
              }
            />
          </div>
          <div className="contact-form__field">
            <label>{t("feedbackSubjectLabel")}</label>
            <input
              type="text"
              required
              placeholder={t("feedbackSubjectPlaceholder")}
              value={feedbackForm.subject}
              onChange={(e) =>
                setFeedbackForm({ ...feedbackForm, subject: e.target.value })
              }
            />
          </div>
          <div className="contact-form__field">
            <label>{t("feedbackMessageLabel")}</label>
            <textarea
              required
              rows={5}
              placeholder={t("feedbackMessagePlaceholder")}
              value={feedbackForm.message}
              onChange={(e) =>
                setFeedbackForm({ ...feedbackForm, message: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="contact-form__submit"
            disabled={loading}
          >
            {loading ? t("submitting") : t("feedbackSubmit")}
          </button>
        </form>
      )}

      {activeTab === "moderator" && (
        <form className="contact-form__form" onSubmit={handleModeratorSubmit}>
          <p className="contact-form__desc">{t("moderatorDesc")}</p>
          <div className="contact-form__field">
            <label>{t("moderatorNameLabel")}</label>
            <input
              type="text"
              required
              placeholder={t("moderatorNamePlaceholder")}
              value={moderatorForm.name}
              onChange={(e) =>
                setModeratorForm({ ...moderatorForm, name: e.target.value })
              }
            />
          </div>
          <div className="contact-form__field">
            <label>{t("moderatorEmailLabel")}</label>
            <input
              type="email"
              required
              placeholder={t("moderatorEmailPlaceholder")}
              value={moderatorForm.email}
              onChange={(e) =>
                setModeratorForm({ ...moderatorForm, email: e.target.value })
              }
            />
          </div>
          <div className="contact-form__field">
            <label>{t("moderatorLanguagesLabel")}</label>
            <input
              type="text"
              required
              placeholder={t("moderatorLanguagesPlaceholder")}
              value={moderatorForm.languages}
              onChange={(e) =>
                setModeratorForm({
                  ...moderatorForm,
                  languages: e.target.value,
                })
              }
            />
          </div>
          <div className="contact-form__field">
            <label>{t("moderatorReasonLabel")}</label>
            <textarea
              required
              rows={4}
              placeholder={t("moderatorReasonPlaceholder")}
              value={moderatorForm.reason}
              onChange={(e) =>
                setModeratorForm({ ...moderatorForm, reason: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            className="contact-form__submit"
            disabled={loading}
          >
            {loading ? t("submitting") : t("moderatorSubmit")}
          </button>
        </form>
      )}
    </div>
  );
}
