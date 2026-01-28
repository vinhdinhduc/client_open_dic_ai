
import { getRequestConfig } from 'next-intl/server';

// Danh sách ngôn ngữ được hỗ trợ
export const locales = ['vi', 'en', 'lo'] as const;

// Ngôn ngữ mặc định
export const defaultLocale = 'vi';

// Type cho locale
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // Fallback to defaultLocale if locale is undefined
  const safeLocale = locale && locales.includes(locale as Locale) ? locale : defaultLocale;
  
  return {
    locale: safeLocale as string,
    messages: (await import(`@/messages/${safeLocale}.json`)).default
  };
});