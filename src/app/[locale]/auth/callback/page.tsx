"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tokenUtils } from "@/services/authService";
import { toast } from "react-hot-toast";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Lấy tokens từ URL query parameters
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const error = searchParams.get("error");

        if (error) {
          console.error("OAuth error:", error);
          toast.error("Đăng nhập Google thất bại");
          router.push(`/login?error=${error}`);
          return;
        }

        if (!accessToken) {
          console.error("No access token received");
          toast.error("Không nhận được token xác thực");
          router.push("/login?error=no_token");
          return;
        }

        // Lưu tokens vào localStorage
        tokenUtils.setToken(accessToken);
        if (refreshToken) {
          tokenUtils.setRefreshToken(refreshToken);
        }

        // Lấy thông tin user từ API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            tokenUtils.setUser(data.data);
            toast.success("Đăng nhập Google thành công!");

            // Redirect về trang chủ với reload để cập nhật AuthContext
            window.location.href = "/";
            return;
          }
        }

        // Nếu không lấy được user info, vẫn redirect về trang chủ
        toast.success("Đăng nhập thành công!");
        window.location.href = "/";
      } catch (error) {
        console.error("Callback error:", error);
        toast.error("Có lỗi xảy ra trong quá trình xác thực");
        router.push("/login?error=callback_failed");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div className="spinner"></div>
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <p>Loading...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
