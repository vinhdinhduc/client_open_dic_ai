"use client";

import { useRouter } from "next/navigation";
import { SearchBarProps } from "./types";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSearchSuggestions, SearchSuggestion } from "@/services/termService";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks";
import {
  Search,
  X,
  Loader2,
  BookOpen,
  FileText,
  Tag,
  Laptop,
  Newspaper,
  Smartphone,
  Monitor,
  Keyboard,
  Mouse,
  HardDrive,
  Disc,
  Plug,
  Battery,
  Radio,
  Satellite,
  Wrench,
  Hammer,
  Settings,
  Link,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Folder,
  FolderOpen,
  Layers,
  Book,
  ZoomIn,
  Lightbulb,
  Lock,
  Key,
  KeyRound,
  Shield,
  Sword,
  Target,
  Gamepad2,
  Globe,
  Cloud,
  Zap,
  Flame,
  Droplet,
  Sprout,
  Leaf,
  Code,
  Database,
  Server,
  Wifi,
  Cpu,
  MemoryStick,
  CircuitBoard,
  Network,
  type LucideIcon,
} from "lucide-react";
import "./SearchBar.scss";

export default function SearchBar({
  onSearch,
  placeholder,
  autoFocus = false,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const t = useTranslations("home");
  const { currentLanguage } = useLanguage();

  // State chính
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const getTermText = (s: SearchSuggestion): string => {
    if (!s?.term) return "";
    const val =
      s.term[currentLanguage as keyof typeof s.term] ||
      s.term.vi ||
      s.term.en ||
      s.term.lo ||
      "";
    return typeof val === "string" ? val : String(val);
  };

  const getCategoryName = (s: SearchSuggestion): string => {
    if (!s.category?.name) return "";
    return (
      s.category.name[currentLanguage as keyof typeof s.category.name] ||
      s.category.name.vi ||
      ""
    );
  };

  const CATEGORY_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
    "#14b8a6",
    "#6366f1",
  ];

  const ICON_MAP: Record<string, LucideIcon> = {
    laptop: Laptop,
    smartphone: Smartphone,
    monitor: Monitor,
    keyboard: Keyboard,
    mouse: Mouse,
    "hard-drive": HardDrive,
    disc: Disc,
    plug: Plug,
    battery: Battery,
    radio: Radio,
    satellite: Satellite,
    wrench: Wrench,
    hammer: Hammer,
    settings: Settings,
    link: Link,
    "bar-chart": BarChart3,
    "trending-up": TrendingUp,
    "trending-down": TrendingDown,
    clipboard: ClipboardList,
    folder: Folder,
    "folder-open": FolderOpen,
    layers: Layers,
    newspaper: Newspaper,
    "book-open": BookOpen,
    book: Book,
    search: Search,
    "zoom-in": ZoomIn,
    lightbulb: Lightbulb,
    lock: Lock,
    key: Key,
    "key-round": KeyRound,
    shield: Shield,
    sword: Sword,
    target: Target,
    gamepad: Gamepad2,
    globe: Globe,
    cloud: Cloud,
    zap: Zap,
    flame: Flame,
    droplet: Droplet,
    sprout: Sprout,
    leaf: Leaf,
    code: Code,
    database: Database,
    server: Server,
    wifi: Wifi,
    cpu: Cpu,
    memory: MemoryStick,
    circuit: CircuitBoard,
    network: Network,
  };

  const getCategoryColor = (s: SearchSuggestion): string => {
    if (!s.category?._id) return "#6b7280";
    let hash = 0;
    for (let i = 0; i < s.category._id.length; i++) {
      hash = s.category._id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
  };

  const getCategoryIcon = (s: SearchSuggestion): LucideIcon | null => {
    if (!s.category?.icon) return null;
    return ICON_MAP[s.category.icon] ?? null;
  };

  const getMatchIcon = (s: SearchSuggestion): LucideIcon => {
    if (s.matchedField?.startsWith("term")) return BookOpen;
    if (s.matchedField?.startsWith("definition")) return FileText;
    if (s.matchedField === "tags") return Tag;
    return Search;
  };

  // Tính toán ghost text
  const ghostSuggestion = useMemo(() => {
    if (!keyword.trim() || suggestions.length === 0) return null;
    const keywordLower = keyword.toLowerCase();
    const match = suggestions.find((s) => {
      const text = getTermText(s);
      if (typeof text !== "string") return false;
      return text.toLowerCase().startsWith(keywordLower);
    });
    return match ? getTermText(match) : null;
  }, [keyword, suggestions, currentLanguage]);

  const ghostText = useMemo(() => {
    if (!ghostSuggestion || !keyword.trim()) return "";
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
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword]);

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
            // Click vào gợi ý → chuyển đến trang chi tiết thuật ngữ
            const selected = suggestions[selectedIndex];
            router.push(`/terms/${selected._id}`);
          } else if (keyword.trim()) {
            // Nhấn Enter → chuyển đến trang kết quả tìm kiếm
            handleSearch(keyword);
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
        case "Space":
          //Nếu space thì phần gost thêm dấu cách
          if (ghostSuggestion && ghostText) {
            e.preventDefault();
            setKeyword(ghostSuggestion + " ");
            setShowDropdown(false);
          }

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

  // Chọn suggestion từ dropdown → chuyển đến trang chi tiết
  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setKeyword(getTermText(suggestion));
      setShowDropdown(false);
      router.push(`/terms/${suggestion._id}`);
    },
    [router, currentLanguage],
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
            <kbd>Tab</kbd> {t("search.complete")}
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
          {suggestions.map((suggestion, index) => {
            const termText = getTermText(suggestion);
            const categoryName = getCategoryName(suggestion);
            return (
              <div
                key={suggestion._id}
                className={`search-bar__suggestion-item ${
                  index === selectedIndex
                    ? "search-bar__suggestion-item--selected"
                    : ""
                }`}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {(() => {
                  const CatIcon = getCategoryIcon(suggestion);
                  const FallbackIcon = getMatchIcon(suggestion);
                  const IconToRender = CatIcon ?? FallbackIcon;
                  return (
                    <IconToRender
                      size={15}
                      className="search-bar__suggestion-icon"
                    />
                  );
                })()}
                <span className="search-bar__term-name">
                  {(() => {
                    const idx = termText
                      .toLowerCase()
                      .indexOf(keyword.toLowerCase());
                    if (idx === -1)
                      return (
                        <span className="search-bar__term-rest">
                          {termText}
                        </span>
                      );
                    const beforeMatch = termText.slice(0, idx);
                    const matchText = termText.slice(idx, idx + keyword.length);
                    const afterMatch = termText.slice(idx + keyword.length);
                    return (
                      <>
                        {beforeMatch && (
                          <span className="search-bar__term-rest">
                            {beforeMatch}
                          </span>
                        )}
                        <span className="search-bar__term-match">
                          {matchText}
                        </span>
                        {afterMatch && (
                          <span className="search-bar__term-rest">
                            {afterMatch}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </span>
                {categoryName && (
                  <span
                    className="search-bar__category-badge"
                    style={{
                      backgroundColor: `${getCategoryColor(suggestion)}18`,
                      color: getCategoryColor(suggestion),
                      borderColor: `${getCategoryColor(suggestion)}30`,
                    }}
                  >
                    {categoryName}
                  </span>
                )}
              </div>
            );
          })}
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
