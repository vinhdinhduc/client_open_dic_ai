"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { authService, validateEmail } from "@/services/authService";
import "../Auth.scss";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("errorEmailRequired"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t("errorEmailInvalid"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setEmailSent(true);
        toast.success(t("emailSentTitle"));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || t("cannotSendEmail");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated Background Particles */}
      <div className="auth-page__particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Centered Card */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__logo">
            <img
              src="/images/logo.png"
              alt="UTB OpenDict"
              className="auth-card__logo-img"
            />
            <span className="auth-card__logo-text">UTB OpenDict</span>
          </div>
          <h1 className="auth-card__title">{t("forgotPasswordTitle")}</h1>
          <p className="auth-card__subtitle">{t("forgotPasswordSubtitle")}</p>
        </div>

        {/* Body */}
        <div className="auth-card__body">
          {emailSent ? (
            <div className="auth-success-message">
              <div className="auth-success-message__icon">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h3>{t("emailSentTitle")}</h3>
              <p>
                {t("emailSentMessage")} <strong>{email}</strong>
              </p>
              <p className="auth-success-message__note">{t("linkExpiry")}</p>
              <button
                className="auth-submit auth-submit--secondary"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                <i className="fa-solid fa-rotate-left"></i>
                {t("resendEmail")}
              </button>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <div className="auth-alert auth-alert--error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                {/* Email */}
                <div className="auth-input-group">
                  <label className="auth-input-group__label" htmlFor="email">
                    {t("email")}
                  </label>
                  <div className="auth-input-group__wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`auth-input-group__input ${error ? "auth-input-group__input--error" : ""}`}
                      placeholder={t("forgotPasswordEmailPlaceholder")}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                      autoFocus
                    />
                    <i className="fa-solid fa-envelope auth-input-group__icon"></i>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner auth-spinner"></i>
                      {t("sendingEmail")}
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      {t("sendResetLink")}
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="auth-card__footer">
          {t("rememberPassword")}
          <Link href="/login">{t("login")}</Link>
        </div>
      </div>
    </div>
  );
}
