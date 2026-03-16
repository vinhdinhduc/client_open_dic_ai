"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  BookOpen,
  Users,
  FolderTree,
  GitPullRequest,
  Loader2,
} from "lucide-react";
import { getSearchSuggestions } from "@/services/termService";
import { getUsers } from "@/services/userService";
import { contributionService } from "@/services/contributionService";
import type { Contribution } from "@/services/contributionService";
import categoryService from "@/services/categoryService";
import "./AdminGlobalSearch.scss";

type RoleType = "admin" | "moderator";
type LangKey = "vi" | "en" | "lo";

type SearchItem = {
  id: string;
  label: string;
  description?: string;
  href: string;
};

interface AdminGlobalSearchProps {
  role: RoleType;
  basePath: "/admin" | "/moderator";
  language: LangKey;
  placeholder: string;
}

const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getLocalizedText = (
  value: string | { vi?: string; en?: string; lo?: string } | undefined,
  language: LangKey,
): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.vi || value.en || value.lo || "";
};

const AdminGlobalSearch: React.FC<AdminGlobalSearchProps> = ({
  role,
  basePath,
  language,
  placeholder,
}) => {
  const t = useTranslations("adminLayout");
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [termResults, setTermResults] = useState<SearchItem[]>([]);
  const [userResults, setUserResults] = useState<SearchItem[]>([]);
  const [categoryResults, setCategoryResults] = useState<SearchItem[]>([]);
  const [contributionResults, setContributionResults] = useState<SearchItem[]>(
    [],
  );
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [keyword]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories(true, language);
        if (!response.success || !response.data) {
          setCategories([]);
          return;
        }

        const mapped = response.data.map((item) => ({
          id: item.id || item._id || "",
          name: getLocalizedText(item.name, language),
        }));
        setCategories(mapped.filter((item) => item.id && item.name));
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, [language]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      if (debouncedKeyword.length < 2) {
        setLoading(false);
        setTermResults([]);
        setUserResults([]);
        setCategoryResults([]);
        setContributionResults([]);
        return;
      }

      setLoading(true);
      const query = normalizeText(debouncedKeyword);

      const termPromise = getSearchSuggestions(debouncedKeyword, language);
      const userPromise =
        role === "admin"
          ? getUsers({ page: 1, limit: 6, search: debouncedKeyword })
          : null;
      const contributionPromise = contributionService.getContributions({
        page: 1,
        limit: 30,
      });

      const [termsResp, usersResp, contributionsResp] =
        await Promise.allSettled([
          termPromise,
          userPromise,
          contributionPromise,
        ]);

      if (cancelled) return;

      if (termsResp.status === "fulfilled") {
        const mapped = termsResp.value.slice(0, 6).map((item) => {
          const label = getLocalizedText(item.term, language);
          return {
            id: item._id,
            label,
            description: item.category
              ? getLocalizedText(item.category.name, language)
              : undefined,
            href:
              role === "admin"
                ? `${basePath}/terms/${item._id}`
                : `${basePath}/terms?search=${encodeURIComponent(label)}`,
          };
        });
        setTermResults(mapped.filter((item) => item.label));
      } else {
        setTermResults([]);
      }

      if (usersResp && usersResp.status === "fulfilled") {
        const users = usersResp.value?.data?.items || [];
        setUserResults(
          users.slice(0, 6).map((item) => ({
            id: item._id,
            label: item.fullName,
            description: item.email,
            href: `${basePath}/users?search=${encodeURIComponent(item.fullName)}`,
          })),
        );
      } else {
        setUserResults([]);
      }

      const filteredCategories = categories
        .filter((item) => normalizeText(item.name).includes(query))
        .slice(0, 6)
        .map((item) => ({
          id: item.id,
          label: item.name,
          href: `${basePath}/categories?search=${encodeURIComponent(item.name)}`,
        }));
      setCategoryResults(filteredCategories);

      if (contributionsResp.status === "fulfilled") {
        const contributions =
          contributionsResp.value?.data?.contributions || [];
        const matched = contributions
          .filter((item: Contribution) => {
            const termText = getLocalizedText(item.term, language);
            const definitionText = getLocalizedText(item.definition, language);
            const authorText = item.contributor?.fullName || "";
            return [termText, definitionText, authorText]
              .filter(Boolean)
              .some((text) => normalizeText(text).includes(query));
          })
          .slice(0, 6)
          .map((item: Contribution) => {
            const termText = getLocalizedText(item.term, language);
            return {
              id: item._id,
              label: termText || t("searchContributionsFallback"),
              description: item.contributor?.fullName,
              href: `${basePath}/moderation/contributions?search=${encodeURIComponent(termText || debouncedKeyword)}`,
            };
          });
        setContributionResults(matched);
      } else {
        setContributionResults([]);
      }

      setLoading(false);
    };

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [basePath, categories, debouncedKeyword, language, role, t]);

  const hasResults = useMemo(
    () =>
      termResults.length > 0 ||
      userResults.length > 0 ||
      categoryResults.length > 0 ||
      contributionResults.length > 0,
    [termResults, userResults, categoryResults, contributionResults],
  );

  const handleNavigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="admin-header__search admin-global-search" ref={rootRef}>
      <Search size={18} />
      <input
        type="text"
        value={keyword}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setKeyword(e.target.value);
          if (!open) setOpen(true);
        }}
      />

      {open && (
        <div className="admin-global-search__dropdown">
          {debouncedKeyword.length < 2 ? (
            <div className="admin-global-search__hint">
              {t("searchMinChars")}
            </div>
          ) : loading ? (
            <div className="admin-global-search__loading">
              <Loader2 size={16} className="spin" />
              <span>{t("searchLoading")}</span>
            </div>
          ) : !hasResults ? (
            <div className="admin-global-search__empty">
              {t("searchNoResults")}
            </div>
          ) : (
            <>
              {termResults.length > 0 && (
                <div className="admin-global-search__group">
                  <div className="admin-global-search__group-title">
                    <BookOpen size={14} />
                    <span>{t("searchTerms")}</span>
                  </div>
                  {termResults.map((item) => (
                    <button
                      type="button"
                      key={`term-${item.id}`}
                      className="admin-global-search__item"
                      onClick={() => handleNavigate(item.href)}
                    >
                      <span className="admin-global-search__item-label">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="admin-global-search__item-meta">
                          {item.description}
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="admin-global-search__view-all"
                    onClick={() =>
                      handleNavigate(
                        `${basePath}/terms?search=${encodeURIComponent(debouncedKeyword)}`,
                      )
                    }
                  >
                    {t("searchViewAll")}
                  </button>
                </div>
              )}

              {role === "admin" && userResults.length > 0 && (
                <div className="admin-global-search__group">
                  <div className="admin-global-search__group-title">
                    <Users size={14} />
                    <span>{t("searchUsers")}</span>
                  </div>
                  {userResults.map((item) => (
                    <button
                      type="button"
                      key={`user-${item.id}`}
                      className="admin-global-search__item"
                      onClick={() => handleNavigate(item.href)}
                    >
                      <span className="admin-global-search__item-label">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="admin-global-search__item-meta">
                          {item.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {categoryResults.length > 0 && (
                <div className="admin-global-search__group">
                  <div className="admin-global-search__group-title">
                    <FolderTree size={14} />
                    <span>{t("searchCategories")}</span>
                  </div>
                  {categoryResults.map((item) => (
                    <button
                      type="button"
                      key={`category-${item.id}`}
                      className="admin-global-search__item"
                      onClick={() => handleNavigate(item.href)}
                    >
                      <span className="admin-global-search__item-label">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {contributionResults.length > 0 && (
                <div className="admin-global-search__group">
                  <div className="admin-global-search__group-title">
                    <GitPullRequest size={14} />
                    <span>{t("searchContributions")}</span>
                  </div>
                  {contributionResults.map((item) => (
                    <button
                      type="button"
                      key={`contribution-${item.id}`}
                      className="admin-global-search__item"
                      onClick={() => handleNavigate(item.href)}
                    >
                      <span className="admin-global-search__item-label">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="admin-global-search__item-meta">
                          {item.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGlobalSearch;
