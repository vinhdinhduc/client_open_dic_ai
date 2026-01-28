"use client";

import { useState, useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return {
    theme: resolvedTheme as "light" | "dark",
    toggleTheme,
    mounted,
  };
}
