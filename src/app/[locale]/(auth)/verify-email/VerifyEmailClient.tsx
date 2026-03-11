"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import "../Auth.scss";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus("error");
      setMessage(t("invalidTokenVerifyError"));
      setIsLoading(false);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(verificationToken);
      if (response.success) {
        setVerificationStatus("success");
        setMessage(response.message || t("verificationSuccess"));
        toast.success(t("verificationSuccess"));

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message ||
        t("verificationFailed");
      setVerificationStatus("error");
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!authService.isAuthenticated()) {
      toast.error(t("loginToResendEmail"));
      router.push("/login");
      return;
    }

    setIsResending(true);
    try {
      const response = await authService.resendVerificationEmail();
      if (response.success) {
        toast.success(t("resendVerificationEmail"));
        setMessage(t("checkEmailForVerification"));
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message ||
        t("cannotSendEmail");
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="auth-page__content">
        <div className="auth-card">
          <div className="auth-card__header">
            <div className="auth-card__logo">
              <img
                src="/images/logo.png"
                alt="UTB OpenDict"
                className="auth-card__logo-img"
              />
              <span className="auth-card__logo-text">UTB OpenDict</span>
            </div>
            <h2 className="auth-card__title">
              {verificationStatus === "verifying" && t("verifyingTitle")}
              {verificationStatus === "success" && t("verifySuccessTitle")}
              {verificationStatus === "error" && t("verifyErrorTitle")}
            </h2>
            <p className="auth-card__subtitle">
              {verificationStatus === "verifying" && t("verifyingSubtitle")}
              {verificationStatus === "success" && t("verifySuccessSubtitle")}
              {verificationStatus === "error" && t("verifyErrorSubtitle")}
            </p>
          </div>

          <div className="auth-card__body">
            {isLoading ? (
              <div className="verification-status">
                <div className="spinner"></div>
                <p>{t("verifyingMessage")}</p>
              </div>
            ) : (
              <>
                {verificationStatus === "success" && (
                  <div className="verification-status success">
                    <div className="success-icon">
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <p className="success-message">{message}</p>
                    <p className="redirect-message">
                      {t("verifyRedirectMessage")}
                    </p>
                    <Link href="/" className="btn btn-primary">
                      {tCommon("backToHome")}
                    </Link>
                  </div>
                )}

                {verificationStatus === "error" && (
                  <div className="verification-status error">
                    <div className="error-icon">
                      <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <p className="error-message">{message}</p>
                    <div className="error-actions">
                      <button
                        onClick={handleResendEmail}
                        className="btn btn-primary"
                        disabled={isResending}
                      >
                        {isResending ? t("resending") : t("resendVerificationEmail")}
                      </button>
                      <Link href="/login" className="btn btn-secondary">
                        {t("login")}
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="auth-card__footer">
            <p className="auth-card__footer-text">
              {t("needSupport")}{" "}
              <Link href="/contact" className="link">
                {t("contactUs")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-page__content">
            <div className="auth-card">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
