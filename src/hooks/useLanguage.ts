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
    // Already synced in this browser session — skip to avoid redirect loop
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const storedLanguage = localStorage.getItem("language") as Language | null;

    // Mark as synced immediately before any navigation
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
  }, []); // Run once on mount only

  useEffect(() => {
    setCurrentLanguage(locale as Language);
    if (SUPPORTED_LANGUAGES.includes(locale as Language)) {
      localStorage.setItem("language", locale);
    }
  }, [locale]);

  const changeLanguage = (lang: Language) => {
    if (lang === currentLanguage) return;
    localStorage.setItem("language", lang);
    // Allow re-sync on next hard navigation if needed
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