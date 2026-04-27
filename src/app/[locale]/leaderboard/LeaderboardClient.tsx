"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks";
import Link from "next/link";
import {
  Trophy,
  Heart,
  Eye,
  User,
  Star,
  TrendingUp,
  Medal,
  Crown,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import leaderboardService, {
  LeaderboardTerm,
  LeaderboardUser,
  LeaderboardPeriod,
  TermLeaderboardType,
  UserLeaderboardType,
  Pagination,
} from "@/services/leaderboardService";
import "./Leaderboard.scss";

type MainTab = "terms" | "users" | "reputation";

const PAGE_SIZE = 10;

function PaginationControls({
  pagination,
  currentPage,
  onPage,
  infoLabel,
  prevLabel,
  nextLabel,
}: {
  pagination: Pagination;
  currentPage: number;
  onPage: (page: number) => void;
  infoLabel: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const { pages, total, page } = pagination;
  if (pages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums: (number | "...")[] = [1];
    if (page > 3) nums.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(pages - 1, page + 1);
      i++
    ) {
      nums.push(i);
    }
    if (page < pages - 2) nums.push("...");
    nums.push(pages);
    return nums;
  };

  return (
    <div className="leaderboard-pagination">
      <span className="leaderboard-pagination__info">
        {infoLabel
          .replace("{page}", String(page))
          .replace("{pages}", String(pages))
          .replace("{total}", String(total))}
      </span>
      <div className="leaderboard-pagination__controls">
        <button
          className="pagination-btn"
          onClick={() => onPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label={prevLabel}
        >
          <ChevronLeft size={16} />
        </button>
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`pagination-btn ${p === currentPage ? "pagination-btn--active" : ""}`}
              onClick={() => onPage(p as number)}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="pagination-btn"
          onClick={() => onPage(currentPage + 1)}
          disabled={currentPage >= pages}
          aria-label={nextLabel}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

const RANK_ICONS = [
  <Crown key={0} size={20} className="rank-icon rank-icon--gold" />,
  <Medal key={1} size={20} className="rank-icon rank-icon--silver" />,
  <Medal key={2} size={20} className="rank-icon rank-icon--bronze" />,
];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) return RANK_ICONS[rank - 1];
  return <span className="rank-number">#{rank}</span>;
}

function UserAvatar({
  name,
  avatar,
  size = 40,
}: {
  name: string;
  avatar?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="user-avatar"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="user-avatar user-avatar--placeholder"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export default function LeaderboardClient() {
  const t = useTranslations("leaderboardPage");
  const { currentLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<MainTab>("terms");
  const [termType, setTermType] = useState<TermLeaderboardType>("most_viewed");
  const [userType, setUserType] = useState<UserLeaderboardType>("most_liked");
  const [period, setPeriod] = useState<LeaderboardPeriod>("all_time");

  const [termsData, setTermsData] = useState<LeaderboardTerm[]>([]);
  const [usersData, setUsersData] = useState<LeaderboardUser[]>([]);
  const [reputationData, setReputationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [termsPage, setTermsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [reputationPage, setReputationPage] = useState(1);
  const [termsPagination, setTermsPagination] = useState<Pagination | null>(
    null,
  );
  const [usersPagination, setUsersPagination] = useState<Pagination | null>(
    null,
  );
  const [reputationPagination, setReputationPagination] =
    useState<Pagination | null>(null);

  const getTermText = (multiLang?: {
    vi?: string;
    en?: string;
    lo?: string;
  }): string => {
    if (!multiLang) return "";
    return (
      (multiLang as any)[currentLanguage] ||
      multiLang.vi ||
      multiLang.en ||
      multiLang.lo ||
      ""
    );
  };

  const loadTermsLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaderboardService.getTermsLeaderboard(
        termType,
        period,
        termsPage,
        PAGE_SIZE,
      );
      if (res.success && res.data) {
        setTermsData(res.data.terms);
        if (res.data.pagination) setTermsPagination(res.data.pagination);
      }
    } catch {
      toast.error(t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [termType, period, termsPage, t]);

  const loadUsersLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaderboardService.getUsersLeaderboard(
        userType,
        usersPage,
        PAGE_SIZE,
      );
      if (res.success && res.data) {
        setUsersData(res.data.users);
        if (res.data.pagination) setUsersPagination(res.data.pagination);
      }
    } catch {
      toast.error(t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [userType, usersPage, t]);

  const loadReputationLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaderboardService.getReputationLeaderboard(
        reputationPage,
        PAGE_SIZE,
      );
      if (res.success && res.data) {
        setReputationData(res.data.leaderboard);
        if (res.data.pagination) setReputationPagination(res.data.pagination);
      }
    } catch {
      toast.error(t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [reputationPage, t]);

  useEffect(() => {
    if (activeTab === "terms") loadTermsLeaderboard();
  }, [activeTab, termType, period, loadTermsLeaderboard]);

  useEffect(() => {
    if (activeTab === "users") loadUsersLeaderboard();
  }, [activeTab, userType, loadUsersLeaderboard]);

  useEffect(() => {
    if (activeTab === "reputation") loadReputationLeaderboard();
  }, [activeTab, loadReputationLeaderboard]);

  // Đặt lại về trang 1 khi bộ lọc thay đổi
  const handleTermTypeChange = (type: TermLeaderboardType) => {
    setTermType(type);
    setTermsPage(1);
  };
  const handlePeriodChange = (p: LeaderboardPeriod) => {
    setPeriod(p);
    setTermsPage(1);
  };
  const handleUserTypeChange = (type: UserLeaderboardType) => {
    setUserType(type);
    setUsersPage(1);
  };
  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    setTermsPage(1);
    setUsersPage(1);
    setReputationPage(1);
  };

  const periods: { value: LeaderboardPeriod; label: string }[] = [
    { value: "all_time", label: t("periodAllTime") },
    { value: "monthly", label: t("periodMonthly") },
    { value: "quarterly", label: t("periodQuarterly") },
    { value: "yearly", label: t("periodYearly") },
  ];

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <div className="leaderboard-page__header">
        <div className="leaderboard-page__header-icon">
          <Trophy size={40} />
        </div>
        <h1 className="leaderboard-page__title">{t("title")}</h1>
        <p className="leaderboard-page__subtitle">{t("subtitle")}</p>
      </div>

      {/* Main Tabs */}
      <div className="leaderboard-page__tabs">
        <button
          className={`tab-btn ${activeTab === "terms" ? "tab-btn--active" : ""}`}
          onClick={() => handleTabChange("terms")}
        >
          <TrendingUp size={18} />
          {t("tabTerms")}
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "tab-btn--active" : ""}`}
          onClick={() => handleTabChange("users")}
        >
          <User size={18} />
          {t("tabUsers")}
        </button>
        <button
          className={`tab-btn ${activeTab === "reputation" ? "tab-btn--active" : ""}`}
          onClick={() => handleTabChange("reputation")}
        >
          <Star size={18} />
          {t("tabReputation")}
        </button>
      </div>

      {/* Content */}
      <div className="leaderboard-page__content">
        {/* ===== TERMS TAB ===== */}
        {activeTab === "terms" && (
          <>
            <div className="leaderboard-page__filters">
              {/* Type filter */}
              <div className="filter-group">
                <button
                  className={`filter-btn ${termType === "most_viewed" ? "filter-btn--active" : ""}`}
                  onClick={() => handleTermTypeChange("most_viewed")}
                >
                  <Eye size={16} />
                  {t("typeMostViewed")}
                </button>
                <button
                  className={`filter-btn ${termType === "most_favorited" ? "filter-btn--active" : ""}`}
                  onClick={() => handleTermTypeChange("most_favorited")}
                >
                  <Heart size={16} />
                  {t("typeMostFavorited")}
                </button>
              </div>
              {/* Period filter */}
              {termType === "most_favorited" && (
                <div className="filter-group filter-group--period">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      className={`filter-btn filter-btn--sm ${period === p.value ? "filter-btn--active" : ""}`}
                      onClick={() => handlePeriodChange(p.value)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="leaderboard-page__loading">
                <Loader2 size={32} className="animate-spin" />
                <p>{t("loading")}</p>
              </div>
            ) : termsData.length === 0 ? (
              <div className="leaderboard-page__empty">
                <Trophy size={48} />
                <p>{t("noData")}</p>
              </div>
            ) : (
              <>
                <div className="leaderboard-list">
                  {termsData.map((entry) => (
                    <div
                      key={entry._id}
                      className={`leaderboard-item ${entry.rank <= 3 ? `leaderboard-item--top${entry.rank}` : ""}`}
                    >
                      <div className="leaderboard-item__rank">
                        <RankBadge rank={entry.rank} />
                      </div>
                      <div className="leaderboard-item__info">
                        <Link
                          href={`/terms/${entry._id}`}
                          className="leaderboard-item__name"
                        >
                          {getTermText(entry.term)}
                        </Link>
                        {entry.category && (
                          <span className="leaderboard-item__meta">
                            {getTermText(
                              typeof entry.category.name === "string"
                                ? undefined
                                : entry.category.name,
                            )}
                          </span>
                        )}
                        {entry.createdBy && (
                          <Link
                            href={`/users/${entry.createdBy._id}`}
                            className="leaderboard-item__author"
                          >
                            {entry.createdBy.fullName}
                          </Link>
                        )}
                      </div>
                      <div className="leaderboard-item__stats">
                        {termType === "most_favorited" ? (
                          <span className="stat stat--favorite">
                            <Heart size={14} />
                            {entry.periodFavoriteCount ?? entry.favoriteCount}
                          </span>
                        ) : (
                          <span className="stat stat--view">
                            <Eye size={14} />
                            {entry.viewCount}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/terms/${entry._id}`}
                        className="leaderboard-item__arrow"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  ))}
                </div>
                {termsPagination && (
                  <PaginationControls
                    pagination={termsPagination}
                    currentPage={termsPage}
                    onPage={setTermsPage}
                    infoLabel={t("pagination.info")}
                    prevLabel={t("pagination.prev")}
                    nextLabel={t("pagination.next")}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ===== USERS TAB ===== */}
        {activeTab === "users" && (
          <>
            <div className="leaderboard-page__filters">
              <div className="filter-group">
                <button
                  className={`filter-btn ${userType === "most_liked" ? "filter-btn--active" : ""}`}
                  onClick={() => handleUserTypeChange("most_liked")}
                >
                  <Heart size={16} />
                  {t("typeMostLiked")}
                </button>
                <button
                  className={`filter-btn ${userType === "most_attractive" ? "filter-btn--active" : ""}`}
                  onClick={() => handleUserTypeChange("most_attractive")}
                >
                  <Eye size={16} />
                  {t("typeMostAttractive")}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="leaderboard-page__loading">
                <Loader2 size={32} className="animate-spin" />
                <p>{t("loading")}</p>
              </div>
            ) : usersData.length === 0 ? (
              <div className="leaderboard-page__empty">
                <User size={48} />
                <p>{t("noData")}</p>
              </div>
            ) : (
              <>
                <div className="leaderboard-list">
                  {usersData.map((entry) => {
                    const userData = entry.user || entry;
                    const userId = entry.user?._id || (entry as any)._id;
                    const userName =
                      entry.user?.fullName || (entry as any).fullName || "";
                    const userAvatar =
                      entry.user?.avatar || (entry as any).avatar;

                    return (
                      <div
                        key={userId}
                        className={`leaderboard-item ${entry.rank <= 3 ? `leaderboard-item--top${entry.rank}` : ""}`}
                      >
                        <div className="leaderboard-item__rank">
                          <RankBadge rank={entry.rank} />
                        </div>
                        <div className="leaderboard-item__avatar">
                          <UserAvatar name={userName} avatar={userAvatar} />
                        </div>
                        <div className="leaderboard-item__info">
                          <Link
                            href={`/users/${userId}`}
                            className="leaderboard-item__name"
                          >
                            {userName}
                          </Link>
                          <span className="leaderboard-item__meta">
                            {entry.termCount !== undefined
                              ? `${entry.termCount} ${t("termsContributed").toLowerCase()}`
                              : ""}
                          </span>
                        </div>
                        <div className="leaderboard-item__stats">
                          {userType === "most_liked" ? (
                            <span className="stat stat--favorite">
                              <Heart size={14} />
                              {entry.totalFavorites ?? 0}
                            </span>
                          ) : (
                            <span className="stat stat--view">
                              <Eye size={14} />
                              {entry.profileViewCount ?? 0}
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/users/${userId}`}
                          className="leaderboard-item__arrow"
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
                {usersPagination && (
                  <PaginationControls
                    pagination={usersPagination}
                    currentPage={usersPage}
                    onPage={setUsersPage}
                    infoLabel={t("pagination.info")}
                    prevLabel={t("pagination.prev")}
                    nextLabel={t("pagination.next")}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ===== REPUTATION TAB ===== */}
        {activeTab === "reputation" && (
          <>
            {loading ? (
              <div className="leaderboard-page__loading">
                <Loader2 size={32} className="animate-spin" />
                <p>{t("loading")}</p>
              </div>
            ) : reputationData.length === 0 ? (
              <div className="leaderboard-page__empty">
                <Star size={48} />
                <p>{t("noData")}</p>
              </div>
            ) : (
              <>
                <div className="leaderboard-list">
                  {reputationData.map((entry) => (
                    <div
                      key={entry.user?._id || entry.rank}
                      className={`leaderboard-item ${entry.rank <= 3 ? `leaderboard-item--top${entry.rank}` : ""}`}
                    >
                      <div className="leaderboard-item__rank">
                        <RankBadge rank={entry.rank} />
                      </div>
                      {entry.user && (
                        <div className="leaderboard-item__avatar">
                          <UserAvatar
                            name={entry.user.fullName}
                            avatar={entry.user.avatar}
                          />
                        </div>
                      )}
                      <div className="leaderboard-item__info">
                        {entry.user && (
                          <Link
                            href={`/users/${entry.user._id}`}
                            className="leaderboard-item__name"
                          >
                            {entry.user.fullName}
                          </Link>
                        )}
                        <span className="leaderboard-item__meta">
                          {entry.levelName}
                        </span>
                      </div>
                      <div className="leaderboard-item__stats">
                        <span className="stat stat--reputation">
                          <Star size={14} />
                          {entry.totalPoints}
                        </span>
                      </div>
                      {entry.user && (
                        <Link
                          href={`/users/${entry.user._id}`}
                          className="leaderboard-item__arrow"
                        >
                          <ChevronRight size={18} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                {reputationPagination && (
                  <PaginationControls
                    pagination={reputationPagination}
                    currentPage={reputationPage}
                    onPage={setReputationPage}
                    infoLabel={t("pagination.info")}
                    prevLabel={t("pagination.prev")}
                    nextLabel={t("pagination.next")}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
