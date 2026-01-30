"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

type Language = "vi" | "en" | "lo";
const SUPPORTED_LANGUAGES: Language[] = ["vi", "en", "lo"];

export function useLanguage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(locale as Language);

  useEffect(() => {
    setCurrentLanguage(locale as Language);
  }, [locale]);

  const changeLanguage = (lang: Language) => {
    if (lang === currentLanguage) return;
    localStorage.setItem("language", lang);


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