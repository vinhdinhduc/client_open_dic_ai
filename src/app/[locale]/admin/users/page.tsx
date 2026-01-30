"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  MoreVertical,
  Mail,
  Shield,
  User as UserIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";

// Types
interface ModerationPermissions {
  categories: string[];
  permissions: ("terms" | "contributions" | "comments" | "suggestions")[];
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "user" | "moderator" | "admin";
  status: "active" | "inactive" | "banned";
  preferredLanguage: string;
  createdAt: string;
  lastLogin?: string;
  contributionCount: number;
  commentCount: number;
  moderationPermissions?: ModerationPermissions;
}

// Mock categories for assignment
const mockCategories = [
  { _id: "cat1", name: "Công nghệ thông tin" },
  { _id: "cat2", name: "Kinh tế - Tài chính" },
  { _id: "cat3", name: "Y học - Sức khỏe" },
  { _id: "cat4", name: "Nông nghiệp" },
  { _id: "cat5", name: "Luật - Pháp lý" },
  { _id: "cat6", name: "Sinh học" },
];

const permissionOptions = [
  { value: "terms", label: "Thuật ngữ", icon: "📚" },
  { value: "contributions", label: "Đóng góp", icon: "✍️" },
  { value: "comments", label: "Bình luận", icon: "💬" },
  { value: "suggestions", label: "Gợi ý sửa", icon: "📝" },
];

// Mock data
const mockUsers: User[] = [
  {
    _id: "1",
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    role: "user",
    status: "active",
    preferredLanguage: "vi",
    createdAt: "2025-10-15",
    lastLogin: "2026-01-30",
    contributionCount: 12,
    commentCount: 45,
  },
  {
    _id: "2",
    fullName: "Trần Thị B",
    email: "tranthib@email.com",
    role: "moderator",
    status: "active",
    preferredLanguage: "vi",
    createdAt: "2025-08-20",
    lastLogin: "2026-01-29",
    contributionCount: 56,
    commentCount: 123,
    moderationPermissions: {
      categories: ["cat1", "cat2"],
      permissions: ["terms", "contributions", "comments"],
    },
  },
  {
    _id: "3",
    fullName: "Boupha Sisouk",
    email: "boupha@email.com",
    role: "user",
    status: "active",
    preferredLanguage: "lo",
    createdAt: "2025-11-10",
    lastLogin: "2026-01-28",
    contributionCount: 8,
    commentCount: 32,
  },
  {
    _id: "4",
    fullName: "Lê Văn C",
    email: "levanc@email.com",
    role: "user",
    status: "banned",
    preferredLanguage: "vi",
    createdAt: "2025-09-05",
    lastLogin: "2026-01-15",
    contributionCount: 2,
    commentCount: 5,
  },
  {
    _id: "5",
    fullName: "Admin System",
    email: "admin@tbu.edu.vn",
    role: "admin",
    status: "active",
    preferredLanguage: "vi",
    createdAt: "2025-01-01",
    lastLogin: "2026-01-30",
    contributionCount: 0,
    commentCount: 0,
  },
  {
    _id: "6",
    fullName: "Moderator Lào",
    email: "mod.lao@email.com",
    role: "moderator",
    status: "active",
    preferredLanguage: "lo",
    createdAt: "2025-06-15",
    lastLogin: "2026-01-30",
    contributionCount: 34,
    commentCount: 89,
    moderationPermissions: {
      categories: ["cat3", "cat4"],
      permissions: ["terms", "suggestions"],
    },
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Permissions editing state
  const [editingPermissions, setEditingPermissions] =
    useState<ModerationPermissions>({
      categories: [],
      permissions: [],
    });

  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchStatus = statusFilter === "all" || user.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="admin-badge admin-badge--danger">Admin</span>;
      case "moderator":
        return (
          <span className="admin-badge admin-badge--warning">Moderator</span>
        );
      default:
        return <span className="admin-badge admin-badge--info">User</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="admin-badge admin-badge--success">Hoạt động</span>
        );
      case "inactive":
        return (
          <span className="admin-badge admin-badge--warning">
            Không hoạt động
          </span>
        );
      case "banned":
        return <span className="admin-badge admin-badge--danger">Bị khóa</span>;
      default:
        return null;
    }
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case "vi":
        return "🇻🇳";
      case "lo":
        return "🇱🇦";
      case "en":
        return "🇬🇧";
      default:
        return "🌐";
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === "banned" ? "active" : "banned";
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u)),
    );
    setActionMenuOpen(null);
  };

  const handleChangeRole = (
    userId: string,
    newRole: "user" | "moderator" | "admin",
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
    );
  };

  const handleDelete = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  const openPermissionsModal = (user: User) => {
    setSelectedUser(user);
    setEditingPermissions({
      categories: user.moderationPermissions?.categories || [],
      permissions: user.moderationPermissions?.permissions || [],
    });
    setShowPermissionsModal(true);
  };

  const handleToggleCategory = (categoryId: string) => {
    setEditingPermissions((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleTogglePermission = (
    permission: "terms" | "contributions" | "comments" | "suggestions",
  ) => {
    setEditingPermissions((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSavePermissions = () => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, moderationPermissions: editingPermissions }
            : u,
        ),
      );
      setShowPermissionsModal(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Quản lý người dùng</h1>
          <p className="admin-page-header__subtitle">
            Quản lý tài khoản và phân quyền người dùng hệ thống
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button className="admin-btn admin-btn--secondary">
            <Download size={16} />
            Xuất Excel
          </button>
          <button className="admin-btn admin-btn--primary">
            <Plus size={16} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        {/* Filters */}
        <div className="admin-filters">
          <div className="admin-filters__search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="admin-filters__select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="admin-filters__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="banned">Bị khóa</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngôn ngữ</th>
                <th>Đóng góp</th>
                <th>Đăng nhập cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-cell__avatar">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="user-cell__info">
                        <span className="user-cell__name">{user.fullName}</span>
                        <span className="user-cell__email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    <span className="language-cell">
                      {getLanguageFlag(user.preferredLanguage)}
                    </span>
                  </td>
                  <td>
                    <div className="contribution-cell">
                      <span>{user.contributionCount} thuật ngữ</span>
                      <span>{user.commentCount} bình luận</span>
                    </div>
                  </td>
                  <td>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
                      : "Chưa đăng nhập"}
                  </td>
                  <td>
                    <div className="action-cell">
                      <button
                        className="action-btn"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailModal(true);
                        }}
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      {user.role === "moderator" && (
                        <button
                          className="action-btn action-btn--primary"
                          onClick={() => openPermissionsModal(user)}
                          title="Phân quyền kiểm duyệt"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      <button
                        className="action-btn"
                        onClick={() => handleToggleStatus(user)}
                        title={user.status === "banned" ? "Mở khóa" : "Khóa"}
                      >
                        {user.status === "banned" ? (
                          <Unlock size={16} />
                        ) : (
                          <Lock size={16} />
                        )}
                      </button>
                      <button
                        className="action-btn action-btn--danger"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteConfirm(true);
                        }}
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <div className="admin-pagination__info">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} trong{" "}
            {filteredUsers.length} người dùng
          </div>
          <div className="admin-pagination__controls">
            <button
              className="admin-pagination__btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`admin-pagination__btn ${
                  page === currentPage ? "active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="admin-pagination__btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {showDetailModal && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Chi tiết người dùng</h2>
              <button
                className="modal__close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <div className="user-detail">
                <div className="user-detail__avatar">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <h3>{selectedUser.fullName}</h3>
                <p>{selectedUser.email}</p>
                <div className="user-detail__badges">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
              <div className="user-detail__stats">
                <div className="stat-item">
                  <span className="stat-label">Ngày tham gia</span>
                  <span className="stat-value">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Đăng nhập cuối</span>
                  <span className="stat-value">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleDateString(
                          "vi-VN",
                        )
                      : "Chưa đăng nhập"}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Thuật ngữ đóng góp</span>
                  <span className="stat-value">
                    {selectedUser.contributionCount}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Bình luận</span>
                  <span className="stat-value">
                    {selectedUser.commentCount}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Ngôn ngữ ưa thích</span>
                  <span className="stat-value">
                    {getLanguageFlag(selectedUser.preferredLanguage)}{" "}
                    {selectedUser.preferredLanguage.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Moderation Permissions (for moderators) */}
              {selectedUser.role === "moderator" && (
                <div className="moderation-permissions-detail">
                  <h4>
                    <Shield size={16} />
                    Quyền kiểm duyệt
                  </h4>
                  <div className="permissions-tags">
                    {selectedUser.moderationPermissions?.permissions?.length ? (
                      selectedUser.moderationPermissions.permissions.map(
                        (p) => (
                          <span key={p} className="permission-tag">
                            {permissionOptions.find((o) => o.value === p)?.icon}{" "}
                            {
                              permissionOptions.find((o) => o.value === p)
                                ?.label
                            }
                          </span>
                        ),
                      )
                    ) : (
                      <span className="no-permissions">
                        Chưa được phân quyền
                      </span>
                    )}
                  </div>
                  <div className="categories-tags">
                    <span className="categories-label">Danh mục:</span>
                    {selectedUser.moderationPermissions?.categories?.length ? (
                      selectedUser.moderationPermissions.categories.map(
                        (catId) => {
                          const cat = mockCategories.find(
                            (c) => c._id === catId,
                          );
                          return cat ? (
                            <span key={catId} className="category-tag">
                              {cat.name}
                            </span>
                          ) : null;
                        },
                      )
                    ) : (
                      <span className="all-categories">Tất cả danh mục</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              {selectedUser.role === "moderator" && (
                <button
                  className="admin-btn admin-btn--warning"
                  onClick={() => {
                    setShowDetailModal(false);
                    openPermissionsModal(selectedUser);
                  }}
                >
                  <Shield size={16} />
                  Phân quyền
                </button>
              )}
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowEditModal(true);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Chỉnh sửa người dùng</h2>
              <button
                className="modal__close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <div className="admin-form">
                <div className="admin-form__group">
                  <label className="admin-form__label">Họ tên</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    defaultValue={selectedUser.fullName}
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Email</label>
                  <input
                    type="email"
                    className="admin-form__input"
                    defaultValue={selectedUser.email}
                  />
                </div>
                <div className="admin-form__group">
                  <label className="admin-form__label">Vai trò</label>
                  <select
                    className="admin-form__select"
                    defaultValue={selectedUser.role}
                    onChange={(e) =>
                      handleChangeRole(
                        selectedUser._id,
                        e.target.value as "user" | "moderator" | "admin",
                      )
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
                    defaultValue={selectedUser.status}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="banned">Bị khóa</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => {
                  // Save logic
                  setShowEditModal(false);
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Xác nhận xóa</h2>
              <button
                className="modal__close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              <p>
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <strong>{selectedUser.fullName}</strong>?
              </p>
              <p className="text-danger">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => setShowPermissionsModal(false)}
        >
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>
                <Shield size={20} />
                Phân quyền kiểm duyệt
              </h2>
              <button
                className="modal__close"
                onClick={() => setShowPermissionsModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              {/* User Info */}
              <div className="permissions-user-info">
                <div className="user-cell__avatar">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h4>{selectedUser.fullName}</h4>
                  <p>{selectedUser.email}</p>
                </div>
                {getRoleBadge(selectedUser.role)}
              </div>

              {/* Permission Types */}
              <div className="permissions-section">
                <h4>Loại kiểm duyệt được phép</h4>
                <p className="permissions-section__desc">
                  Chọn các loại nội dung mà kiểm duyệt viên được phép xem xét
                </p>
                <div className="permissions-grid">
                  {permissionOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`permission-item ${
                        editingPermissions.permissions.includes(
                          option.value as any,
                        )
                          ? "permission-item--active"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editingPermissions.permissions.includes(
                          option.value as any,
                        )}
                        onChange={() =>
                          handleTogglePermission(option.value as any)
                        }
                      />
                      <span className="permission-item__icon">
                        {option.icon}
                      </span>
                      <span className="permission-item__label">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Assignment */}
              <div className="permissions-section">
                <h4>Danh mục được phân công</h4>
                <p className="permissions-section__desc">
                  Kiểm duyệt viên chỉ được kiểm duyệt nội dung trong các danh
                  mục được chọn
                </p>
                <div className="categories-grid">
                  {mockCategories.map((category) => (
                    <label
                      key={category._id}
                      className={`category-item ${
                        editingPermissions.categories.includes(category._id)
                          ? "category-item--active"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editingPermissions.categories.includes(
                          category._id,
                        )}
                        onChange={() => handleToggleCategory(category._id)}
                      />
                      <span className="category-item__name">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="permissions-summary">
                <div className="summary-item">
                  <span className="summary-label">Quyền:</span>
                  <span className="summary-value">
                    {editingPermissions.permissions.length === 0
                      ? "Chưa chọn"
                      : editingPermissions.permissions
                          .map(
                            (p) =>
                              permissionOptions.find((o) => o.value === p)
                                ?.label,
                          )
                          .join(", ")}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Danh mục:</span>
                  <span className="summary-value">
                    {editingPermissions.categories.length === 0
                      ? "Tất cả danh mục"
                      : `${editingPermissions.categories.length} danh mục`}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowPermissionsModal(false)}
              >
                Hủy
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleSavePermissions}
              >
                <Shield size={16} />
                Lưu phân quyền
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .table-container {
          overflow-x: auto;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-cell__avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }

        .user-cell__info {
          display: flex;
          flex-direction: column;
        }

        .user-cell__name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .user-cell__email {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .language-cell {
          font-size: 20px;
        }

        .contribution-cell {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .action-cell {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .action-btn--danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal {
          background: var(--bg-card);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal--sm {
          max-width: 400px;
        }

        .modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal__header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .modal__close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
        }

        .modal__close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .modal__body {
          padding: 24px;
          overflow-y: auto;
        }

        .modal__footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
        }

        .user-detail {
          text-align: center;
          margin-bottom: 24px;
        }

        .user-detail__avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 32px;
          margin: 0 auto 16px;
        }

        .user-detail h3 {
          margin: 0 0 4px;
          font-size: 20px;
        }

        .user-detail p {
          margin: 0 0 12px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .user-detail__badges {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .user-detail__stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .stat-item {
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .stat-value {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .text-danger {
          color: #ef4444;
          font-size: 14px;
        }

        /* Permissions Modal Styles */
        .action-btn--primary:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .modal--lg {
          max-width: 600px;
        }

        .modal__header h2 {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .permissions-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .permissions-user-info h4 {
          margin: 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        .permissions-user-info p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .permissions-section {
          margin-bottom: 24px;
        }

        .permissions-section h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .permissions-section__desc {
          margin: 0 0 12px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .permission-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border: 2px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .permission-item input {
          display: none;
        }

        .permission-item:hover {
          border-color: #667eea;
        }

        .permission-item--active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .permission-item__icon {
          font-size: 20px;
        }

        .permission-item__label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-item input {
          display: none;
        }

        .category-item:hover {
          border-color: #10b981;
        }

        .category-item--active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .category-item__name {
          font-size: 13px;
          color: var(--text-primary);
        }

        .permissions-summary {
          padding: 16px;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.1) 0%,
            rgba(118, 75, 162, 0.1) 100%
          );
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .summary-item:last-child {
          margin-bottom: 0;
        }

        .summary-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .summary-value {
          font-size: 13px;
          color: var(--text-primary);
        }

        /* Moderation permissions in detail modal */
        .moderation-permissions-detail {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.05) 0%,
            rgba(118, 75, 162, 0.05) 100%
          );
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
        }

        .moderation-permissions-detail h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
        }

        .permissions-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .permission-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .no-permissions {
          font-size: 13px;
          color: var(--text-secondary);
          font-style: italic;
        }

        .categories-tags {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .categories-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .category-tag {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 16px;
          font-size: 12px;
        }

        .all-categories {
          font-size: 12px;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .permissions-grid,
          .categories-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
