"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import reputationService, {
  UserReputation,
  ReputationHistoryItem,
  LeaderboardEntry,
  RedemptionRequest,
} from "@/services/reputationService";
import { toast } from "react-hot-toast";
import {
  Award,
  TrendingUp,
  Zap,
  Target,
  Star,
  Trophy,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
  Loader2,
  GraduationCap,
  BadgeCheck,
  Download,
} from "lucide-react";
import { Layout } from "@/components/layouts";
import "./reputation.scss";

export default function ReputationClient() {
  const t = useTranslations("reputationPage");
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "leaderboard" | "redeem"
  >("overview");
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [history, setHistory] = useState<ReputationHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyCategory, setHistoryCategory] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotalPages, setLeaderboardTotalPages] = useState(1);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [redeemSemester, setRedeemSemester] = useState("");
  const [redeemStudentId, setRedeemStudentId] = useState("");
  const [redeemStudentClass, setRedeemStudentClass] = useState("");
  const [redeemFaculty, setRedeemFaculty] = useState("");
  const [redeemPhone, setRedeemPhone] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const reputationFormula = t("policyFormula");

  const plusRules = [
    { action: t("plusRule1Action"), points: t("plusRule1Points") },
    { action: t("plusRule2Action"), points: t("plusRule2Points") },
    { action: t("plusRule3Action"), points: t("plusRule3Points") },
    { action: t("plusRule4Action"), points: t("plusRule4Points") },
    { action: t("plusRule5Action"), points: t("plusRule5Points") },
  ];

  const minusRules = [
    { action: t("minusRule1Action"), points: t("minusRule1Points") },
    { action: t("minusRule2Action"), points: t("minusRule2Points") },
    { action: t("minusRule3Action"), points: t("minusRule3Points") },
    { action: t("minusRule4Action"), points: t("minusRule4Points") },
    { action: t("minusRule5Action"), points: t("minusRule5Points") },
  ];

  const sectionSixLevels = [
    {
      level: t("section6Level1"),
      range: t("section6Level1Range"),
      rights: [t("section6Level1Right1"), t("section6Level1Right2")],
    },
    {
      level: t("section6Level2"),
      range: t("section6Level2Range"),
      rights: [t("section6Level2Right1"), t("section6Level2Right2")],
    },
  ];

  const rewards = [
    {
      title: t("reward1Title"),
      description: t("reward1Desc"),
    },
    {
      title: t("reward2Title"),
      description: t("reward2Desc"),
    },
    {
      title: t("reward3Title"),
      description: t("reward3Desc"),
    },
    {
      title: t("reward4Title"),
      description: t("reward4Desc"),
    },
  ];

  const semesterOptions = [
    t("semesterOption1"),
    t("semesterOption2"),
    t("semesterOption3"),
    t("semesterOption4"),
  ];

  const facultyOptions = [
    t("facultyOptionA"),
    t("facultyOptionB"),
    t("facultyOptionC"),
    t("facultyOptionD"),
    t("facultyOptionE"),
    t("facultyOptionF"),
    t("facultyOptionG"),
  ];

  const loadReputation = useCallback(async () => {
    try {
      const data = await reputationService.getMyReputation();
      setReputation(data);
    } catch {
      // silent
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await reputationService.getHistory({
        page: historyPage,
        limit: 20,
        category: historyCategory || undefined,
      });
      setHistory(data.history);
      setHistoryTotalPages(data.pagination.pages);
    } catch {
      // silent
    }
  }, [historyPage, historyCategory]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await reputationService.getLeaderboard({
        page: leaderboardPage,
        limit: 20,
      });
      setLeaderboard(data.leaderboard);
      setLeaderboardTotalPages(data.pagination.pages);
    } catch {
      // silent
    }
  }, [leaderboardPage]);

  const loadRedemptions = useCallback(async () => {
    try {
      const data = await reputationService.getMyRedemptions();
      setRedemptions(data.requests);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([loadReputation(), loadLeaderboard()]).finally(() =>
        setLoading(false),
      );
    }
  }, [isAuthenticated, authLoading, router, loadReputation, loadLeaderboard]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  useEffect(() => {
    if (activeTab === "redeem") loadRedemptions();
  }, [activeTab, loadRedemptions]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "overview" ||
      tab === "history" ||
      tab === "leaderboard" ||
      tab === "redeem"
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleVerifyUtb = async () => {
    setVerifying(true);
    try {
      await reputationService.verifyUtbStudent();
      toast.success(t("toastVerifySuccess"));
      loadReputation();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("toastErrorDefault"));
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemSemester.trim()) return;
    setRedeeming(true);
    try {
      await reputationService.requestRedemption({
        type: "training_points",
        semester: redeemSemester.trim(),
        studentId: redeemStudentId.trim() || undefined,
        studentClass: redeemStudentClass.trim() || undefined,
        faculty: redeemFaculty.trim() || undefined,
        phone: redeemPhone.trim() || undefined,
      });
      toast.success(t("toastRedemptionSuccess"));
      setRedeemSemester("");
      setRedeemStudentId("");
      setRedeemStudentClass("");
      setRedeemFaculty("");
      setRedeemPhone("");
      loadRedemptions();
      loadReputation();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("toastErrorDefault"));
    } finally {
      setRedeeming(false);
    }
  };

  const handleDownloadCertificate = async (id: string) => {
    setDownloadingId(id);
    try {
      const blob = await reputationService.downloadCertificate(id, false);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("toastCertificateDownloaded"));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("toastErrorDefault"));
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="reputation-loading">
          <Loader2 className="spin" size={32} />
          <p>{t("loading")}</p>
        </div>
      </Layout>
    );
  }

  const levelProgress =
    reputation && reputation.nextLevel
      ? ((reputation.totalPoints -
          (reputation.nextLevel.min -
            reputation.pointsToNextLevel -
            reputation.totalPoints +
            reputation.nextLevel.min)) /
          (reputation.nextLevel.min -
            (reputation.nextLevel.min - reputation.pointsToNextLevel))) *
        100
      : 100;

  const safeProgress = reputation
    ? reputation.nextLevel
      ? Math.min(
          100,
          Math.max(
            0,
            (reputation.totalPoints / reputation.nextLevel.min) * 100,
          ),
        )
      : 100
    : 0;

  return (
    <Layout>
      <div className="reputation-page">
        <div className="reputation-page__header">
          <h1>
            <Award size={28} /> {t("title")}
          </h1>
          <p>{t("subtitle")}</p>
        </div>

        <div className="reputation-page__tabs">
          {(["overview", "history", "leaderboard", "redeem"] as const).map(
            (tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "overview" && <Target size={16} />}
                {tab === "history" && <Clock size={16} />}
                {tab === "leaderboard" && <Trophy size={16} />}
                {tab === "redeem" && <GraduationCap size={16} />}
                {t(tab)}
              </button>
            ),
          )}
        </div>

        {activeTab === "overview" && reputation && (
          <div className="reputation-page__overview">
            <section className="policy-hero">
              <div className="policy-hero__badge">{t("policyBadge")}</div>
              <h2>{t("policyTitle")}</h2>
              <p>{t("policyDescription")}</p>
              <div className="policy-hero__formula">{reputationFormula}</div>
            </section>

            <section className="policy-grid">
              <div className="policy-card">
                <h3>{t("plusTableTitle")}</h3>
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>{t("tableAction")}</th>
                      <th>{t("tablePoints")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plusRules.map((item) => (
                      <tr key={item.action}>
                        <td>{item.action}</td>
                        <td className="positive">{item.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="policy-card">
                <h3>{t("minusTableTitle")}</h3>
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>{t("tableAction")}</th>
                      <th>{t("tablePoints")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minusRules.map((item) => (
                      <tr key={item.action}>
                        <td>{item.action}</td>
                        <td className="negative">{item.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="level-section">
              <div className="level-section__header">
                <h3>{t("section6Title")}</h3>
                <p>{t("section6Description")}</p>
              </div>

              <div className="level-cards">
                {sectionSixLevels.map((level) => (
                  <article className="level-card" key={level.level}>
                    <div className="level-card__top">
                      <span className="level-name">{level.level}</span>
                      <span className="level-range">{level.range}</span>
                    </div>
                    <div className="level-card__title">{t("rightsTitle")}</div>
                    <ul>
                      {level.rights.map((right) => (
                        <li key={right}>{right}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="reward-section">
              <h3>{t("rewardsTitle")}</h3>
              <div className="reward-grid">
                {rewards.map((reward) => (
                  <article className="reward-card" key={reward.title}>
                    <h4>{reward.title}</h4>
                    <p>{reward.description}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Tổng điểm + Level */}
            <div className="overview-card overview-card--main">
              <div className="overview-card__level">
                <div className="level-badge">
                  <Star size={24} />
                  <span>{reputation.level}</span>
                </div>
                <h2>{reputation.levelName}</h2>
                <div className="total-points">{reputation.totalPoints} ĐUT</div>
              </div>
              {reputation.nextLevel && (
                <div className="overview-card__progress">
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{ width: `${safeProgress}%` }}
                    />
                  </div>
                  <p>
                    {t("pointsToNext", {
                      points: reputation.pointsToNextLevel,
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="overview-grid">
              <div className="overview-card overview-card--stat">
                <TrendingUp size={20} />
                <span className="label">{t("contribution")}</span>
                <span className="value positive">
                  +{reputation.breakdown.contribution}
                </span>
              </div>
              <div className="overview-card overview-card--stat">
                <Shield size={20} />
                <span className="label">{t("report")}</span>
                <span className="value positive">
                  +{reputation.breakdown.report}
                </span>
              </div>
              <div className="overview-card overview-card--stat">
                <Zap size={20} />
                <span className="label">{t("bonus")}</span>
                <span className="value positive">
                  +{reputation.breakdown.bonus}
                </span>
              </div>
              <div className="overview-card overview-card--stat">
                <Target size={20} />
                <span className="label">{t("penalty")}</span>
                <span className="value negative">
                  -{reputation.breakdown.penalty}
                </span>
              </div>
            </div>

            {/* Streak + AI */}
            <div className="overview-row">
              <div className="overview-card">
                <h3>
                  <Zap size={18} /> {t("streak")}
                </h3>
                <div className="streak-info">
                  <div>
                    <span>{t("currentStreak")}:</span>{" "}
                    <strong>
                      {reputation.streak.current} {t("days")}
                    </strong>
                  </div>
                  <div>
                    <span>{t("longestStreak")}:</span>{" "}
                    <strong>
                      {reputation.streak.longest} {t("days")}
                    </strong>
                  </div>
                  <div>
                    <span>{t("streakMultiplier")}:</span>{" "}
                    <strong>×{reputation.streak.multiplier}</strong>
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <h3>
                  <Target size={18} /> {t("aiAccess")}
                </h3>
                <div className="ai-info">
                  <div>
                    <span>{t("dailyQueries")}:</span>{" "}
                    <strong>{reputation.aiAccess.dailyQueries}</strong>
                  </div>
                  <div>
                    <span>{t("features")}:</span>
                  </div>
                  <div className="feature-tags">
                    {reputation.aiAccess.features.map((f) => (
                      <span key={f} className="feature-tag">
                        {t(`feature_${f}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            {reputation.badges.length > 0 && (
              <div className="overview-card">
                <h3>
                  <BadgeCheck size={18} /> {t("badges")}
                </h3>
                <div className="badges-grid">
                  {reputation.badges.map((badge) => (
                    <span key={badge} className="badge-item">
                      {t(`badge_${badge}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* UTB */}
            <div className="overview-card">
              <h3>
                <GraduationCap size={18} /> {t("utbStudent")}
              </h3>
              {reputation.isUtbStudent ? (
                <p className="verified-text">
                  <BadgeCheck size={16} /> {t("verified")}
                </p>
              ) : (
                <button
                  className="btn-verify"
                  onClick={handleVerifyUtb}
                  disabled={verifying}
                >
                  {verifying ? <Loader2 className="spin" size={16} /> : null}
                  {t("verifyUtb")}
                </button>
              )}
            </div>

            {/* Report Accuracy */}
            <div className="overview-card overview-card--stat">
              <Shield size={20} />
              <span className="label">{t("reportAccuracy")}</span>
              <span className="value">{reputation.reportAccuracy}%</span>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="reputation-page__history">
            <div className="history-filters">
              {["", "contribution", "report", "bonus", "penalty"].map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${historyCategory === cat ? "active" : ""}`}
                  onClick={() => {
                    setHistoryCategory(cat);
                    setHistoryPage(1);
                  }}
                >
                  {cat === "" ? t("allCategories") : t(cat as any)}
                </button>
              ))}
            </div>

            {history.length === 0 ? (
              <p className="empty">{t("noHistory")}</p>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className={`history-item ${item.points >= 0 ? "positive" : "negative"}`}
                  >
                    <div className="history-item__info">
                      <span className="description">{item.description}</span>
                      <span className="date">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="history-item__points">
                      {item.points >= 0 ? "+" : ""}
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {historyTotalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {historyPage} / {historyTotalPages}
                </span>
                <button
                  onClick={() =>
                    setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
                  }
                  disabled={historyPage === historyTotalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="reputation-page__leaderboard">
            {leaderboard.length === 0 ? (
              <p className="empty">{t("noLeaderboard")}</p>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>{t("rank")}</th>
                    <th>{t("user")}</th>
                    <th>{t("points")}</th>
                    <th>{t("levelName")}</th>
                    <th>{t("streak")}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.user._id}
                      className={entry.user._id === user?.id ? "highlight" : ""}
                    >
                      <td className="rank-cell">
                        {entry.rank <= 3 ? (
                          <Trophy
                            size={16}
                            className={`trophy-${entry.rank}`}
                          />
                        ) : (
                          entry.rank
                        )}
                      </td>
                      <td className="user-cell">
                        {entry.user.avatar && (
                          <img
                            src={entry.user.avatar}
                            alt=""
                            className="avatar"
                          />
                        )}
                        <span>{entry.user.fullName}</span>
                      </td>
                      <td className="points-cell">{entry.totalPoints}</td>
                      <td>{entry.levelName}</td>
                      <td>
                        {entry.currentStreak} {t("days")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {leaderboardTotalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setLeaderboardPage((p) => Math.max(1, p - 1))}
                  disabled={leaderboardPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {leaderboardPage} / {leaderboardTotalPages}
                </span>
                <button
                  onClick={() =>
                    setLeaderboardPage((p) =>
                      Math.min(leaderboardTotalPages, p + 1),
                    )
                  }
                  disabled={leaderboardPage === leaderboardTotalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "redeem" && (
          <div className="reputation-page__redeem">
            {reputation?.isUtbStudent ? (
              <>
                <div className="redeem-form">
                  <h3>{t("redeemTitle")}</h3>
                  <p>
                    {t("totalPoints")}:{" "}
                    <strong>{reputation.totalPoints} ĐUT</strong>
                  </p>
                  <div className="redeem-form__grid">
                    <div className="form-group">
                      <label>{t("semester")}</label>
                      <select
                        value={redeemSemester}
                        onChange={(e) => setRedeemSemester(e.target.value)}
                      >
                        <option value="">{t("selectSemester")}</option>
                        {semesterOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t("faculty")}</label>
                      <select
                        value={redeemFaculty}
                        onChange={(e) => setRedeemFaculty(e.target.value)}
                      >
                        <option value="">{t("facultyPlaceholder")}</option>
                        {facultyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t("studentId")}</label>
                      <input
                        type="text"
                        placeholder={t("studentIdPlaceholder")}
                        value={redeemStudentId}
                        onChange={(e) => setRedeemStudentId(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("studentClass")}</label>
                      <input
                        type="text"
                        placeholder={t("studentClassPlaceholder")}
                        value={redeemStudentClass}
                        onChange={(e) => setRedeemStudentClass(e.target.value)}
                      />
                    </div>
                    <div className="form-group form-group--full">
                      <label>{t("phone")}</label>
                      <input
                        type="text"
                        placeholder={t("phonePlaceholder")}
                        value={redeemPhone}
                        onChange={(e) => setRedeemPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    className="btn-redeem"
                    onClick={handleRedeem}
                    disabled={redeeming || !redeemSemester.trim()}
                  >
                    {redeeming ? <Loader2 className="spin" size={16} /> : null}
                    {t("requestRedemption")}
                  </button>
                </div>

                <div className="redemption-list">
                  <h3>{t("redemptionHistory")}</h3>
                  {redemptions.length === 0 ? (
                    <p className="empty">{t("noRedemptions")}</p>
                  ) : (
                    <div className="redemption-items">
                      {redemptions.map((r) => (
                        <div
                          key={r._id}
                          className={`redemption-item status-${r.status}`}
                        >
                          <div className="redemption-item__info">
                            <span>{r.semester}</span>
                            <span>
                              {r.pointsUsed} ĐUT → +{r.trainingPointsGained}{" "}
                              {t("trainingPoints")}
                            </span>
                          </div>
                          <div className="redemption-item__status">
                            <span className={`status-badge ${r.status}`}>
                              {t(r.status as any)}
                            </span>
                            {r.certificateNumber && (
                              <span className="cert">
                                {r.certificateNumber}
                              </span>
                            )}
                            {r.status === "approved" && (
                              <button
                                className="btn-download-cert"
                                onClick={() => handleDownloadCertificate(r._id)}
                                disabled={downloadingId === r._id}
                                title={t("downloadCertificate")}
                              >
                                {downloadingId === r._id ? (
                                  <Loader2 className="spin" size={14} />
                                ) : (
                                  <Download size={14} />
                                )}
                                {downloadingId === r._id
                                  ? t("downloadingCertificate")
                                  : t("downloadCertificate")}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="utb-required">
                <GraduationCap size={48} />
                <p>{t("utbStudent")}</p>
                <button
                  className="btn-verify"
                  onClick={handleVerifyUtb}
                  disabled={verifying}
                >
                  {verifying ? <Loader2 className="spin" size={16} /> : null}
                  {t("verifyUtb")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
