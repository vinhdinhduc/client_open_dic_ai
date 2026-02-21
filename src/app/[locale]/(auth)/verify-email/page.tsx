"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import "../Auth.scss";

function VerifyEmailContent() {
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
      setMessage("Token xác thực không hợp lệ");
      setIsLoading(false);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(verificationToken);
      if (response.success) {
        setVerificationStatus("success");
        setMessage(response.message || "Xác thực email thành công!");
        toast.success("Xác thực email thành công!");

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message ||
        "Xác thực email thất bại. Token có thể đã hết hạn.";
      setVerificationStatus("error");
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!authService.isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để gửi lại email xác thực");
      router.push("/login");
      return;
    }

    setIsResending(true);
    try {
      const response = await authService.resendVerificationEmail();
      if (response.success) {
        toast.success(
          "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn!",
        );
        setMessage(
          "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn!",
        );
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message ||
        "Không thể gửi lại email. Vui lòng thử lại sau.";
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
              <div className="logo-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h1 className="logo-text">Từ điển Mở</h1>
            </div>
            <h2 className="auth-card__title">
              {verificationStatus === "verifying" && "Đang xác thực email..."}
              {verificationStatus === "success" && "Xác thực thành công!"}
              {verificationStatus === "error" && "Xác thực thất bại"}
            </h2>
            <p className="auth-card__subtitle">
              {verificationStatus === "verifying" &&
                "Vui lòng đợi trong giây lát"}
              {verificationStatus === "success" &&
                "Tài khoản của bạn đã được kích hoạt"}
              {verificationStatus === "error" &&
                "Đã xảy ra lỗi trong quá trình xác thực"}
            </p>
          </div>

          <div className="auth-card__body">
            {isLoading ? (
              <div className="verification-status">
                <div className="spinner"></div>
                <p>Đang xác thực email của bạn...</p>
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
                      Bạn sẽ được chuyển hướng về trang chủ trong giây lát...
                    </p>
                    <Link href="/" className="btn btn-primary">
                      Về trang chủ
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
                        {isResending ? "Đang gửi..." : "Gửi lại email xác thực"}
                      </button>
                      <Link href="/login" className="btn btn-secondary">
                        Đăng nhập
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="auth-card__footer">
            <p className="auth-card__footer-text">
              Cần hỗ trợ?{" "}
              <Link href="/contact" className="link">
                Liên hệ với chúng tôi
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
