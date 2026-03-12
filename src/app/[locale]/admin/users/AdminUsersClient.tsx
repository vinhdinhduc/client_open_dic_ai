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
  Flag,
  Lightbulb,
  BookPlus,
  MessageSquare,
  Globe,
  Key,
  Send,
  History,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import userService from "@/services/userService";
import categoryService, { Category } from "@/services/categoryService";
import { User, GetUsersParams, UserRole, UserStatus } from "@/types";
import "./page.scss";
import { AddUser } from "@/components/forms/manage_users/AddUser";
import { EditUser } from "@/components/forms/manage_users/EditUser";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const getLanguageFlag = (lang: string) => {
  switch (lang) {
    case "vi":
      return "🇻🇳";
    case "en":
      return "🇬🇧";
    case "lo":
      return "🇱🇦";
    default:
      return <Globe size={16} />;
  }
};

// Types
interface ModerationPermissions {
  categories: string[];
  permissions: ("reports" | "suggestions" | "contributions" | "comments")[];
}

export default function UsersPage() {
  const t = useTranslations("adminUsers");

  const permissionOptions = [
    { value: "reports", label: t("permReviewReports"), icon: <Flag size={18} /> },
    { value: "suggestions", label: t("permSuggestEdits"), icon: <Lightbulb size={18} /> },
    {
      value: "contributions",
      label: t("permContributeTerms"),
      icon: <BookPlus size={18} />,
    },
    { value: "comments", label: t("permComments"), icon: <MessageSquare size={18} /> },
  ];

  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingResetPassword, setLoadingResetPassword] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBatchActionsModal, setShowBatchActionsModal] = useState(false);
  const [batchStatus, setBatchStatus] = useState<UserStatus>("active");
  const [activityData, setActivityData] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Permissions editing state
  const [editingPermissions, setEditingPermissions] =
    useState<ModerationPermissions>({
      categories: [],
      permissions: [],
    });
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".action-dropdown")) {
        setShowMoreMenu(null);
      }
    };

    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showMoreMenu]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResult = await categoryService.getCategories();
        if (categoriesResult.success && Array.isArray(categoriesResult.data)) {
          setCategories(categoriesResult.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch users when page or filters change
  useEffect(() => {
    const fetchUsers = async () => {
      // Chỉ set tableLoading nếu không phải lần load đầu tiên
      if (!initialLoading) {
        setTableLoading(true);
      }
      try {
        const params: GetUsersParams = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (roleFilter !== "all") {
          params.role = roleFilter as UserRole;
        }
        if (statusFilter !== "all") {
          params.status = statusFilter as UserStatus;
        }
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const usersResult = await userService.getUsers(params);
        setUsers(usersResult.data.users || []);
        setTotalUsers(usersResult.data.pagination?.total || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setInitialLoading(false);
        setTableLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, debouncedSearch, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, debouncedSearch, itemsPerPage]);

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  // Function to refresh users list
  const refreshUsers = async () => {
    setTableLoading(true);
    try {
      const params: GetUsersParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (roleFilter !== "all") {
        params.role = roleFilter as UserRole;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter as UserStatus;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const usersResult = await userService.getUsers(params);
      setUsers(usersResult.data.users || []);
      setTotalUsers(usersResult.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setTableLoading(false);
    }
  };

  // Tạo danh sách số trang cho phân trang
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang nếu tổng số trang nhỏ hơn hoặc bằng giới hạn
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      //Luôn hiển thị trang đầu tiên khi số trang lớn hơn giới hạn
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Luôn luôn hiển thị các trang xung quanh trang hiện tại
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

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
  const handleExportUser = async () => {
    if (
      !confirm(t("confirmExport"))
    ) {
      return;
    }
    setTableLoading(true);
    try {
      const blob = await userService.exportUsersToExcel();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with current date
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
      link.download = `nguoi-dung-${dateStr}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t("exportSuccess"));
    } catch (error) {
      toast.error(t("exportError"));
    } finally {
      setTableLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="admin-badge admin-badge--success">{t("active")}</span>
        );
      case "inactive":
        return (
          <span className="admin-badge admin-badge--warning">
            {t("inactive")}
          </span>
        );
      case "banned":
        return <span className="admin-badge admin-badge--danger">{t("locked")}</span>;
      default:
        return null;
    }
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setShowLockConfirm(true);
  };

  const confirmToggleStatus = async () => {
    if (selectedUser) {
      const newStatus = selectedUser.status === "banned" ? "active" : "banned";
      setTableLoading(true);
      try {
        const res = await userService.updateUser(selectedUser._id, {
          status: newStatus,
        });
        if (res.success) {
          toast.success(
            newStatus === "banned"
              ? t("lockedSuccess")
              : t("unlockedSuccess"),
          );
          refreshUsers();
        }
      } catch (error) {
        toast.error(t("statusUpdateError"));
      } finally {
        setTableLoading(false);
        setShowLockConfirm(false);
        setSelectedUser(null);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      setShowDeleteConfirm(false);
      setTableLoading(true);
      try {
        const res = await userService.deleteUser(selectedUser._id);
        if (res.success) {
          toast.success(t("deleteSuccess"));
          refreshUsers();
        }
      } catch (error) {
        toast.error(t("deleteError"));
      } finally {
        setTableLoading(false);
        setSelectedUser(null);
      }
    }
  };

  const openPermissionsModal = (user: User) => {
    setSelectedUser(user);
    setEditingPermissions({
      categories: user.moderationPermissions?.categories || [],
      permissions: (user.moderationPermissions?.permissions || []) as (
        | "reports"
        | "suggestions"
        | "contributions"
        | "comments"
      )[],
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
    permission: "reports" | "suggestions" | "contributions" | "comments",
  ) => {
    setEditingPermissions((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSelectAllPermissions = () => {
    setEditingPermissions((prev) => ({
      ...prev,
      permissions: permissionOptions.map((o) => o.value) as (
        | "reports"
        | "suggestions"
        | "contributions"
        | "comments"
      )[],
    }));
  };

  const handleClearAllPermissions = () => {
    setEditingPermissions((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const handleSelectAllCategories = () => {
    setEditingPermissions((prev) => ({
      ...prev,
      categories: categories.map((c) => c.id),
    }));
  };

  const handleClearAllCategories = () => {
    setEditingPermissions((prev) => ({
      ...prev,
      categories: [],
    }));
  };

  const handleSavePermissions = async () => {
    if (selectedUser) {
      setSavingPermissions(true);
      try {
        const res = await userService.updateUser(selectedUser._id, {
          moderationPermissions: {
            categories: editingPermissions.categories,
            permissions: editingPermissions.permissions,
          },
        });
        if (res.success) {
          toast.success(t("permissionsUpdateSuccess"));
          refreshUsers();
          setShowPermissionsModal(false);
          setSelectedUser(null);
        }
      } catch (error) {
        toast.error(t("permissionsUpdateError"));
      } finally {
        setSavingPermissions(false);
      }
    }
  };
  const handleShowModalAddUser = () => {
    setShowAddModal(true);
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }

    setLoadingResetPassword(true);
    try {
      const res = await userService.resetUserPassword(
        selectedUser._id,
        newPassword,
      );
      if (res.success) {
        toast.success(t("resetPasswordSuccess"));
        setShowResetPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error(t("resetPasswordError"));
    } finally {
      setLoadingResetPassword(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: score, label: t("passwordVeryWeak"), color: "#ef4444" };
    if (score === 2) return { level: score, label: t("passwordWeak"), color: "#f97316" };
    if (score === 3)
      return { level: score, label: t("passwordMedium"), color: "#eab308" };
    if (score === 4) return { level: score, label: t("passwordStrong"), color: "#22c55e" };
    return { level: score, label: t("passwordVeryStrong"), color: "#16a34a" };
  };

  // Handle resend verification email
  const handleResendVerification = async (user: User) => {
    try {
      const res = await userService.resendVerificationEmail(user._id);
      if (res.success) {
        toast.success(t("verificationResent"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("genericError"));
    }
  };

  // Handle batch update status
  const handleBatchUpdateStatus = async () => {
    if (selectedUsers.length === 0) {
      toast.error(t("selectAtLeastOne"));
      return;
    }

    try {
      const res = await userService.batchUpdateStatus(
        selectedUsers,
        batchStatus,
      );
      if (res.success) {
        toast.success(res.message);
        setShowBatchActionsModal(false);
        setSelectedUsers([]);
        refreshUsers();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("genericError"));
    }
  };

  // Handle view activity
  const handleViewActivity = async (user: User) => {
    setSelectedUser(user);
    setShowActivityModal(true);
    setLoadingActivity(true);

    try {
      const res = await userService.getUserActivity(user._id, {
        page: 1,
        limit: 20,
      });
      if (res.success) {
        setActivityData(res.data);
      }
    } catch (error) {
      toast.error(t("activityLoadError"));
    } finally {
      setLoadingActivity(false);
    }
  };

  // Toggle select user
  const handleToggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Select all users
  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u._id));
    }
  };

  // Chỉ hiển thị full page loading khi load lần đầu
  if (initialLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="users-page">
        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-header__title">{t("title")}</h1>
            <p className="admin-page-header__subtitle">
              {t("subtitle")}
            </p>
          </div>
          <div className="admin-page-header__actions">
            <button
              className="admin-btn admin-btn--secondary"
              onClick={handleExportUser}
            >
              <Download size={16} />
              {t("exportExcel")}
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleShowModalAddUser}
            >
              <Plus size={16} />
              {t("addUser")}
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
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="admin-filters__select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">{t("allRoles")}</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>

            <select
              className="admin-filters__select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
              <option value="banned">{t("locked")}</option>
            </select>

            {selectedUsers.length > 0 && (
              <button
                className="admin-btn admin-btn--warning"
                onClick={() => setShowBatchActionsModal(true)}
              >
                {t("actionsCount", { count: selectedUsers.length })}
              </button>
            )}
          </div>

          {/* Table */}
          <div
            className={`table-container ${tableLoading ? "table-container--loading" : ""}`}
          >
            {tableLoading && (
              <div className="table-loading-overlay">
                <div className="admin-loading__spinner"></div>
              </div>
            )}
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === users.length &&
                        users.length > 0
                      }
                      onChange={handleSelectAllUsers}
                    />
                  </th>
                  <th>{t("user")}</th>
                  <th>{t("role")}</th>
                  <th>{t("status")}</th>
                  <th>{t("contributions")}</th>
                  <th>{t("lastLogin")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleToggleSelectUser(user._id)}
                        disabled={user.role === "admin"}
                      />
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell__avatar">
                          {user.fullName.charAt(0)}
                        </div>
                        <div className="user-cell__info">
                          <span className="user-cell__name">
                            {user.fullName}
                          </span>
                          <span className="user-cell__email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.status)}</td>

                    <td>
                      <div className="contribution-cell">
                        <span>{user.contributionCount} {t("terms")}</span>
                        <span>{user.commentCount} {t("comments")}</span>
                      </div>
                    </td>
                    <td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("vi-VN")
                        : t("notLoggedIn")}
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          className="action-btn"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailModal(true);
                          }}
                          title={t("viewDetails")}
                        >
                          <Eye size={16} color="blue" />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          title={t("editUser")}
                        >
                          <Edit size={16} color="orange" />
                        </button>
                        {user.role === "moderator" && (
                          <button
                            className="action-btn action-btn--primary"
                            onClick={() => openPermissionsModal(user)}
                            title={t("assignModPermissions")}
                          >
                            <Shield size={16} color="#11998e" />
                          </button>
                        )}

                        {/* More Menu Dropdown */}
                        <div className="action-dropdown">
                          <button
                            className="action-btn action-btn--more"
                            onClick={() =>
                              setShowMoreMenu(
                                showMoreMenu === user._id ? null : user._id,
                              )
                            }
                            title={t("more")}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {showMoreMenu === user._id && (
                            <div className="action-dropdown__menu">
                              <button
                                onClick={() => {
                                  handleViewActivity(user);
                                  setShowMoreMenu(null);
                                }}
                              >
                                <History size={14} />
                                {t("viewActivity")}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowResetPasswordModal(true);
                                  setShowMoreMenu(null);
                                }}
                              >
                                <Key size={14} />
                                {t("resetPassword")}
                              </button>
                              {!user.emailVerified && (
                                <button
                                  onClick={() => {
                                    handleResendVerification(user);
                                    setShowMoreMenu(null);
                                  }}
                                >
                                  <Send size={14} />
                                  {t("resendVerification")}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleToggleStatus(user);
                                  setShowMoreMenu(null);
                                }}
                              >
                                {user.status === "banned" ? (
                                  <>
                                    <Unlock size={14} />
                                    {t("unlock")}
                                  </>
                                ) : (
                                  <>
                                    <Lock size={14} />
                                    {t("lockAccount")}
                                  </>
                                )}
                              </button>
                              <button
                                className="danger"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteConfirm(true);
                                  setShowMoreMenu(null);
                                }}
                              >
                                <Trash2 size={14} />
                                {t("deleteUser")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalUsers > 0 && (
            <div className="admin-pagination">
              <div className="admin-pagination__info">
                <label htmlFor="itemsPerPage">{t("perPage")}</label>
                <select
                  name="itemsPerPage"
                  id="itemsPerPage"
                  className="admin-pagination__options"
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  value={itemsPerPage}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <p>
                  {t("showing")} {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalUsers)} {t("of")}{" "}
                  {totalUsers} {t("usersLabel")}
                </p>
              </div>
              <div className="admin-pagination__controls">
                <button
                  className="admin-pagination__btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  title={t("firstPage")}
                >
                  <ChevronLeft size={16} color="blue" />
                  <ChevronLeft
                    size={16}
                    style={{ marginLeft: -8 }}
                    color="blue"
                  />
                </button>
                <button
                  className="admin-pagination__btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  title={t("previousPage")}
                >
                  <ChevronLeft size={16} color="blue" />
                </button>
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="admin-pagination__ellipsis"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`admin-pagination__btn ${
                        page === currentPage ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  className="admin-pagination__btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  title={t("nextPage")}
                >
                  <ChevronRight size={16} color="blue" />
                </button>
                <button
                  className="admin-pagination__btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(totalPages)}
                  title={t("lastPage")}
                >
                  <ChevronRight size={16} color="blue" />
                  <ChevronRight
                    size={16}
                    style={{ marginLeft: -8 }}
                    color="blue"
                  />
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {users.length === 0 && !tableLoading && (
            <div className="admin-empty-state">
              <UserIcon size={48} />
              <h3>{t("noUsersFound")}</h3>
              <p>{t("noUsersHint")}</p>
            </div>
          )}
        </div>

        {/* View Detail Modal */}
        {showDetailModal && selectedUser && (
          <div
            className="modal-overlay"
            onClick={() => setShowDetailModal(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h2>{t("userDetails")}</h2>
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
                    <span className="stat-label">{t("joinDate")}</span>
                    <span className="stat-value">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t("lastLogin")}</span>
                    <span className="stat-value">
                      {selectedUser.lastLogin
                        ? new Date(selectedUser.lastLogin).toLocaleDateString(
                            "vi-VN",
                          )
                        : t("notLoggedIn")}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t("termsContributed")}</span>
                    <span className="stat-value">
                      {selectedUser.contributionCount}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t("commentsActivity")}</span>
                    <span className="stat-value">
                      {selectedUser.commentCount}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t("preferredLanguage")}</span>
                    <span className="stat-value">
                      {getLanguageFlag(selectedUser.preferredLanguage || "vi")}{" "}
                      {(selectedUser.preferredLanguage || "vi").toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Moderation Permissions (for moderators) */}
                {selectedUser.role === "moderator" && (
                  <div className="moderation-permissions-detail">
                    <h4>
                      <Shield size={16} />
                      {t("moderatorPermissions")}
                    </h4>
                    <div className="permissions-tags">
                      {selectedUser.moderationPermissions?.permissions
                        ?.length ? (
                        selectedUser.moderationPermissions.permissions.map(
                          (p) => (
                            <span key={p} className="permission-tag">
                              {
                                permissionOptions.find((o) => o.value === p)
                                  ?.icon
                              }{" "}
                              {
                                permissionOptions.find((o) => o.value === p)
                                  ?.label
                              }
                            </span>
                          ),
                        )
                      ) : (
                        <span className="no-permissions">
                          {t("notAssigned")}
                        </span>
                      )}
                    </div>
                    <div className="categories-tags">
                      <span className="categories-label">{t("categoryLabel")}</span>
                      {selectedUser.moderationPermissions?.categories
                        ?.length ? (
                        selectedUser.moderationPermissions.categories.map(
                          (catId) => {
                            const cat = categories.find((c) => c._id === catId);
                            return cat ? (
                              <span key={catId} className="category-tag">
                                {typeof cat.name === "string"
                                  ? cat.name
                                  : cat.name.vi}
                              </span>
                            ) : null;
                          },
                        )
                      ) : (
                        <span className="all-categories">{t("allCategories")}</span>
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
                  {t("close")}
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
                    {t("assignPermissions")}
                  </button>
                )}
                <button
                  className="admin-btn admin-btn--primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowEditModal(true);
                  }}
                >
                  {t("editUser")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lock Confirm Modal */}
        {showLockConfirm && selectedUser && (
          <div
            className="modal-overlay"
            onClick={() => setShowLockConfirm(false)}
          >
            <div
              className="modal modal--sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <h2>
                  {selectedUser.status === "banned"
                    ? t("confirmUnlock")
                    : t("confirmLock")}
                </h2>
                <button
                  className="modal__close"
                  onClick={() => setShowLockConfirm(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal__body">
                <p>
                  {selectedUser.status === "banned"
                    ? t("confirmUnlockMsg", { name: selectedUser.fullName })
                    : t("confirmLockMsg", { name: selectedUser.fullName })}
                </p>
                {selectedUser.status !== "banned" && (
                  <p className="text-warning">
                    {t("lockWarning")}
                  </p>
                )}
              </div>
              <div className="modal__footer">
                <button
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowLockConfirm(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  className={`admin-btn ${
                    selectedUser.status === "banned"
                      ? "admin-btn--success"
                      : "admin-btn--warning"
                  }`}
                  onClick={confirmToggleStatus}
                  disabled={tableLoading}
                >
                  {tableLoading
                    ? t("processing")
                    : selectedUser.status === "banned"
                      ? t("unlock")
                      : t("lockAccount")}
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
            <div
              className="modal modal--sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <h2>{t("confirmDelete")}</h2>
                <button
                  className="modal__close"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal__body">
                <p>
                  {t("confirmDeleteMsg", { name: selectedUser.fullName })}
                </p>
                <p className="text-danger">{t("deleteIrreversible")}</p>
              </div>
              <div className="modal__footer">
                <button
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  className="admin-btn admin-btn--danger"
                  onClick={handleDelete}
                  disabled={tableLoading}
                >
                  {tableLoading ? t("deleting") : t("deleteUser")}
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
            <div
              className="modal modal--lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <h2>
                  <Shield size={20} />
                  {t("modPermissionsTitle")}
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
                  <div className="permissions-section__header">
                    <div>
                      <h4>{t("allowedModTypes")}</h4>
                      <p className="permissions-section__desc">
                        {t("allowedModTypesHint")}
                      </p>
                    </div>
                    <div className="permissions-section__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleSelectAllPermissions}
                      >
                        {t("selectAll")}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleClearAllPermissions}
                      >
                        {t("deselectAll")}
                      </button>
                    </div>
                  </div>
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
                  <div className="permissions-section__header">
                    <div>
                      <h4>{t("assignedCategories")}</h4>
                      <p className="permissions-section__desc">
                        {t("assignedCategoriesHint")}
                      </p>
                    </div>
                    <div className="permissions-section__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleSelectAllCategories}
                      >
                        {t("selectAll")}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleClearAllCategories}
                      >
                        {t("deselectAll")}
                      </button>
                    </div>
                  </div>
                  <div className="categories-grid">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className={`category-item ${
                          editingPermissions.categories.includes(category.id)
                            ? "category-item--active"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editingPermissions.categories.includes(
                            category.id,
                          )}
                          onChange={() => handleToggleCategory(category.id)}
                        />
                        <span className="category-item__name">
                          <i></i>
                          {typeof category.name === "string"
                            ? category.name
                            : category.name.vi}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="permissions-summary">
                  <div className="summary-item">
                    <span className="summary-label">{t("permissionsSummary")}</span>
                    <span className="summary-value">
                      {editingPermissions.permissions.length === 0
                        ? t("notSelected")
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
                    <span className="summary-label">{t("categoryLabel")}</span>
                    <span className="summary-value">
                      {editingPermissions.categories.length === 0
                        ? t("allCategories")
                        : t("nCategories", { count: editingPermissions.categories.length })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowPermissionsModal(false)}
                >
                  {t("cancel")}
                </button>
                <button
                  className="admin-btn admin-btn--primary"
                  onClick={handleSavePermissions}
                  disabled={savingPermissions}
                >
                  {savingPermissions ? (
                    <>{t("saving")}</>
                  ) : (
                    <>
                      <Shield size={16} />
                      {t("savePermissions")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <AddUser
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={() => {
          refreshUsers();
        }}
      />
      <EditUser
        isOpen={showEditModal}
        user={selectedUser}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={() => {
          refreshUsers();
        }}
      />

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowResetPasswordModal(false);
            setNewPassword("");
            setConfirmPassword("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);
          }}
        >
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>
                <Key size={20} />
                {t("resetPasswordTitle")}
              </h2>
              <button
                className="modal__close"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              {/* User info */}
              <div className="reset-pw__user-info">
                <div className="user-cell__avatar">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div className="reset-pw__user-text">
                  <span className="reset-pw__user-name">
                    {selectedUser.fullName}
                  </span>
                  <span className="reset-pw__user-email">
                    {selectedUser.email}
                  </span>
                </div>
              </div>

              {/* New password */}
              <div className="reset-pw__field">
                <label className="reset-pw__label">{t("newPassword")}</label>
                <div className="reset-pw__input-wrap">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="reset-pw__input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("minChars")}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="reset-pw__eye"
                    onClick={() => setShowNewPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {newPassword &&
                  (() => {
                    const strength = getPasswordStrength(newPassword);
                    return (
                      <div className="reset-pw__strength">
                        <div className="reset-pw__strength-bars">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="reset-pw__strength-bar"
                              style={{
                                background:
                                  i <= strength.level
                                    ? strength.color
                                    : "var(--border-color)",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="reset-pw__strength-label"
                          style={{ color: strength.color }}
                        >
                          {strength.label}
                        </span>
                      </div>
                    );
                  })()}
              </div>

              {/* Confirm password */}
              <div className="reset-pw__field">
                <label className="reset-pw__label">{t("confirmPassword")}</label>
                <div className="reset-pw__input-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`reset-pw__input${
                      confirmPassword && newPassword !== confirmPassword
                        ? " reset-pw__input--error"
                        : confirmPassword && newPassword === confirmPassword
                          ? " reset-pw__input--ok"
                          : ""
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("reenterPassword")}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="reset-pw__eye"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  {confirmPassword && (
                    <span className="reset-pw__match-icon">
                      {newPassword === confirmPassword ? (
                        <CheckCircle size={16} color="#22c55e" />
                      ) : (
                        <AlertCircle size={16} color="#ef4444" />
                      )}
                    </span>
                  )}
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="reset-pw__error-msg">{t("passwordNotMatch")}</p>
                )}
              </div>

              <p className="reset-pw__hint">
                {t("passwordApplyNote")}
              </p>
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                {t("cancel")}
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleResetPassword}
                disabled={
                  !newPassword ||
                  newPassword.length < 6 ||
                  newPassword !== confirmPassword ||
                  loadingResetPassword
                }
              >
                {loadingResetPassword ? (
                  <>
                    <div className="admin-loading__spinner admin-loading__spinner--sm" />{" "}
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <Key size={16} /> {t("resetPassword")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedUser && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowActivityModal(false);
            setActivityData(null);
          }}
        >
          <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>
                <History size={20} />
                {t("activityHistory")}
              </h2>
              <button
                className="modal__close"
                onClick={() => {
                  setShowActivityModal(false);
                  setActivityData(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">
              {/* User info banner */}
              <div className="activity-modal__user-info">
                <div className="user-cell__avatar activity-modal__avatar">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <p className="activity-modal__user-name">
                    {selectedUser.fullName}
                  </p>
                  <p className="activity-modal__user-email">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {loadingActivity ? (
                <div className="activity-modal__loading">
                  <div className="admin-loading__spinner" />
                  <p>{t("loadingActivity")}</p>
                </div>
              ) : activityData ? (
                <>
                  {/* Stats */}
                  <div className="activity-modal__stats">
                    {[
                      {
                        label: t("termsActivity"),
                        value: activityData.stats?.terms ?? 0,
                        icon: <BookPlus size={18} />,
                        color: "#6366f1",
                      },
                      {
                        label: t("commentsActivity"),
                        value: activityData.stats?.comments ?? 0,
                        icon: <MessageSquare size={18} />,
                        color: "#0ea5e9",
                      },
                      {
                        label: t("contributionsActivity"),
                        value: activityData.stats?.contributions ?? 0,
                        icon: <Lightbulb size={18} />,
                        color: "#f59e0b",
                      },
                      {
                        label: t("reportsActivity"),
                        value: activityData.stats?.reports ?? 0,
                        icon: <Flag size={18} />,
                        color: "#ef4444",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="activity-modal__stat-card"
                        style={
                          { "--stat-color": stat.color } as React.CSSProperties
                        }
                      >
                        <div className="activity-modal__stat-icon">
                          {stat.icon}
                        </div>
                        <div className="activity-modal__stat-value">
                          {stat.value}
                        </div>
                        <div className="activity-modal__stat-label">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity list */}
                  {activityData.activities &&
                  activityData.activities.length > 0 ? (
                    <div className="activity-modal__list">
                      {activityData.activities.map(
                        (activity: any, idx: number) => {
                          const typeMap: Record<
                            string,
                            {
                              icon: React.ReactNode;
                              label: string;
                              color: string;
                            }
                          > = {
                            term: {
                              icon: <BookPlus size={15} />,
                              label:
                                typeof activity.term === "object"
                                  ? activity.term?.vi ||
                                    activity.term?.en ||
                                    activity.term?.lo ||
                                    t("termsActivity")
                                  : activity.term || t("termsActivity"),
                              color: "#6366f1",
                            },
                            comment: {
                              icon: <MessageSquare size={15} />,
                              label: t("commentsActivity"),
                              color: "#0ea5e9",
                            },
                            contribution: {
                              icon: <Lightbulb size={15} />,
                              label: t("contributionsActivity"),
                              color: "#f59e0b",
                            },
                            report: {
                              icon: <Flag size={15} />,
                              label: t("reportsActivity"),
                              color: "#ef4444",
                            },
                          };
                          const actType = typeMap[activity.type] ?? {
                            icon: <History size={15} />,
                            label: activity.type,
                            color: "#6b7280",
                          };

                          const statusMap: Record<
                            string,
                            { label: string; cls: string }
                          > = {
                            approved: {
                              label: t("approved"),
                              cls: "status--approved",
                            },
                            rejected: {
                              label: t("rejected"),
                              cls: "status--rejected",
                            },
                            pending: {
                              label: t("pending"),
                              cls: "status--pending",
                            },
                            active: {
                              label: t("activeStatus"),
                              cls: "status--approved",
                            },
                            resolved: {
                              label: t("resolved"),
                              cls: "status--approved",
                            },
                          };
                          const s = statusMap[activity.status] ?? {
                            label: activity.status || "—",
                            cls: "status--pending",
                          };

                          return (
                            <div
                              key={`${activity.type}-${idx}`}
                              className="activity-modal__item"
                            >
                              <div
                                className="activity-modal__item-icon"
                                style={{
                                  color: actType.color,
                                  background: `${actType.color}18`,
                                }}
                              >
                                {actType.icon}
                              </div>
                              <div className="activity-modal__item-body">
                                <div className="activity-modal__item-header">
                                  <span className="activity-modal__item-title">
                                    {actType.label}
                                  </span>
                                  <span
                                    className={`activity-modal__status ${s.cls}`}
                                  >
                                    {s.label}
                                  </span>
                                </div>
                                {(activity.content || activity.reason) && (
                                  <p className="activity-modal__item-content">
                                    {activity.content || activity.reason}
                                  </p>
                                )}
                                <span className="activity-modal__item-date">
                                  {new Date(activity.createdAt).toLocaleString(
                                    "vi-VN",
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div className="activity-modal__empty">
                      <History size={40} />
                      <p>{t("noActivity")}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="activity-modal__empty">
                  <AlertCircle size={40} />
                  <p>{t("activityDataError")}</p>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => {
                  setShowActivityModal(false);
                  setActivityData(null);
                }}
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
