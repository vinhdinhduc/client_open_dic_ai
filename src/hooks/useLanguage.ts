"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/navigation"; // ← Thêm useRouter
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation"; // ← Thêm để giữ query params

type Language = "vi" | "en" | "lo";
const SUPPORTED_LANGUAGES: Language[] = ["vi", "en", "lo"];

export function useLanguage() {
  const pathname = usePathname();
  const router = useRouter(); // ← Thêm router
  const searchParams = useSearchParams(); // ← Lấy query params
  const locale = useLocale();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(locale as Language);

  useEffect(() => {
    setCurrentLanguage(locale as Language);
  }, [locale]);

  const changeLanguage = (lang: Language) => {
    console.log("Current language:", currentLanguage);
    console.log("Changing to:", lang);
    console.log("Current pathname:", pathname);
    
    if (lang === currentLanguage) return;
    localStorage.setItem("language", lang);

    const newUrl = `/${lang}${pathname === "/" ? "" : pathname}`;
    console.log("Navigating to:", newUrl);
    window.location.href = newUrl;
  };

  return {
    currentLanguage,
    changeLanguage,
  };
}