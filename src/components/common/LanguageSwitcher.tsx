'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    // Use router.replace to change locale while keeping the same path
    router.replace(pathname, { locale: langCode });
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <Globe className="icon" />
        <span className="current-lang">{currentLanguage?.flag}</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${locale === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="flag">{lang.flag}</span>
              <span className="name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}