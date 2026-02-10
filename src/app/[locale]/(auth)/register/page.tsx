"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { validateEmail, validatePassword } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import GoogleLoginButton from "@/components/common/GoogleLoginButton";
import "../Auth.scss";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { level: "", score: 0 };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = ["", "weak", "fair", "good", "strong", "strong"];
    const texts = ["", "Yếu", "Trung bình", "Khá", "Mạnh", "Rất mạnh"];

    return {
      level: levels[score],
      score,
      text: texts[score],
    };
  }, [formData.password]);

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [router, isAuthenticated]);

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
    const newErrors: typeof errors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Vui lòng đồng ý với điều khoản sử dụng";
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
      const success = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (success) {
        toast.success("Đăng ký thành công!");
        setAlertMessage({
          type: "success",
          message: "Đăng ký thành công! Đang chuyển hướng...",
        });
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setAlertMessage({ type: "error", message });
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
            <i className="fa-solid fa-book-open"></i>
            OpenDic
          </div>
          <h1 className="auth-card__title">Tạo tài khoản mới</h1>
          <p className="auth-card__subtitle">
            Đăng ký để bắt đầu hành trình học tập
          </p>
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
            {/* Full Name */}
            <div className="auth-input-group">
              <label className="auth-input-group__label" htmlFor="fullName">
                Họ và tên
              </label>
              <div className="auth-input-group__wrapper">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`auth-input-group__input ${errors.fullName ? "auth-input-group__input--error" : ""}`}
                  placeholder="Nhập họ tên đầy đủ"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
                <i className="fa-solid fa-user auth-input-group__icon"></i>
              </div>
              {errors.fullName && (
                <div className="auth-input-group__error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="auth-input-group">
              <label className="auth-input-group__label" htmlFor="email">
                Email
              </label>
              <div className="auth-input-group__wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`auth-input-group__input ${errors.email ? "auth-input-group__input--error" : ""}`}
                  placeholder="Nhập email của bạn"
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
                Mật khẩu
              </label>
              <div className="auth-input-group__wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`auth-input-group__input auth-input-group__input--with-toggle ${errors.password ? "auth-input-group__input--error" : ""}`}
                  placeholder="Tạo mật khẩu mạnh"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <i className="fa-solid fa-lock auth-input-group__icon"></i>
                <button
                  type="button"
                  className="auth-input-group__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="auth-password-strength">
                  <div className="auth-password-strength__bar">
                    <div
                      className={`auth-password-strength__fill auth-password-strength__fill--${passwordStrength.level}`}
                    ></div>
                  </div>
                  <span className="auth-password-strength__text">
                    Độ mạnh: {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-input-group">
              <label
                className="auth-input-group__label"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu
              </label>
              <div className="auth-input-group__wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`auth-input-group__input auth-input-group__input--with-toggle ${errors.confirmPassword ? "auth-input-group__input--error" : ""}`}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <i className="fa-solid fa-lock auth-input-group__icon"></i>
                <button
                  type="button"
                  className="auth-input-group__toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  <i
                    className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="auth-input-group__error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Accept Terms */}
            <div className="auth-input-group">
              <label className="auth-terms">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                <span>
                  Tôi đồng ý với <Link href="/terms">Điều khoản sử dụng</Link>{" "}
                  và <Link href="/privacy">Chính sách bảo mật</Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <div className="auth-input-group__error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errors.acceptTerms}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner auth-spinner"></i>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus"></i>
                  Đăng ký
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">hoặc đăng ký với</div>

          {/* Social Login */}
          <div className="auth-social">
            <GoogleLoginButton
              onSuccess={() => {
                router.push("/");
              }}
            />
            <button
              type="button"
              className="auth-social__btn auth-social__btn--facebook"
            >
              <i className="fa-brands fa-facebook-f"></i>
              Facebook
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-card__footer">
          Đã có tài khoản?
          <Link href="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
