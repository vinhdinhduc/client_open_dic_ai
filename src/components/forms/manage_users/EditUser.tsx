"use client";

import React, { useState, useEffect } from "react";
import { X, Edit, Loader2 } from "lucide-react";
import userService from "@/services/userService";
import { User, UpdateUserData } from "@/types";
import { toast } from "react-hot-toast";

interface EditUserFormData {
  fullName: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "inactive" | "banned";
  preferredLanguage: "vi" | "en" | "lo";
}

interface EditUserProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

export const EditUser: React.FC<EditUserProps> = ({
  isOpen,
  user,
  onClose,
  onUserUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<EditUserFormData>({
    fullName: "",
    role: "user",
    status: "active",
    preferredLanguage: "vi",
  });

  // Điền biểu mẫu khi người dùng thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage || "vi",
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const updateData: UpdateUserData = {
        fullName: formData.fullName,
        role: formData.role,
        status: formData.status,
        preferredLanguage: formData.preferredLanguage,
      };

      const response = await userService.updateUser(user._id, updateData);

      if (response.success && response.data) {
        toast.success("Cập nhật người dùng thành công");
        onUserUpdated(response.data);
        onClose();
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error("Có lỗi xảy ra khi cập nhật người dùng");
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Có lỗi xảy ra khi cập nhật người dùng" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>
            <Edit size={20} />
            Chỉnh sửa người dùng
          </h2>
          <button className="modal__close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">
          {errors.submit && (
            <div className="admin-form__error-banner">{errors.submit}</div>
          )}

          {/* User Info Header */}
          <div className="edit-user-header">
            <div className="edit-user-header__avatar">
              {user.fullName.charAt(0)}
            </div>
            <div className="edit-user-header__info">
              <span className="edit-user-header__email">{user.email}</span>
              <span className="edit-user-header__joined">
                Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          <div className="admin-form">
            <div className="admin-form__group">
              <label className="admin-form__label">
                Họ tên <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form__input ${errors.fullName ? "error" : ""}`}
                placeholder="Nhập họ tên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              {errors.fullName && (
                <span className="admin-form__error">{errors.fullName}</span>
              )}
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label">Vai trò</label>
                <select
                  className="admin-form__select"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "user" | "moderator" | "admin",
                    })
                  }
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Trạng thái</label>
                <select
                  className="admin-form__select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "active"
                        | "inactive"
                        | "banned",
                    })
                  }
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="banned">Bị khóa</option>
                </select>
              </div>
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Ngôn ngữ ưa thích</label>
              <select
                className="admin-form__select"
                value={formData.preferredLanguage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredLanguage: e.target.value as "vi" | "en" | "lo",
                  })
                }
              >
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇬🇧 English</option>
                <option value="lo">🇱🇦 ລາວ</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Edit size={16} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
