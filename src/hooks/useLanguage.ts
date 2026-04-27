"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

type Language = "vi" | "en" | "lo";
const SUPPORTED_LANGUAGES: Language[] = ["vi", "en", "lo"];
const SESSION_KEY = "lang_synced";

export function useLanguage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(locale as Language);

  useEffect(() => {
    // Đã đồng bộ trong phiên trình duyệt này, bỏ qua để tránh vòng lặp chuyển hướng
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const storedLanguage = localStorage.getItem("language") as Language | null;

    // Đánh dấu đã đồng bộ ngay trước khi điều hướng
    sessionStorage.setItem(SESSION_KEY, "1");

    if (!storedLanguage || !SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      localStorage.setItem("language", locale);
      return;
    }

    if (storedLanguage !== locale) {
      const queryString = searchParams.toString();
      const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(fullPath, { locale: storedLanguage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  useEffect(() => {
    setCurrentLanguage(locale as Language);
    if (SUPPORTED_LANGUAGES.includes(locale as Language)) {
      localStorage.setItem("language", locale);
    }
  }, [locale]);

  const changeLanguage = (lang: Language) => {
    if (lang === currentLanguage) return;
    localStorage.setItem("language", lang);
    // Cho phép đồng bộ lại ở lần điều hướng cứng tiếp theo nếu cần
    sessionStorage.removeItem(SESSION_KEY);

    const queryString = searchParams.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(fullPath, { locale: lang });
  };

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}