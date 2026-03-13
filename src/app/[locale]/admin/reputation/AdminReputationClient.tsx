"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import reputationService, {
  LeaderboardEntry,
  RedemptionRequest,
} from "@/services/reputationService";
import { getUsers } from "@/services/userService";
import { toast } from "react-hot-toast";
import {
  Award,
  Trophy,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
} from "lucide-react";
import "./admin-reputation.scss";

export default function AdminReputationClient() {
  const t = useTranslations("reputationPage");

  const [activeTab, setActiveTab] = useState<
    "leaderboard" | "redemptions" | "adjust"
  >("leaderboard");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbPage, setLbPage] = useState(1);
  const [lbTotalPages, setLbTotalPages] = useState(1);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const [rdPage, setRdPage] = useState(1);
  const [rdTotalPages, setRdTotalPages] = useState(1);
  const [rdStatusFilter, setRdStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Adjust form
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustUserName, setAdjustUserName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userOptions, setUserOptions] = useState<
    Array<{ _id: string; fullName: string; email: string }>
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustDesc, setAdjustDesc] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Review
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reputationService.getLeaderboard({
        page: lbPage,
        limit: 20,
      });
      setLeaderboard(data.leaderboard);
      setLbTotalPages(data.pagination.pages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [lbPage]);

  const loadRedemptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reputationService.getAllRedemptions({
        page: rdPage,
        limit: 20,
        status: rdStatusFilter || undefined,
      });
      setRedemptions(data.requests);
      setRdTotalPages(data.pagination.pages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [rdPage, rdStatusFilter]);

  useEffect(() => {
    if (activeTab === "leaderboard") loadLeaderboard();
  }, [activeTab, loadLeaderboard]);

  useEffect(() => {
    if (activeTab === "redemptions") loadRedemptions();
  }, [activeTab, loadRedemptions]);

  useEffect(() => {
    if (activeTab !== "adjust") return;

    const timer = setTimeout(async () => {
      try {
        setLoadingUsers(true);
        const res = await getUsers({
          page: 1,
          limit: 20,
          search: userSearch || undefined,
        });
        const users = res.data?.users || [];
        setUserOptions(
          users.map((u) => ({
            _id: u._id,
            fullName: u.fullName,
            email: u.email,
          })),
        );
      } catch {
        setUserOptions([]);
      } finally {
        setLoadingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, userSearch]);

  const handleAdjust = async () => {
    if (!adjustUserId.trim() || !adjustDesc.trim()) return;
    setAdjusting(true);
    try {
      await reputationService.adminAdjustPoints({
        userId: adjustUserId.trim(),
        points: adjustPoints,
        description: adjustDesc.trim(),
      });
      toast.success(t("toastAdjustSuccess"));
      setAdjustUserId("");
      setAdjustUserName("");
      setUserSearch("");
      setAdjustPoints(0);
      setAdjustDesc("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("toastErrorDefault"));
    } finally {
      setAdjusting(false);
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      await reputationService.reviewRedemption(id, {
        status,
        note: reviewNote,
      });
      toast.success(
        status === "approved"
          ? t("toastReviewApproved")
          : t("toastReviewRejected"),
      );
      setReviewingId(null);
      setReviewNote("");
      loadRedemptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("toastErrorDefault"));
    }
  };

  const handleDownloadCertificate = async (id: string) => {
    setDownloadingId(id);
    try {
      const blob = await reputationService.downloadCertificate(id, true);
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

  return (
    <div className="admin-reputation">
      <div className="admin-reputation__header">
        <h1>
          <Award size={24} /> {t("title")}
        </h1>
      </div>

      <div className="admin-reputation__tabs">
        <button
          className={activeTab === "leaderboard" ? "active" : ""}
          onClick={() => setActiveTab("leaderboard")}
        >
          <Trophy size={16} /> {t("leaderboard")}
        </button>
        <button
          className={activeTab === "redemptions" ? "active" : ""}
          onClick={() => setActiveTab("redemptions")}
        >
          {t("allRedemptions")}
        </button>
        <button
          className={activeTab === "adjust" ? "active" : ""}
          onClick={() => setActiveTab("adjust")}
        >
          {t("adminAdjust")}
        </button>
      </div>

      {activeTab === "leaderboard" && (
        <div className="admin-reputation__section">
          {loading ? (
            <div className="loading">
              <Loader2 className="spin" size={20} />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="empty">{t("noLeaderboard")}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("rank")}</th>
                  <th>{t("user")}</th>
                  <th>Email</th>
                  <th>{t("points")}</th>
                  <th>{t("levelName")}</th>
                  <th>{t("streak")}</th>
                  <th>{t("badges")}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.user._id}>
                    <td>{entry.rank}</td>
                    <td>{entry.user.fullName}</td>
                    <td>{entry.user.email}</td>
                    <td className="points-cell">{entry.totalPoints}</td>
                    <td>{entry.levelName}</td>
                    <td>
                      {entry.currentStreak} {t("days")}
                    </td>
                    <td>
                      {entry.badges.map((b) => (
                        <span key={b} className="badge-small">
                          {t(`badge_${b}` as any)}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {lbTotalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setLbPage((p) => Math.max(1, p - 1))}
                disabled={lbPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {lbPage} / {lbTotalPages}
              </span>
              <button
                onClick={() => setLbPage((p) => Math.min(lbTotalPages, p + 1))}
                disabled={lbPage === lbTotalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "redemptions" && (
        <div className="admin-reputation__section">
          <div className="filters">
            {["", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                className={rdStatusFilter === s ? "active" : ""}
                onClick={() => {
                  setRdStatusFilter(s);
                  setRdPage(1);
                }}
              >
                {s === "" ? t("allCategories") : t(s as any)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading">
              <Loader2 className="spin" size={20} />
            </div>
          ) : redemptions.length === 0 ? (
            <p className="empty">{t("noRedemptions")}</p>
          ) : (
            <div className="redemption-list">
              {redemptions.map((r) => {
                const userName =
                  typeof r.user === "object" ? r.user.fullName : r.user;
                const userEmail =
                  typeof r.user === "object" ? r.user.email : "";
                return (
                  <div
                    key={r._id}
                    className={`redemption-card status-${r.status}`}
                  >
                    <div className="redemption-card__info">
                      <strong>{userName}</strong>
                      {userEmail && <span className="email">{userEmail}</span>}
                      <span>
                        {r.semester} | {r.pointsUsed} ĐUT → +
                        {r.trainingPointsGained} {t("trainingPoints")}
                      </span>
                      <span className={`status-badge ${r.status}`}>
                        {t(r.status as any)}
                      </span>
                      {r.certificateNumber && (
                        <span className="cert">{r.certificateNumber}</span>
                      )}
                      {/* Thông tin sinh viên */}
                      {r.studentId && (
                        <span className="student-info">
                          MSSV: {r.studentId}
                          {r.studentClass ? ` | Lớp: ${r.studentClass}` : ""}
                          {r.faculty ? ` | Khoa: ${r.faculty}` : ""}
                        </span>
                      )}
                    </div>
                    {r.status === "pending" && (
                      <div className="redemption-card__actions">
                        {reviewingId === r._id ? (
                          <div className="review-form">
                            <input
                              type="text"
                              placeholder={t("reviewNote")}
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                            />
                            <div className="review-btns">
                              <button
                                className="btn-approve"
                                onClick={() => handleReview(r._id, "approved")}
                              >
                                <CheckCircle size={14} /> {t("approve")}
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleReview(r._id, "rejected")}
                              >
                                <XCircle size={14} /> {t("reject")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn-review"
                            onClick={() => setReviewingId(r._id)}
                          >
                            <Search size={14} /> Review
                          </button>
                        )}
                      </div>
                    )}
                    {r.status === "approved" && (
                      <div className="redemption-card__actions">
                        <button
                          className="btn-download-cert"
                          onClick={() => handleDownloadCertificate(r._id)}
                          disabled={downloadingId === r._id}
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {rdTotalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setRdPage((p) => Math.max(1, p - 1))}
                disabled={rdPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {rdPage} / {rdTotalPages}
              </span>
              <button
                onClick={() => setRdPage((p) => Math.min(rdTotalPages, p + 1))}
                disabled={rdPage === rdTotalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "adjust" && (
        <div className="admin-reputation__section">
          <div className="adjust-form">
            <h3>{t("adminAdjust")}</h3>
            <div className="form-group">
              <label>{t("adjustUser")}</label>
              <div className="user-picker">
                <div className="user-picker__search-wrap">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={t("adjustSearchPlaceholder")}
                  />
                  {loadingUsers && (
                    <Loader2 className="spin user-picker__loading" size={14} />
                  )}
                </div>
                <select
                  className="user-picker__select"
                  value={adjustUserId}
                  onChange={(e) => {
                    const userId = e.target.value;
                    setAdjustUserId(userId);
                    const selected = userOptions.find((u) => u._id === userId);
                    setAdjustUserName(selected?.fullName || "");
                  }}
                >
                  <option value="">{t("adjustSelectUser")}</option>
                  {userOptions.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} - {u.email}
                    </option>
                  ))}
                </select>
                {adjustUserName && (
                  <small className="user-picker__selected">
                    {t("adjustSelectedUser", { user: adjustUserName })}
                  </small>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>{t("adjustPoints")}</label>
              <input
                type="number"
                value={adjustPoints}
                onChange={(e) => setAdjustPoints(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>{t("adjustDescription")}</label>
              <input
                type="text"
                value={adjustDesc}
                onChange={(e) => setAdjustDesc(e.target.value)}
                placeholder={t("adjustDescriptionPlaceholder")}
              />
            </div>
            <button
              className="btn-submit"
              onClick={handleAdjust}
              disabled={adjusting || !adjustUserId.trim()}
            >
              {adjusting ? <Loader2 className="spin" size={16} /> : null}
              {t("adjustSubmit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
