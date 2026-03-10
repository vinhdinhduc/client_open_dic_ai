"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import {
  Heart,
  Search,
  Trash2,
  X,
  Loader2,
  Eye,
  BookOpen,
  Tag,
  ExternalLink,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import { Layout } from "@/components/layouts";
import {
  getFavorites,
  removeFavorite,
  FavoriteItem,
} from "@/services/favoriteService";
import "./page.scss";

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentLanguage } = useLanguage();
  const router = useRouter();
  const t = useTranslations("favorites");
  const tCommon = useTranslations("common");

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const lang = currentLanguage as "vi" | "en" | "lo";

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFavorites(currentPage, 20);
      if (response.success) {
        setFavorites(response.data.favorites || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, authLoading, router, fetchFavorites]);

  const handleRemove = async (termId: string) => {
    try {
      setActionLoading(termId);
      const response = await removeFavorite(termId);
      if (response.success) {
        setFavorites((prev) => prev.filter((item) => item.term._id !== termId));
        setTotalItems((prev) => prev - 1);
        toast.success(t("removed"));
      }
    } catch (error) {
      toast.error(t("removeError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewTerm = (termId: string) => {
    router.push(`/terms/${termId}`);
  };

  const getTermName = (term: FavoriteItem["term"]) => {
    return term.term?.[lang] || term.term?.vi || term.term?.en || "—";
  };

  const getDefinition = (term: FavoriteItem["term"]) => {
    return (
      term.definition?.[lang] ||
      term.definition?.vi ||
      term.definition?.en ||
      ""
    );
  };

  const getCategoryName = (term: FavoriteItem["term"]) => {
    if (!term.category) return null;
    return (
      term.category.name?.[lang] ||
      term.category.name?.vi ||
      term.category.name?.en ||
      ""
    );
  };

  const filteredFavorites = searchFilter
    ? favorites.filter((item) => {
        const name = getTermName(item.term).toLowerCase();
        const def = getDefinition(item.term).toLowerCase();
        const q = searchFilter.toLowerCase();
        return name.includes(q) || def.includes(q);
      })
    : favorites;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      currentLanguage === "vi"
        ? "vi-VN"
        : currentLanguage === "lo"
          ? "lo-LA"
          : "en-US",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="favorites-page">
          <div className="favorites-page__loading">
            <Loader2 className="spin" size={32} />
            <p>{t("loading")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="favorites-page">
        {/* Header */}
        <div className="favorites-page__header">
          <div className="header-left">
            <div className="header-icon">
              <Heart size={24} />
            </div>
            <div>
              <h1>{t("title")}</h1>
              <p>
                {totalItems} {t("terms")}
              </p>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        {favorites.length > 0 && (
          <div className="favorites-page__search">
            <Search size={18} />
            <input
              type="text"
              placeholder={t("filterPlaceholder")}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            {searchFilter && (
              <button onClick={() => setSearchFilter("")}>
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Favorites Grid */}
        {loading ? (
          <div className="favorites-page__loading">
            <Loader2 className="spin" size={32} />
            <p>{t("loadingList")}</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="favorites-page__empty">
            <Heart size={48} />
            <h3>{searchFilter ? t("noResults") : t("noFavorites")}</h3>
            <p>{searchFilter ? t("noResultsText") : t("noFavoritesText")}</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {filteredFavorites.map((item) => (
              <div key={item._id} className="favorite-card">
                <div className="favorite-card__header">
                  <button
                    className="favorite-card__title"
                    onClick={() => handleViewTerm(item.term._id)}
                  >
                    <BookOpen size={16} />
                    <span>{getTermName(item.term)}</span>
                    <ExternalLink size={12} className="link-icon" />
                  </button>
                  <button
                    className="favorite-card__remove"
                    onClick={() => handleRemove(item.term._id)}
                    disabled={actionLoading === item.term._id}
                    title={t("remove")}
                  >
                    {actionLoading === item.term._id ? (
                      <Loader2 size={14} className="spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>

                <p className="favorite-card__definition">
                  {getDefinition(item.term)}
                </p>

                <div className="favorite-card__meta">
                  {getCategoryName(item.term) && (
                    <span className="meta-tag">
                      <Tag size={11} />
                      {getCategoryName(item.term)}
                    </span>
                  )}
                  {item.term.viewCount != null && (
                    <span className="meta-item">
                      <Eye size={11} />
                      {item.term.viewCount}
                    </span>
                  )}
                  <span className="meta-item meta-date">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {item.note && (
                  <div className="favorite-card__note">
                    <span>{t("note")}</span> {item.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Layout>
  );
}
