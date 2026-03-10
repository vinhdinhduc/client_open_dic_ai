"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-hot-toast";
import {
  History,
  Search,
  Trash2,
  X,
  Loader2,
  Clock,
  Hash,
  AlertTriangle,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import { Layout } from "@/components/layouts";
import {
  getSearchHistory,
  deleteSearchHistoryItem,
  clearAllSearchHistory,
  SearchHistoryItem,
} from "@/services/searchHistoryService";
import "./page.scss";

export default function SearchHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations("searchHistory");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSearchHistory(currentPage, 20);
      if (response.success) {
        setHistory(response.data.history || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
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
      fetchHistory();
    }
  }, [isAuthenticated, authLoading, router, fetchHistory]);

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await deleteSearchHistoryItem(id);
      if (response.success) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
        setTotalItems((prev) => prev - 1);
        toast.success(t("deleted"));
      }
    } catch (error) {
      toast.error(t("deleteError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAll = async () => {
    try {
      setClearLoading(true);
      const response = await clearAllSearchHistory();
      if (response.success) {
        setHistory([]);
        setTotalItems(0);
        setTotalPages(1);
        setCurrentPage(1);
        setShowClearConfirm(false);
        toast.success(t("clearSuccess"));
      }
    } catch (error) {
      toast.error(t("clearError"));
    } finally {
      setClearLoading(false);
    }
  };

  const handleSearchClick = (query: string) => {
    router.push(`/terms?q=${encodeURIComponent(query)}`);
  };

  const filteredHistory = searchFilter
    ? history.filter((item) =>
        item.query.toLowerCase().includes(searchFilter.toLowerCase()),
      )
    : history;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return t("minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("daysAgo", { count: diffDays });
    return date.toLocaleDateString(locale);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="history-page">
          <div className="history-page__loading">
            <Loader2 className="spin" size={32} />
            <p>{t("loading")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="history-page">
        {/* Header */}
        <div className="history-page__header">
          <div className="header-left">
            <div className="header-icon">
              <History size={24} />
            </div>
            <div>
              <h1>{t("title")}</h1>
              <p>
                {totalItems} {t("searches")}
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              className="btn-clear-all"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 size={16} />
              {t("clearAll")}
            </button>
          )}
        </div>

        {/* Search Filter */}
        {history.length > 0 && (
          <div className="history-page__search">
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

        {/* History List */}
        {loading ? (
          <div className="history-page__loading">
            <Loader2 className="spin" size={32} />
            <p>{t("loadingHistory")}</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="history-page__empty">
            <History size={48} />
            <h3>{searchFilter ? t("noResults") : t("noHistory")}</h3>
            <p>{searchFilter ? t("noResultsText") : t("noHistoryText")}</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((item) => (
              <div key={item._id} className="history-item">
                <button
                  className="history-item__content"
                  onClick={() => handleSearchClick(item.query)}
                >
                  <div className="history-item__icon">
                    <Clock size={16} />
                  </div>
                  <div className="history-item__info">
                    <span className="history-item__query">{item.query}</span>
                    <div className="history-item__meta">
                      <span className="history-item__results">
                        <Hash size={12} />
                        {item.resultCount} {t("results")}
                      </span>
                      <span className="history-item__date">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  className="history-item__delete"
                  onClick={() => handleDelete(item._id)}
                  disabled={actionLoading === item._id}
                  title={tCommon("delete")}
                >
                  {actionLoading === item._id ? (
                    <Loader2 size={14} className="spin" />
                  ) : (
                    <X size={14} />
                  )}
                </button>
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

        {/* Clear All Confirm Modal */}
        {showClearConfirm && (
          <div
            className="modal-overlay"
            onClick={() => setShowClearConfirm(false)}
          >
            <div
              className="confirm-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="confirm-dialog__icon">
                <AlertTriangle size={40} />
              </div>
              <h3>{t("clearAllConfirm")}</h3>
              <p>{t("clearAllConfirmText", { count: totalItems })}</p>
              <div className="confirm-dialog__actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowClearConfirm(false)}
                >
                  {tCommon("cancel")}
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={handleClearAll}
                  disabled={clearLoading}
                >
                  {clearLoading ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      {t("clearing")}
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      {t("clearAll")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
