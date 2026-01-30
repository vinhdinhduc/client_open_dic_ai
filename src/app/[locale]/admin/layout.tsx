"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  FileCheck,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Upload,
  BarChart3,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import "./admin.scss";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "users",
    label: "Quản lý người dùng",
    icon: Users,
    href: "/admin/users",
  },
  {
    id: "terms",
    label: "Quản lý thuật ngữ",
    icon: BookOpen,
    href: "/admin/terms",
  },
  {
    id: "categories",
    label: "Quản lý danh mục",
    icon: FolderTree,
    href: "/admin/categories",
  },
  {
    id: "contributions",
    label: "Kiểm duyệt đóng góp",
    icon: FileCheck,
    href: "/admin/contributions",
    badge: true,
  },
  {
    id: "comments",
    label: "Quản lý bình luận",
    icon: MessageSquare,
    href: "/admin/comments",
  },
  {
    id: "import",
    label: "Nhập dữ liệu",
    icon: Upload,
    href: "/admin/import",
  },
  {
    id: "reports",
    label: "Báo cáo thống kê",
    icon: BarChart3,
    href: "/admin/reports",
  },
  {
    id: "settings",
    label: "Cấu hình hệ thống",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(5); // Mock data

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin");
      return;
    }
    if (user?.role !== "admin" && user?.role !== "moderator") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return pathname.endsWith("/admin");
    }
    return pathname.includes(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading if not authorized
  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "moderator")
  ) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div
      className={`admin-layout ${sidebarOpen ? "" : "admin-layout--collapsed"}`}
    >
      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${mobileMenuOpen ? "admin-sidebar--open" : ""}`}
      >
        {/* Logo */}
        <div className="admin-sidebar__header">
          <Link href="/admin" className="admin-sidebar__logo">
            <Shield className="logo-icon" />
            <span className="logo-text">Admin Panel</span>
          </Link>
          <button
            className="admin-sidebar__close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar__nav">
          <ul className="admin-sidebar__menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`admin-sidebar__link ${
                    isActiveRoute(item.href) ? "active" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="menu-icon" size={20} />
                  <span className="menu-text">{item.label}</span>
                  {item.badge && pendingCount > 0 && (
                    <span className="menu-badge">{pendingCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar__footer">
          <Link href="/" className="admin-sidebar__back">
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header__left">
            <button
              className="admin-header__menu-btn"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <button
              className="admin-header__toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="admin-header__search">
              <Search size={18} />
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
          </div>

          <div className="admin-header__right">
            {/* Theme Toggle */}
            <button
              className="admin-header__icon-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Đổi giao diện"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <button className="admin-header__icon-btn admin-header__icon-btn--badge">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>

            {/* User Menu */}
            <div className="admin-header__user">
              <button
                className="admin-header__user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.fullName || "Admin"}</span>
                  <span className="user-role">
                    {user?.role === "admin"
                      ? "Quản trị viên"
                      : "Kiểm duyệt viên"}
                  </span>
                </div>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className="admin-header__dropdown">
                  <Link href="/admin/profile" className="dropdown-item">
                    <Users size={16} />
                    Tài khoản
                  </Link>
                  <Link href="/admin/settings" className="dropdown-item">
                    <Settings size={16} />
                    Cài đặt
                  </Link>
                  <hr />
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
