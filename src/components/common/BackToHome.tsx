"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import "./BackToHome.scss";

export default function BackToHome() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  // Trang chủ — ẩn nút
  const hideOnRoutes = ["/", "/vi", "/en", "/lo"];
  const isHomePage = hideOnRoutes.some(
    (route) => pathname === route || pathname === `${route}/`,
  );

  // Không hiển thị trên trang chủ hoặc trang admin/moderator
  if (
    isHomePage ||
    pathname.includes("/admin") ||
    pathname.includes("/moderator")
  ) {
    return null;
  }

  const handleClick = () => {
    router.push("/");
  };

  return (
    <button
      className="back-to-home-inline"
      onClick={handleClick}
      title={t("common.backToHome")}
    >
      <Home size={16} />
      <span className="back-to-home-inline__text">{t("common.home")}</span>
    </button>
  );
}
