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
    // Redirect to backend Passport.js OAuth endpoint
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
