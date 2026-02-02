"use client";

import { useRouter } from "next/navigation";
import { SearchBarProps } from "./types";
import { useLanguage } from "@/hooks";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSearchSuggestions } from "@/services/termService";
import { useTranslations } from "next-intl";
import { Search, X, Loader2 } from "lucide-react";
import "./SearchBar.scss";

export default function SearchBar({
  onSearch,
  placeholder,
  autoFocus = false,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const t = useTranslations("home");

  // State chính
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Tính toán ghost text - gợi ý phù hợp nhất bắt đầu bằng keyword
  const ghostSuggestion = useMemo(() => {
    if (!keyword.trim() || suggestions.length === 0) return null;

    const keywordLower = keyword.toLowerCase();

    // Tìm suggestion phù hợp nhất (startsWith, case-insensitive)
    const match = suggestions.find((s) =>
      s.toLowerCase().startsWith(keywordLower),
    );

    return match || null;
  }, [keyword, suggestions]);

  // Ghost text = phần còn lại của suggestion (chưa được gõ)
  const ghostText = useMemo(() => {
    if (!ghostSuggestion || !keyword.trim()) return "";

    // Giữ nguyên case của suggestion, chỉ lấy phần còn lại
    return ghostSuggestion.slice(keyword.length);
  }, [ghostSuggestion, keyword]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Fetch suggestions với debounce
  useEffect(() => {
    if (keyword.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await getSearchSuggestions(keyword, currentLanguage);
        setSuggestions(result);
        setShowDropdown(result.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200); // Giảm debounce để responsive hơn

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword, currentLanguage]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setSelectedIndex(-1);
  }, []);

  // Xử lý phím bấm
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Tab":
          // Autocomplete ghost text
          if (ghostSuggestion && ghostText) {
            e.preventDefault();
            setKeyword(ghostSuggestion);
            setShowDropdown(false);
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          if (showDropdown && suggestions.length > 0) {
            setSelectedIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : 0,
            );
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (showDropdown && suggestions.length > 0) {
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1,
            );
          }
          break;

        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          } else if (ghostSuggestion) {
            // Nếu có ghost suggestion, search với ghost suggestion
            handleSearch(ghostSuggestion);
          } else {
            handleSearch(keyword);
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;

        case "ArrowRight":
          // Autocomplete khi cursor ở cuối và có ghost text
          if (ghostText && inputRef.current) {
            const cursorAtEnd =
              inputRef.current.selectionStart === keyword.length;
            if (cursorAtEnd) {
              e.preventDefault();
              setKeyword(ghostSuggestion!);
            }
          }
          break;
      }
    },
    [
      ghostSuggestion,
      ghostText,
      showDropdown,
      suggestions,
      selectedIndex,
      keyword,
    ],
  );

  // Thực hiện tìm kiếm
  const handleSearch = useCallback(
    (searchTerm?: string) => {
      const term = (searchTerm || keyword).trim();
      if (!term) return;

      setShowDropdown(false);
      setIsFocused(false);

      if (onSearch) {
        onSearch(term);
      } else {
        router.push(`/terms?q=${encodeURIComponent(term)}`);
      }
    },
    [keyword, onSearch, router],
  );

  // Chọn suggestion từ dropdown
  const handleSelectSuggestion = useCallback(
    (term: string) => {
      setKeyword(term);
      setShowDropdown(false);
      router.push(`/terms?q=${encodeURIComponent(term)}`);
    },
    [router],
  );

  // Xóa input
  const handleClear = useCallback(() => {
    setKeyword("");
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Focus handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  }, [suggestions.length]);

  const handleBlur = useCallback(() => {
    // Delay để cho phép click vào dropdown
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
      }
    }, 150);
  }, []);

  return (
    <div className={`search-bar ${className}`}>
      <div
        className={`search-bar__input-wrapper ${isFocused ? "search-bar__input-wrapper--focused" : ""}`}
      >
        <div className="search-bar__ghost-layer" aria-hidden="true">
          <span className="search-bar__ghost-typed">{keyword}</span>
          <span className="search-bar__ghost-suggestion">{ghostText}</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!keyword ? placeholder || t("search.placeholder") : ""}
          className="search-bar__input search-bar__input--transparent"
          aria-label={t("search.inputLabel")}
          aria-autocomplete="both"
          aria-controls="search-dropdown"
          aria-expanded={showDropdown}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Search Button */}
        <button
          type="button"
          onClick={() => handleSearch()}
          className="search-bar__search-btn"
          aria-label={t("search.button")}
        >
          <Search size={18} />
        </button>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="search-bar__loading">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}

        {/* Clear Button */}
        {keyword && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="search-bar__clear-btn"
            aria-label={t("search.clear")}
          >
            <X size={16} />
          </button>
        )}

        {/* Tab hint - hiển thị khi có ghost text */}
        {ghostText && isFocused && (
          <div className="search-bar__tab-hint">
            <kbd>Tab</kbd> để hoàn thành
          </div>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-dropdown"
          className="search-bar__suggestion"
          role="listbox"
        >
          {suggestions.map((term, index) => (
            <div
              key={`${term}-${index}`}
              className={`search-bar__suggestion-item ${
                index === selectedIndex
                  ? "search-bar__suggestion-item--selected"
                  : ""
              }`}
              onClick={() => handleSelectSuggestion(term)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <Search size={14} className="search-bar__suggestion-icon" />
              <span className="search-bar__term-name">
                {/* Highlight phần match */}
                <span className="search-bar__term-match">
                  {term.slice(0, keyword.length)}
                </span>
                <span className="search-bar__term-rest">
                  {term.slice(keyword.length)}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown &&
        !isLoading &&
        keyword.length >= 2 &&
        suggestions.length === 0 && (
          <div ref={dropdownRef} className="search-bar__suggestion">
            <div className="search-bar__no-results">
              <Search size={16} />
              <span>{t("search.noResults")}</span>
            </div>
          </div>
        )}
    </div>
  );
}
