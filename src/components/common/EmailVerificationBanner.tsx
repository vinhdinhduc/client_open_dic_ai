"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";
import "./EmailVerificationBanner.scss";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Chỉ hiển thị banner khi đã đăng nhập, email chưa xác thực và chưa tắt banner
  if (!user || (user as any).emailVerified || isDismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const response = await authService.resendVerificationEmail();
      if (response.success) {
        toast.success(
          "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư!",
        );
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        "Không thể gửi email. Vui lòng thử lại sau.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="email-verification-banner">
      <div className="email-verification-banner__content">
        <div className="email-verification-banner__icon">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div className="email-verification-banner__text">
          <strong>Email chưa được xác thực</strong>
          <span>
            Vui lòng xác thực email để có thể sử dụng đầy đủ các tính năng. Kiểm
            tra hộp thư (bao gồm cả thư mục spam).
          </span>
        </div>
        <button
          onClick={handleResendEmail}
          className="email-verification-banner__button"
          disabled={isResending}
        >
          {isResending ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Đang gửi...
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane"></i> Gửi lại email
            </>
          )}
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="email-verification-banner__close"
          aria-label="Đóng"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}
