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
import "../settings/settings.scss";
import "./profile.scss";

export default function AdminProfileClient() {
  const { user, updateUser, refreshProfile } = useAuth();

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
      toast.error("Họ tên là bắt buộc");
      return;
    }
    setIsSaving(true);
    try {
      const response = await authService.updateProfile({ fullName: fullName.trim() } as any);
      if (response.success) {
        updateUser({ fullName: fullName.trim() } as any);
        toast.success("Cập nhật thành công");
        setIsEditing(false);
      }
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    const isGoogleOnly = (user as any)?.authProvider === "google" && !(user as any)?.hasPassword;

    if (!isGoogleOnly && !currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authService.changePassword(
        isGoogleOnly ? undefined : currentPassword,
        newPassword,
      );
      if (response.success) {
        toast.success("Đổi mật khẩu thành công");
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        await refreshProfile();
      }
    } catch {
      toast.error("Đổi mật khẩu thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Quản trị viên";
      case "moderator": return "Kiểm duyệt viên";
      default: return "Người dùng";
    }
  };

  return (
    <div className="admin-profile">
      <div className="admin-profile__header">
        <h1>Tài khoản</h1>
        <p>Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="admin-profile__grid">
        {/* Personal Info Card */}
        <div className="admin-profile__card">
          <div className="admin-profile__card-header">
            <div className="admin-profile__card-title">
              <User size={20} />
              <span>Thông tin cá nhân</span>
            </div>
            {!isEditing && (
              <button
                className="admin-profile__btn-edit"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={15} />
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="admin-profile__card-body">
            {isEditing ? (
              <div className="admin-profile__edit-form">
                <div className="admin-profile__form-group">
                  <label>
                    <User size={15} />
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
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
                    Hủy
                  </button>
                  <button
                    className="admin-profile__btn admin-profile__btn--primary"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <><Loader2 size={15} className="spin" /> Đang lưu...</>
                    ) : (
                      <><Save size={15} /> Lưu thay đổi</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-profile__info-list">
                <div className="admin-profile__info-item">
                  <User size={17} />
                  <div>
                    <span className="label">Họ và tên</span>
                    <span className="value">{user?.fullName}</span>
                  </div>
                </div>
                <div className="admin-profile__info-item">
                  <Mail size={17} />
                  <div>
                    <span className="label">Email</span>
                    <span className="value">{user?.email}</span>
                  </div>
                </div>
                <div className="admin-profile__info-item">
                  <Shield size={17} />
                  <div>
                    <span className="label">Vai trò</span>
                    <span className="value value--badge">{getRoleLabel(user?.role || "user")}</span>
                  </div>
                </div>
                <div className="admin-profile__info-item">
                  <Calendar size={17} />
                  <div>
                    <span className="label">Ngày tham gia</span>
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
              <span>Bảo mật</span>
            </div>
            {!isChangingPassword && (
              <button
                className="admin-profile__btn-edit"
                onClick={() => setIsChangingPassword(true)}
              >
                <KeyRound size={15} />
                Đổi mật khẩu
              </button>
            )}
          </div>

          <div className="admin-profile__card-body">
            {isChangingPassword ? (
              <div className="admin-profile__edit-form">
                {!((user as any)?.authProvider === "google" && !(user as any)?.hasPassword) && (
                  <div className="admin-profile__form-group">
                    <label>Mật khẩu hiện tại</label>
                    <div className="admin-profile__input-wrap">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))
                        }
                        placeholder="Nhập mật khẩu hiện tại"
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
                  <label>Mật khẩu mới</label>
                  <div className="admin-profile__input-wrap">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      placeholder="Ít nhất 6 ký tự"
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
                  <label>Xác nhận mật khẩu mới</label>
                  <div className="admin-profile__input-wrap">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      placeholder="Nhập lại mật khẩu mới"
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
                    Hủy
                  </button>
                  <button
                    className="admin-profile__btn admin-profile__btn--primary"
                    onClick={handleChangePassword}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <><Loader2 size={15} className="spin" /> Đang lưu...</>
                    ) : (
                      <><Save size={15} /> Xác nhận</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="admin-profile__security-hint">
                Mật khẩu nên được thay đổi định kỳ để bảo vệ tài khoản. Nhấn{" "}
                <strong>Đổi mật khẩu</strong> để cập nhật.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
