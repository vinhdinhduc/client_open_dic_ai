"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import contributionService from "@/services/contributionService";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Globe,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Edit3,
  Lock,
  Save,
  Loader2,
  ChevronRight,
  EyeOff,
  Eye,
  Bell,
  Award,
} from "lucide-react";
import "./page.scss";
import { Layout } from "@/components/layouts";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const {
    isAuthenticated,
    user,
    isLoading: authLoading,
    updateUser,
    refreshProfile,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("vi");
  const [isShowCurrentPassword, setIsShowCurrentPassword] = useState(false);
  const [isShowNewPassword, setIsShowNewPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailNotifications, setEmailNotifications] = useState({
    contributions: true,
    moderation: true,
    system: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPreferredLanguage((user as any).preferredLanguage || "vi");
      const notifs = (user as any).emailNotifications;
      if (notifs) {
        setEmailNotifications({
          contributions: notifs.contributions,
          moderation: notifs.moderation,
          system: notifs.system,
        });
      }
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "password") {
      setIsChangingPassword(true);
    }
  }, [searchParams]);

  const loadStats = async () => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        contributionService.getMyContributions({ limit: 1 }),
        contributionService.getMyContributions({
          status: "pending",
          limit: 1,
        }),
        contributionService.getMyContributions({
          status: "approved",
          limit: 1,
        }),
        contributionService.getMyContributions({
          status: "rejected",
          limit: 1,
        }),
      ]);

      setStats({
        total: allRes.data?.pagination?.total || 0,
        pending: pendingRes.data?.pagination?.total || 0,
        approved: approvedRes.data?.pagination?.total || 0,
        rejected: rejectedRes.data?.pagination?.total || 0,
      });
    } catch {
      // Silently fail for stats
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error(t("fullNameRequired") || "Họ tên là bắt buộc");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authService.updateProfile({
        fullName: fullName.trim(),
      } as any);

      if (response.success) {
        updateUser({ fullName: fullName.trim() } as any);
        toast.success(t("updateSuccess") || "Cập nhật thành công");
        setIsEditing(false);
      }
    } catch {
      toast.error(t("updateError") || "Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    const isGoogleOnlyUser =
      (user as any)?.authProvider === "google" && !(user as any)?.hasPassword;

    if (!isGoogleOnlyUser && !currentPassword) {
      toast.error(t("fillAllFields") || "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error(t("fillAllFields") || "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        t("passwordMinLength") || "Mật khẩu mới phải có ít nhất 6 ký tự",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch") || "Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authService.changePassword(
        isGoogleOnlyUser ? undefined : currentPassword,
        newPassword,
      );

      if (response.success) {
        toast.success(t("passwordChanged") || "Đổi mật khẩu thành công");
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Refresh profile to update hasPassword flag
        await refreshProfile();
      }
    } catch {
      toast.error(t("passwordChangeError") || "Đổi mật khẩu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "moderator":
        return "Kiểm duyệt viên";
      default:
        return "Người dùng";
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const response = await authService.updateProfile({
        emailNotifications,
      } as any);
      if (response.success) {
        updateUser({ emailNotifications } as any);
        toast.success("Đã cập nhật cài đặt thông báo");
      }
    } catch {
      toast.error("Không thể cập nhật cài đặt thông báo");
    } finally {
      setSavingNotifications(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="loading-page">
          <div className="spinner-large"></div>
          <p>{tCommon("loading")}</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    router.push("/login?returnUrl=/profile");
    return null;
  }

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-page__header">
          <h1 className="page-title">{t("profileTitle") || "Hồ sơ của tôi"}</h1>
          <p className="page-subtitle">
            {t("profileSubtitle") ||
              "Quản lý thông tin cá nhân và bảo mật tài khoản"}
          </p>
        </div>

        <div className="profile-grid">
          {/* User Info Card */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h2 className="card-title">
                <User size={20} />
                {t("personalInfo") || "Thông tin cá nhân"}
              </h2>
              {!isEditing && (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} />
                  {tCommon("edit")}
                </button>
              )}
            </div>

            <div className="profile-card__body">
              {isEditing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label className="form-label">
                      <User size={16} />
                      {t("fullNameLabel") || "Họ và tên"}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Globe size={16} />
                      {t("languageLabel") || "Ngôn ngữ ưa thích"}
                    </label>
                    <select
                      className="form-select"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                      <option value="lo">ພາສາລາວ</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn--secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(user?.fullName || "");
                      }}
                      disabled={isSaving}
                    >
                      {tCommon("cancel")}
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="spinner" size={16} />
                          {tCommon("loading")}
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {tCommon("save")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-list">
                  <div className="info-item">
                    <div className="info-item__icon">
                      <User size={18} />
                    </div>
                    <div className="info-item__content">
                      <span className="info-item__label">
                        {t("fullNameLabel") || "Họ và tên"}
                      </span>
                      <span className="info-item__value">{user?.fullName}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item__icon">
                      <Mail size={18} />
                    </div>
                    <div className="info-item__content">
                      <span className="info-item__label">Email</span>
                      <span className="info-item__value">{user?.email}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item__icon">
                      <Shield size={18} />
                    </div>
                    <div className="info-item__content">
                      <span className="info-item__label">
                        {t("roleLabel") || "Vai trò"}
                      </span>
                      <span className="info-item__value info-item__value--badge">
                        {getRoleLabel(user?.role || "user")}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item__icon">
                      <Calendar size={18} />
                    </div>
                    <div className="info-item__content">
                      <span className="info-item__label">
                        {t("joinedDate") || "Ngày tham gia"}
                      </span>
                      <span className="info-item__value">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contribution Stats Card */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h2 className="card-title">
                <FileText size={20} />
                {t("contributionStats") || "Thống kê đóng góp"}
              </h2>
              <button
                className="btn-edit"
                onClick={() => router.push("/profile/contributions")}
              >
                {t("viewAll") || "Xem tất cả"}
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="profile-card__body">
              <div className="mini-stats">
                <div className="mini-stat">
                  <div className="mini-stat__icon mini-stat__icon--total">
                    <FileText size={20} />
                  </div>
                  <div className="mini-stat__value">{stats.total}</div>
                  <div className="mini-stat__label">{t("stats.total")}</div>
                </div>

                <div className="mini-stat">
                  <div className="mini-stat__icon mini-stat__icon--pending">
                    <Clock size={20} />
                  </div>
                  <div className="mini-stat__value">{stats.pending}</div>
                  <div className="mini-stat__label">{t("stats.pending")}</div>
                </div>

                <div className="mini-stat">
                  <div className="mini-stat__icon mini-stat__icon--approved">
                    <CheckCircle size={20} />
                  </div>
                  <div className="mini-stat__value">{stats.approved}</div>
                  <div className="mini-stat__label">{t("stats.approved")}</div>
                </div>

                <div className="mini-stat">
                  <div className="mini-stat__icon mini-stat__icon--rejected">
                    <XCircle size={20} />
                  </div>
                  <div className="mini-stat__value">{stats.rejected}</div>
                  <div className="mini-stat__label">{t("stats.rejected")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reputation Card */}
          <div className="profile-card">
            <div className="profile-card__header">
              <h2 className="card-title">
                <Award size={20} />
                {t("reputation") || "Điểm uy tín"}
              </h2>
              <button
                className="btn-edit"
                onClick={() => router.push("/profile/reputation")}
              >
                {t("viewAll") || "Xem tất cả"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Security Card */}
          <div className="profile-card profile-card--full">
            <div className="profile-card__header">
              <h2 className="card-title">
                <Lock size={20} />
                {t("security") || "Bảo mật"}
              </h2>
              {!isChangingPassword && (
                <button
                  className="btn-edit"
                  onClick={() => setIsChangingPassword(true)}
                >
                  <Lock size={16} />
                  {(user as any)?.authProvider === "google" &&
                  !(user as any)?.hasPassword
                    ? t("setPassword") || "Đặt mật khẩu"
                    : t("changePassword") || "Đổi mật khẩu"}
                </button>
              )}
            </div>

            <div className="profile-card__body">
              {isChangingPassword ? (
                <div className="edit-form">
                  {/* Hiển thị trường mật khẩu hiện tại chỉ khi user không phải Google-only */}
                  {!(
                    (user as any)?.authProvider === "google" &&
                    !(user as any)?.hasPassword
                  ) && (
                    <div className="form-group">
                      <label className="form-label">
                        {t("currentPassword") || "Mật khẩu hiện tại"}
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={isShowCurrentPassword ? "text" : "password"}
                          className="form-input"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                        />
                        <span
                          className="password-toggle"
                          onClick={() =>
                            setIsShowCurrentPassword((prev) => !prev)
                          }
                        >
                          {isShowCurrentPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        {t("newPassword") || "Mật khẩu mới"}
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={isShowNewPassword ? "text" : "password"}
                          className="form-input"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                        <span
                          className="password-toggle"
                          onClick={() => setIsShowNewPassword((prev) => !prev)}
                        >
                          {isShowNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {t("confirmNewPassword") || "Xác nhận mật khẩu mới"}
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={isShowConfirmPassword ? "text" : "password"}
                          className="form-input"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                        <span
                          className="password-toggle"
                          onClick={() =>
                            setIsShowConfirmPassword((prev) => !prev)
                          }
                        >
                          {isShowConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn--secondary"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      disabled={isSaving}
                    >
                      {tCommon("cancel")}
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={handleChangePassword}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="spinner" size={16} />
                          {tCommon("loading")}
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          {(user as any)?.authProvider === "google" &&
                          !(user as any)?.hasPassword
                            ? t("setPassword") || "Đặt mật khẩu"
                            : t("changePassword") || "Đổi mật khẩu"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="security-info">
                  {t("securityInfo") ||
                    "Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và thay đổi định kỳ."}
                </p>
              )}
            </div>
          </div>

          {/* Email Notifications Card */}
          <div className="profile-card profile-card--full">
            <div className="profile-card__header">
              <h2 className="card-title">
                <Bell size={20} />
                {t("settingEmail")}
              </h2>
            </div>
            <div className="profile-card__body">
              <div className="notification-settings">
                <label className="notification-toggle">
                  <div className="notification-toggle__info">
                    <span className="notification-toggle__label">
                      {t("notifyContribution")}
                    </span>
                    <span className="notification-toggle__desc">
                      {t("notifyContributionDesc")}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications.contributions}
                    onChange={(e) =>
                      setEmailNotifications((prev) => ({
                        ...prev,
                        contributions: e.target.checked,
                      }))
                    }
                  />
                  <span className="toggle-slider" />
                </label>

                {user?.role !== "user" && (
                  <label className="notification-toggle">
                    <div className="notification-toggle__info">
                      <span className="notification-toggle__label">
                        {t("notifyModeration")}
                      </span>
                      <span className="notification-toggle__desc">
                        {t("notifyModerationDesc")}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications.moderation}
                      onChange={(e) =>
                        setEmailNotifications((prev) => ({
                          ...prev,
                          moderation: e.target.checked,
                        }))
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                )}

                <label className="notification-toggle">
                  <div className="notification-toggle__info">
                    <span className="notification-toggle__label">
                      {t("notifySystem")}
                    </span>
                    <span className="notification-toggle__desc">
                      {t("notifySystemDesc")}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications.system}
                    onChange={(e) =>
                      setEmailNotifications((prev) => ({
                        ...prev,
                        system: e.target.checked,
                      }))
                    }
                  />
                  <span className="toggle-slider" />
                </label>

                <div className="form-actions" style={{ marginTop: "1rem" }}>
                  <button
                    className="btn btn--primary"
                    onClick={handleSaveNotifications}
                    disabled={savingNotifications}
                  >
                    {savingNotifications ? (
                      <>
                        <Loader2 className="spinner" size={16} />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {t("saveSettings")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
