"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import "../settings/settings.scss";
import "./profile.scss";

export default function AdminProfileClient() {
  const { user, updateUser, refreshProfile } = useAuth();
  const t = useTranslations("adminProfile");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error(t("nameRequired"));
      return;
    }
    setIsSaving(true);
    try {
      const response = await authService.updateProfile({ fullName: fullName.trim() } as any);
      if (response.success) {
        updateUser({ fullName: fullName.trim() } as any);
        toast.success(t("updateSuccess"));
        setIsEditing(false);
      }
    } catch {
      toast.error(t("updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    const isGoogleOnly = (user as any)?.authProvider === "google" && !(user as any)?.hasPassword;

    if (!isGoogleOnly && !currentPassword) {
      toast.error(t("currentPasswordRequired"));
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error(t("fillAllFields"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await authService.changePassword(
        isGoogleOnly ? undefined : currentPassword,
        newPassword,
      );
      if (response.success) {
        toast.success(t("passwordChangeSuccess"));
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        await refreshProfile();
      }
    } catch {
      toast.error(t("passwordChangeError"));
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return t("roleAdmin");
      case "moderator": return t("roleModerator");
      default: return t("roleUser");
    }
  };

  return (
    <div className="admin-profile">
      <div className="admin-profile__header">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </div>

      <div className="admin-profile__grid">
        {/* Personal Info Card */}
        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div className="admin-profile__card-title">
              <User size={20} />
              <span>{t("personalInfo")}</span>
            </div>
            {!isEditing && (
              <button
                className="admin-profile__btn-edit"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={15} />
                {t("edit")}
              </button>
            )}
          </div>

          <div className="admin-profile__card-body">
            {isEditing ? (
              <div className="admin-profile__edit-form">
                <div className="admin-profile__form-group">
                  <label>
                    <User size={15} />
                    {t("fullName")}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("fullNamePlaceholder")}
                  />
                </div>

                <div className="admin-profile__form-actions">
                  <button
                    className="admin-profile__btn admin-profile__btn--secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFullName(user?.fullName || "");
                    }}
                    disabled={isSaving}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    className="admin-profile__btn admin-profile__btn--primary"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <><Loader2 size={15} className="spin" /> {t("saving")}</>
                    ) : (
                      <><Save size={15} /> {t("saveChanges")}</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-profile__info-list">
                <div className="admin-profile__info-item">
                  <User size={17} />
                  <div>
                    <span className="label">{t("fullName")}</span>
                    <span className="value">{user?.fullName}</span>
                  </div>
                </div>
                <div className="admin-profile__info-item">
                  <Mail size={17} />
                  <div>
                    <span className="label">{t("email")}</span>
                    <span className="value">{user?.email}</span>
                  </div>
                </div>
                <div className="admin-profile__info-item">
                  <Shield size={17} />
                  <div>
                    <span className="label">{t("role")}</span>
                    <span className="value value--badge">{getRoleLabel(user?.role || "user")}</span>
                  </div>
                </div>
                <div className="admin-profile__info-item">
                  <Calendar size={17} />
                  <div>
                    <span className="label">{t("joinDate")}</span>
                    <span className="value">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div className="admin-profile__card-title">
              <Lock size={20} />
              <span>{t("security")}</span>
            </div>
            {!isChangingPassword && (
              <button
                className="admin-profile__btn-edit"
                onClick={() => setIsChangingPassword(true)}
              >
                <KeyRound size={15} />
                {t("changePassword")}
              </button>
            )}
          </div>

          <div className="admin-profile__card-body">
            {isChangingPassword ? (
              <div className="admin-profile__edit-form">
                {!((user as any)?.authProvider === "google" && !(user as any)?.hasPassword) && (
                  <div className="admin-profile__form-group">
                    <label>{t("currentPassword")}</label>
                    <div className="admin-profile__input-wrap">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                        }
                        placeholder={t("currentPasswordPlaceholder")}
                      />
                      <button
                        type="button"
                        className="admin-profile__eye-btn"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="admin-profile__form-group">
                  <label>{t("newPassword")}</label>
                  <div className="admin-profile__input-wrap">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      placeholder={t("minChars")}
                    />
                    <button
                      type="button"
                      className="admin-profile__eye-btn"
                      onClick={() => setShowNewPassword((v) => !v)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="admin-profile__form-group">
                  <label>{t("confirmPassword")}</label>
                  <div className="admin-profile__input-wrap">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      placeholder={t("confirmPasswordPlaceholder")}
                    />
                    <button
                      type="button"
                      className="admin-profile__eye-btn"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="admin-profile__form-actions">
                  <button
                    className="admin-profile__btn admin-profile__btn--secondary"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    disabled={isSaving}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    className="admin-profile__btn admin-profile__btn--primary"
                    onClick={handleChangePassword}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <><Loader2 size={15} className="spin" /> {t("saving")}</>
                    ) : (
                      <><Save size={15} /> {t("confirm")}</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="admin-profile__security-hint">
                {t("passwordNote")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
