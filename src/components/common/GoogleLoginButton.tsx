"use client";

import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export default function GoogleLoginButton({
  onSuccess,
  className,
}: GoogleLoginButtonProps) {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Get user info from Google using the access token
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        if (!userInfoResponse.ok) {
          throw new Error("Không thể lấy thông tin từ Google");
        }

        const userInfo = await userInfoResponse.json();

        const success = await googleLogin({
          googleId: userInfo.sub,
          email: userInfo.email,
          fullName: userInfo.name,
          avatar: userInfo.picture,
        });

        if (success) {
          toast.success("Đăng nhập Google thành công!");
          onSuccess?.();
        }
      } catch (error) {
        console.error("Google login error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại");
    },
  });

  return (
    <button
      type="button"
      className={`auth-social__btn auth-social__btn--google ${className || ""}`}
      onClick={() => handleGoogleLogin()}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <i className="fa-solid fa-spinner fa-spin"></i>
          Đang xử lý...
        </>
      ) : (
        <>
          <i className="fa-brands fa-google"></i>
          Google
        </>
      )}
    </button>
  );
}
