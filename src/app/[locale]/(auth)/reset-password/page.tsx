"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import "../Auth.scss";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [resetSuccess, setResetSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setAlertMessage("");
  };

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu mới";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      setAlertMessage(
        "Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.",
      );
      return;
    }

    setIsLoading(true);
    setAlertMessage("");

    try {
      const response = await authService.resetPassword(
        token,
        formData.password,
      );
      if (response.success) {
        setResetSuccess(true);
        toast.success("Đặt lại mật khẩu thành công!");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.";
      setAlertMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-page__particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="auth-card">
          <div className="auth-card__header">
            <div className="auth-card__logo">
              <i className="fa-solid fa-book-open"></i>
              OpenDic
            </div>
            <h1 className="auth-card__title">Liên kết không hợp lệ</h1>
          </div>
          <div className="auth-card__body">
            <div className="auth-alert auth-alert--error">
              <i className="fa-solid fa-circle-exclamation"></i>
              Token đặt lại mật khẩu không tồn tại hoặc đã hết hạn.
            </div>
            <Link
              href="/forgot-password"
              className="auth-submit"
              style={{
                textAlign: "center",
                display: "block",
                textDecoration: "none",
              }}
            >
              <i className="fa-solid fa-rotate-left"></i>
              Yêu cầu đặt lại mật khẩu mới
            </Link>
          </div>
          <div className="auth-card__footer">
            <Link href="/login">Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="auth-card__title">Đặt lại mật khẩu</h1>
          <p className="auth-card__subtitle">Nhập mật khẩu mới cho tài khoản</p>
        </div>

        {/* Body */}
        <div className="auth-card__body">
          {resetSuccess ? (
            <div className="auth-success-message">
              <div className="auth-success-message__icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3>Đặt lại mật khẩu thành công!</h3>
              <p>
                Mật khẩu đã được cập nhật. Bạn sẽ được chuyển đến trang đăng
                nhập trong giây lát...
              </p>
              <Link
                href="/login"
                className="auth-submit"
                style={{
                  textAlign: "center",
                  display: "block",
                  textDecoration: "none",
                }}
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              {/* Alert Message */}
              {alertMessage && (
                <div className="auth-alert auth-alert--error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {alertMessage}
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="auth-input-group">
                  <label className="auth-input-group__label" htmlFor="password">
                    Mật khẩu mới
                  </label>
                  <div className="auth-input-group__wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className={`auth-input-group__input auth-input-group__input--with-toggle ${errors.password ? "auth-input-group__input--error" : ""}`}
                      placeholder="Nhập mật khẩu mới"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <i className="fa-solid fa-lock auth-input-group__icon"></i>
                    <button
                      type="button"
                      className="auth-input-group__toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
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
                      placeholder="Nhập lại mật khẩu mới"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <i className="fa-solid fa-lock auth-input-group__icon"></i>
                    <button
                      type="button"
                      className="auth-input-group__toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner auth-spinner"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-key"></i>
                      Đặt lại mật khẩu
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="auth-card__footer">
          <Link href="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-card__body">
              <p style={{ textAlign: "center" }}>Đang tải...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
