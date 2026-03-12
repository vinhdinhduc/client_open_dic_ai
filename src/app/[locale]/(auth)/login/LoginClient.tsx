"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { authService, validateEmail } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import GoogleLoginButton from "@/components/common/GoogleLoginButton";
import "../Auth.scss";

export default function LoginPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const redirect = searchParams.get("returnUrl");
  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      router.push("/admin");
    } else if (isAuthenticated && user?.role === "moderator") {
      router.push("/moderator");
    } else if (isAuthenticated) {
      router.push(redirect || "/");
    }
  }, [router, isAuthenticated, user, redirect]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setAlertMessage(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = t("errorEmailRequired");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("errorEmailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("errorPasswordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("errorPasswordMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setAlertMessage(null);

    try {
      const success = await login({
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        toast.success("Đăng nhập thành công!");
        if (user?.role === "admin") {
          router.push("/admin");
        } else if (user?.role === "moderator") {
          router.push("/moderator");
        } else {
          router.push("/");
        }
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string; error?: string };
          status?: number;
        };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        t("loginFailed");
      console.log("Message", err);

      setAlertMessage({ type: "error", message });

      // Hiển thị thông báo đặc biệt nếu tài khoản chưa kích hoạt
      if (
        err.response?.status === 403 &&
        message.includes("chưa được kích hoạt")
      ) {
        toast.error("Vui lòng xác thực email trước khi đăng nhập!");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoHome = () => {
    router.push("/");
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
              onClick={handleGoHome}
            />
            <span className="auth-card__logo-text">UTB OpenDict</span>
          </div>
          <h1 className="auth-card__title">{t("welcome")}</h1>
          <p className="auth-card__subtitle">{t("dear")}</p>
        </div>

        {/* Body */}
        <div className="auth-card__body">
          {/* Alert Message */}
          {alertMessage && (
            <div className={`auth-alert auth-alert--${alertMessage.type}`}>
              <i
                className={`fa-solid ${alertMessage.type === "error" ? "fa-circle-exclamation" : "fa-circle-check"}`}
              ></i>
              {alertMessage.message}
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
                  className={`auth-input-group__input ${errors.email ? "auth-input-group__input--error" : ""}`}
                  placeholder={t("emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <i className="fa-solid fa-envelope auth-input-group__icon"></i>
              </div>
              {errors.email && (
                <div className="auth-input-group__error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label className="auth-input-group__label" htmlFor="password">
                {t("password")}
              </label>
              <div className="auth-input-group__wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`auth-input-group__input auth-input-group__input--with-toggle ${errors.password ? "auth-input-group__input--error" : ""}`}
                  placeholder={t("passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <i className="fa-solid fa-lock auth-input-group__icon"></i>
                <button
                  type="button"
                  className="auth-input-group__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                >
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
              {errors.password && (
                <div className="auth-input-group__error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="auth-options">
              <label className="auth-options__remember">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>{t("rememberMe")}</span>
              </label>
              <Link href="/forgot-password" className="auth-options__forgot">
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner auth-spinner"></i>
                  {t("logingIn")}...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i>
                  {t("login")}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">{t("orLoginWith")}</div>

          {/* Social Login */}
          <div className="auth-social">
            <GoogleLoginButton
              onSuccess={() => {
                if (user?.role === "admin") {
                  router.push("/admin");
                } else {
                  router.push("/");
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="auth-card__footer">
          {t("dontHaveAccount")}
          <Link href="/register">{t("registerNow")}</Link>
        </div>
      </div>
    </div>
  );
}
