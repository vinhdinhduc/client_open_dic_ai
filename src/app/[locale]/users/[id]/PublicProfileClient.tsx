"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks";
import Link from "next/link";
import {
  User,
  Trophy,
  BookOpen,
  Star,
  Eye,
  Calendar,
  Shield,
  ChevronRight,
  Loader2,
  AlertCircle,
  Activity,
} from "lucide-react";
import leaderboardService, {
  PublicProfileData,
} from "@/services/leaderboardService";
import "./PublicProfile.scss";

interface PublicProfileClientProps {
  userId: string;
}

const LEVEL_NAMES: Record<number, string> = {
  1: "Người mới",
  2: "Đóng góp viên",
  3: "Chuyên gia",
  4: "Bậc thầy",
  5: "Huyền thoại",
};

function UserAvatarLarge({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (avatar) {
    return <img src={avatar} alt={name} className="profile-avatar" />;
  }
  return (
    <div className="profile-avatar profile-avatar--placeholder">{initials}</div>
  );
}

export default function PublicProfileClient({
  userId,
}: PublicProfileClientProps) {
  const t = useTranslations("publicProfile");
  const { currentLanguage } = useLanguage();

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      currentLanguage === "vi"
        ? "vi-VN"
        : currentLanguage === "lo"
          ? "lo-LA"
          : "en-US",
      { year: "numeric", month: "long", day: "numeric" },
    );
  };

  const getRoleLabel = (role: string): string => {
    if (role === "admin") return t("roleAdmin");
    if (role === "moderator") return t("roleModerator");
    return t("roleUser");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await leaderboardService.getPublicProfile(userId);
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError(t("errorLoad"));
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError(t("notFound"));
        } else {
          setError(t("errorLoad"));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, t]);

  if (loading) {
    return (
      <div className="public-profile__loading">
        <Loader2 size={36} className="animate-spin" />
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile__error">
        <AlertCircle size={48} />
        <p>{error || t("errorLoad")}</p>
        <Link href="/leaderboard" className="btn-back">
          {t("leaderboardLink")}
        </Link>
      </div>
    );
  }

  const { user, stats, recentTerms, reputation } = profile;

  return (
    <div className="public-profile">
      {/* Breadcrumb */}
      <nav className="public-profile__breadcrumb">
        <Link href="/" className="breadcrumb-link">
          UTB OpenDict
        </Link>
        <ChevronRight size={14} />
        <Link href="/leaderboard" className="breadcrumb-link">
          {t("leaderboardLink")}
        </Link>
        <ChevronRight size={14} />
        <span className="breadcrumb-current">{user.fullName}</span>
      </nav>

      {/* Profile Card */}
      <div className="public-profile__card">
        <div className="profile-header">
          <UserAvatarLarge name={user.fullName} avatar={user.avatar} />
          <div className="profile-info">
            <h1 className="profile-name">{user.fullName}</h1>
            <div className="profile-meta">
              <span className={`role-badge role-badge--${user.role}`}>
                <Shield size={14} />
                {getRoleLabel(user.role)}
              </span>
              <span className="join-date">
                <Calendar size={14} />
                {t("joinedAt")}: {formatDate(user.joinedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--terms">
              <BookOpen size={22} />
            </div>
            <div className="stat-card__value">{stats.approvedTermCount}</div>
            <div className="stat-card__label">{t("approvedTerms")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--contrib">
              <Activity size={22} />
            </div>
            <div className="stat-card__value">{stats.totalContributions}</div>
            <div className="stat-card__label">{t("totalContributions")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--views">
              <Eye size={22} />
            </div>
            <div className="stat-card__value">{user.profileViewCount}</div>
            <div className="stat-card__label">{t("profileViews")}</div>
          </div>
          {reputation && (
            <div className="stat-card">
              <div className="stat-card__icon stat-card__icon--rep">
                <Star size={22} />
              </div>
              <div className="stat-card__value">{reputation.totalPoints}</div>
              <div className="stat-card__label">{t("reputationPoints")}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reputation Section */}
      {reputation && (
        <div className="public-profile__section">
          <h2 className="section-title">
            <Star size={20} />
            {t("reputation")}
          </h2>
          <div className="reputation-info">
            <div className="rep-level">
              <span className="rep-level__badge">Lv.{reputation.level}</span>
              <span className="rep-level__name">
                {LEVEL_NAMES[reputation.level] || `Level ${reputation.level}`}
              </span>
            </div>
            {reputation.currentStreak > 0 && (
              <div className="rep-streak">
                <Activity size={16} />
                <span>{reputation.currentStreak} ngày liên tiếp</span>
              </div>
            )}
            {reputation.badges && reputation.badges.length > 0 && (
              <div className="rep-badges">
                <span className="rep-badges__label">{t("badges")}:</span>
                {reputation.badges.map((badge, i) => (
                  <span key={i} className="rep-badge">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Terms */}
      {recentTerms && recentTerms.length > 0 && (
        <div className="public-profile__section">
          <h2 className="section-title">
            <BookOpen size={20} />
            {t("recentTerms")}
          </h2>
          <div className="terms-list">
            {recentTerms.map((term) => (
              <Link
                key={term._id}
                href={`/terms/${term._id}`}
                className="term-item"
              >
                <div className="term-item__info">
                  <span className="term-item__name">
                    {getTermText(term.term)}
                  </span>
                  <span className="term-item__def">
                    {getTermText(term.definition)?.substring(0, 80)}
                    {(getTermText(term.definition)?.length || 0) > 80
                      ? "..."
                      : ""}
                  </span>
                </div>
                <div className="term-item__stats">
                  <span className="term-stat">
                    <Eye size={13} />
                    {term.viewCount}
                  </span>
                </div>
                <ChevronRight size={16} className="term-item__arrow" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
