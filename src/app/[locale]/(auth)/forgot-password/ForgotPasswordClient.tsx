"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { authService, validateEmail } from "@/services/authService";
import "../Auth.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setEmailSent(true);
        toast.success("Email đặt lại mật khẩu đã được gửi!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message || "Không thể gửi email. Vui lòng thử lại.";
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
            <i className="fa-solid fa-book-open"></i>
            OpenDic
          </div>
          <h1 className="auth-card__title">Quên mật khẩu</h1>
          <p className="auth-card__subtitle">
            Nhập email để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        {/* Body */}
        <div className="auth-card__body">
          {emailSent ? (
            <div className="auth-success-message">
              <div className="auth-success-message__icon">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h3>Email đã được gửi!</h3>
              <p>
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{" "}
                <strong>{email}</strong>. Vui lòng kiểm tra hộp thư (kể cả thư
                rác).
              </p>
              <p className="auth-success-message__note">
                Liên kết có hiệu lực trong 30 phút.
              </p>
              <button
                className="auth-submit auth-submit--secondary"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                <i className="fa-solid fa-rotate-left"></i>
                Gửi lại email
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
                    Email
                  </label>
                  <div className="auth-input-group__wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`auth-input-group__input ${error ? "auth-input-group__input--error" : ""}`}
                      placeholder="Nhập email đã đăng ký"
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
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Gửi liên kết đặt lại
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="auth-card__footer">
          Đã nhớ mật khẩu?
          <Link href="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
