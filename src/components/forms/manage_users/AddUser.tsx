"use client";

import React, { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import userService, { CreateUserData } from "@/services/userService";
import { User } from "@/components/types/userTypes";
import { toast } from "react-hot-toast";

interface NewUserFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "inactive";
  preferredLanguage: "vi" | "en" | "lo";
}

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: User) => void;
}

export const AddUser: React.FC<AddUserProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newUser, setNewUser] = useState<NewUserFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    status: "active",
    preferredLanguage: "vi",
  });

  const resetForm = () => {
    setNewUser({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      status: "active",
      preferredLanguage: "vi",
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newUser.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!newUser.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!newUser.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (newUser.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (newUser.password !== newUser.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const createData: CreateUserData = {
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        status: newUser.status,
        preferredLanguage: newUser.preferredLanguage,
      };

      const response = await userService.createUser(createData);

      if (response.success && response.data) {
        onUserAdded(response.data);
        toast.success("Người dùng mới đã được tạo thành công");
        resetForm();
        onClose();
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error("Có lỗi xảy ra khi tạo người dùng");
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Có lỗi xảy ra khi tạo người dùng" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>
            <Plus size={20} />
            Thêm người dùng mới
          </h2>
          <button className="modal__close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal__body">
          {errors.submit && (
            <div className="admin-form__error-banner">{errors.submit}</div>
          )}
          <div className="admin-form">
            <div className="admin-form__group">
              <label className="admin-form__label">
                Họ tên <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form__input ${errors.fullName ? "error" : ""}`}
                placeholder="Nhập họ tên"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
                }
              />
              {errors.fullName && (
                <span className="admin-form__error">{errors.fullName}</span>
              )}
            </div>
            <div className="admin-form__group">
              <label className="admin-form__label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`admin-form__input ${errors.email ? "error" : ""}`}
                placeholder="Nhập email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
              {errors.email && (
                <span className="admin-form__error">{errors.email}</span>
              )}
            </div>
            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label">
                  Mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className={`admin-form__input ${errors.password ? "error" : ""}`}
                  placeholder="Nhập mật khẩu"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                {errors.password && (
                  <span className="admin-form__error">{errors.password}</span>
                )}
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">
                  Xác nhận mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className={`admin-form__input ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="Nhập lại mật khẩu"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                {errors.confirmPassword && (
                  <span className="admin-form__error">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label">Vai trò</label>
                <select
                  className="admin-form__select"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
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
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
            <div className="admin-form__group">
              <label className="admin-form__label">Ngôn ngữ ưa thích</label>
              <select
                className="admin-form__select"
                value={newUser.preferredLanguage}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
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
            onClick={handleAddUser}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus size={16} />
                Thêm người dùng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
