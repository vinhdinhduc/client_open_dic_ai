"use client";

import React from "react";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export default function GoogleLoginButton({
  className,
}: GoogleLoginButtonProps) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  const handleGoogleLogin = () => {
    // Chuyển hướng tới endpoint OAuth của Passport.js ở backend
    window.location.href = `${API_URL}/auth/google/passport`;
  };

  return (
    <button
      type="button"
      className={`auth-social__btn auth-social__btn--google ${className || ""}`}
      onClick={handleGoogleLogin}
    >
      <i className="fa-brands fa-google"></i>
      Google
    </button>
  );
}
