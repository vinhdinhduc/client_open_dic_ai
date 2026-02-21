"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import userService from "@/services/userService";
import categoryService, { Category } from "@/services/categoryService";
import { User, GetUsersParams, UserRole, UserStatus } from "@/types";
import "./page.scss";
import { AddUser } from "@/components/forms/manage_users/AddUser";
import { EditUser } from "@/components/forms/manage_users/EditUser";
import toast from "react-hot-toast";

// Constants
const permissionOptions = [
  { value: "reports", label: "Kiểm duyệt báo xấu", icon: <Flag size={18} /> },
  { value: "suggestions", label: "Gợi ý sửa", icon: <Lightbulb size={18} /> },
  {
    value: "contributions",
    label: "Đóng góp từ",
    icon: <BookPlus size={18} />,
  },
  { value: "comments", label: "Bình luận", icon: <MessageSquare size={18} /> },
];

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

  // Ref for dropdown menu
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
      !confirm("Bạn có chắc chắn muốn xuất tất cả người dùng ra file Excel?")
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

      toast.success("Xuất người dùng thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xuất người dùng");
    } finally {
      setTableLoading(false);
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
              ? "Đã khóa tài khoản"
              : "Đã mở khóa tài khoản",
          );
          refreshUsers();
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
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
          toast.success("Xóa người dùng thành công");
          refreshUsers();
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa người dùng");
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
          toast.success("Cập nhật quyền kiểm duyệt thành công");
          refreshUsers();
          setShowPermissionsModal(false);
          setSelectedUser(null);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi cập nhật quyền");
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

    try {
      const res = await userService.resetUserPassword(
        selectedUser._id,
        newPassword,
      );
      if (res.success) {
        toast.success("Đặt lại mật khẩu thành công");
        setShowResetPasswordModal(false);
        setNewPassword("");
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đặt lại mật khẩu");
    }
  };

  // Handle resend verification email
  const handleResendVerification = async (user: User) => {
    try {
      const res = await userService.resendVerificationEmail(user._id);
      if (res.success) {
        toast.success("Đã gửi lại email xác thực");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Handle batch update status
  const handleBatchUpdateStatus = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người dùng");
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
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
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
      toast.error("Không thể tải lịch sử hoạt động");
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
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <>
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
            <button
              className="admin-btn admin-btn--secondary"
              onClick={handleExportUser}
            >
              <Download size={16} />
              Xuất Excel
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleShowModalAddUser}
            >
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

            {selectedUsers.length > 0 && (
              <button
                className="admin-btn admin-btn--warning"
                onClick={() => setShowBatchActionsModal(true)}
              >
                Thao tác ({selectedUsers.length})
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
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Đóng góp</th>
                  <th>Đăng nhập cuối</th>
                  <th>Thao tác</th>
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
                          <Eye size={16} color="blue" />
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} color="orange" />
                        </button>
                        {user.role === "moderator" && (
                          <button
                            className="action-btn action-btn--primary"
                            onClick={() => openPermissionsModal(user)}
                            title="Phân quyền kiểm duyệt"
                          >
                            <Shield size={16} color="#11998e" />
                          </button>
                        )}

                        {/* More Menu Dropdown */}
                        <div className="action-dropdown" ref={dropdownRef}>
                          <button
                            className="action-btn action-btn--more"
                            onClick={() =>
                              setShowMoreMenu(
                                showMoreMenu === user._id ? null : user._id,
                              )
                            }
                            title="Thêm"
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
                                Xem hoạt động
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowResetPasswordModal(true);
                                  setShowMoreMenu(null);
                                }}
                              >
                                <Key size={14} />
                                Đặt lại mật khẩu
                              </button>
                              {!user.emailVerified && (
                                <button
                                  onClick={() => {
                                    handleResendVerification(user);
                                    setShowMoreMenu(null);
                                  }}
                                >
                                  <Send size={14} />
                                  Gửi lại email xác thực
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
                                    Mở khóa
                                  </>
                                ) : (
                                  <>
                                    <Lock size={14} />
                                    Khóa tài khoản
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
                                Xóa người dùng
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
                <label htmlFor="itemsPerPage">Số lượng mỗi trang</label>
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
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalUsers)} trong{" "}
                  {totalUsers} người dùng
                </p>
              </div>
              <div className="admin-pagination__controls">
                <button
                  className="admin-pagination__btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  title="Trang đầu"
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
                  title="Trang trước"
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
                  title="Trang sau"
                >
                  <ChevronRight size={16} color="blue" />
                </button>
                <button
                  className="admin-pagination__btn"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(totalPages)}
                  title="Trang cuối"
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
              <h3>Không tìm thấy người dùng</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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
                      Quyền kiểm duyệt
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
                          Chưa được phân quyền
                        </span>
                      )}
                    </div>
                    <div className="categories-tags">
                      <span className="categories-label">Danh mục:</span>
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
                    ? "Xác nhận mở khóa"
                    : "Xác nhận khóa tài khoản"}
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
                  Bạn có chắc chắn muốn{" "}
                  {selectedUser.status === "banned" ? "mở khóa" : "khóa"} tài
                  khoản <strong>{selectedUser.fullName}</strong>?
                </p>
                {selectedUser.status !== "banned" && (
                  <p className="text-warning">
                    Người dùng sẽ không thể đăng nhập khi tài khoản bị khóa.
                  </p>
                )}
              </div>
              <div className="modal__footer">
                <button
                  className="admin-btn admin-btn--secondary"
                  onClick={() => setShowLockConfirm(false)}
                >
                  Hủy
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
                    ? "Đang xử lý..."
                    : selectedUser.status === "banned"
                      ? "Mở khóa"
                      : "Khóa tài khoản"}
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
                  disabled={tableLoading}
                >
                  {tableLoading ? "Đang xóa..." : "Xóa người dùng"}
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
                  <div className="permissions-section__header">
                    <div>
                      <h4>Loại kiểm duyệt được phép</h4>
                      <p className="permissions-section__desc">
                        Chọn các loại nội dung mà kiểm duyệt viên được phép xem
                        xét
                      </p>
                    </div>
                    <div className="permissions-section__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleSelectAllPermissions}
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleClearAllPermissions}
                      >
                        Bỏ chọn
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
                      <h4>Danh mục được phân công</h4>
                      <p className="permissions-section__desc">
                        Kiểm duyệt viên chỉ được kiểm duyệt nội dung trong các
                        danh mục được chọn
                      </p>
                    </div>
                    <div className="permissions-section__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleSelectAllCategories}
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--ghost"
                        onClick={handleClearAllCategories}
                      >
                        Bỏ chọn
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
                  disabled={savingPermissions}
                >
                  {savingPermissions ? (
                    <>Đang lưu...</>
                  ) : (
                    <>
                      <Shield size={16} />
                      Lưu phân quyền
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
    </>
  );
}
