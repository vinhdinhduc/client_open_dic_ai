"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactForm() {
  const t = useTranslations("contactPage");
  const [activeTab, setActiveTab] = useState<"feedback" | "moderator">(
    "feedback",
  );

  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [moderatorForm, setModeratorForm] = useState({
    name: "",
    email: "",
    reason: "",
    languages: "",
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:opendict@utb.edu.vn?subject=${encodeURIComponent(feedbackForm.subject)}&body=${encodeURIComponent(`Name: ${feedbackForm.name}\nEmail: ${feedbackForm.email}\n\n${feedbackForm.message}`)}`;
    window.open(mailtoLink, "_blank");
    toast.success(t("feedbackSuccess"));
    setFeedbackForm({ name: "", email: "", subject: "", message: "" });
  };

  const handleModeratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:opendict@utb.edu.vn?subject=${encodeURIComponent("Moderator Registration")}&body=${encodeURIComponent(`Name: ${moderatorForm.name}\nEmail: ${moderatorForm.email}\nLanguages: ${moderatorForm.languages}\n\nReason:\n${moderatorForm.reason}`)}`;
    window.open(mailtoLink, "_blank");
    toast.success(t("moderatorSuccess"));
    setModeratorForm({ name: "", email: "", reason: "", languages: "" });
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
          <button type="submit" className="contact-form__submit">
            {t("feedbackSubmit")}
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
          <button type="submit" className="contact-form__submit">
            {t("moderatorSubmit")}
          </button>
        </form>
      )}
    </div>
  );
}
