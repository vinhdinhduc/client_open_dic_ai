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
  ChevronRight,
  Sun,
  Moon,
  Upload,
  BarChart3,
  Shield,
  Flag,
  GitPullRequest,
  LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import "./admin.scss";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: boolean;
  children?: SubMenuItem[];
}

// Menu items cho Admin
const adminMenuItems: MenuItem[] = [
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
    id: "moderation",
    label: "Kiểm duyệt",
    icon: FileCheck,
    badge: true,
    children: [
      {
        id: "moderation-contributions",
        label: "Kiểm duyệt đóng góp",
        href: "/admin/moderation/contributions",
        icon: GitPullRequest,
        badge: true,
      },
      {
        id: "reports-moderation",
        label: "Kiểm duyệt báo xấu",
        href: "/admin/moderation/reports",
        icon: Flag,
        badge: true,
      },
    ],
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

// Menu items cho Moderator (chỉ hiển thị các mục liên quan đến kiểm duyệt)
const moderatorMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "moderator-categories",
    label: "Danh mục phụ trách",
    icon: FolderTree,
    href: "/admin/moderator/categories",
  },
  {
    id: "moderation",
    label: "Kiểm duyệt",
    icon: FileCheck,
    badge: true,
    children: [
      {
        id: "moderation-contributions",
        label: "Kiểm duyệt đóng góp",
        href: "/admin/moderation/contributions",
        icon: GitPullRequest,
        badge: true,
      },
      {
        id: "reports-moderation",
        label: "Kiểm duyệt báo xấu",
        href: "/admin/moderation/reports",
        icon: Flag,
        badge: true,
      },
    ],
  },
  {
    id: "comments",
    label: "Bình luận",
    icon: MessageSquare,
    href: "/admin/comments",
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["moderation"]);
  const [pendingCount, setPendingCount] = useState(5); // Mock data
  const [reportCount, setReportCount] = useState(3); // Mock data
  const [contributionCount, setContributionCount] = useState(2); // Mock data

  // Chọn menu items dựa theo role
  const menuItems =
    user?.role === "admin" ? adminMenuItems : moderatorMenuItems;

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

  const isMenuExpanded = (menuId: string) => {
    return expandedMenus.includes(menuId);
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const isParentActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some((child) => isActiveRoute(child.href));
    }
    return false;
  };

  const getBadgeCount = (itemId: string) => {
    switch (itemId) {
      case "moderation":
        return pendingCount;
      case "reports-moderation":
        return reportCount;
      case "suggest_edits-moderation":
        return contributionCount;
      default:
        return 0;
    }
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
              <li key={item.id} className={item.children ? "has-submenu" : ""}>
                {item.children ? (
                  <>
                    <button
                      className={`admin-sidebar__link admin-sidebar__link--parent ${
                        isParentActive(item) ? "active" : ""
                      }`}
                      onClick={() => toggleMenu(item.id)}
                    >
                      <item.icon className="menu-icon" size={20} />
                      <span className="menu-text">{item.label}</span>
                      {item.badge && getBadgeCount(item.id) > 0 && (
                        <span className="menu-badge">
                          {getBadgeCount(item.id)}
                        </span>
                      )}
                      <ChevronRight
                        className={`menu-arrow ${isMenuExpanded(item.id) ? "expanded" : ""}`}
                        size={16}
                      />
                    </button>
                    <ul
                      className={`admin-sidebar__submenu ${
                        isMenuExpanded(item.id) ? "expanded" : ""
                      }`}
                    >
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={child.href}
                            className={`admin-sidebar__link admin-sidebar__link--child ${
                              isActiveRoute(child.href) ? "active" : ""
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <child.icon className="menu-icon" size={16} />
                            <span className="menu-text">{child.label}</span>
                            {child.badge && getBadgeCount(child.id) > 0 && (
                              <span className="menu-badge menu-badge--small">
                                {getBadgeCount(child.id)}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className={`admin-sidebar__link ${
                      isActiveRoute(item.href!) ? "active" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="menu-icon" size={20} />
                    <span className="menu-text">{item.label}</span>
                    {item.badge && getBadgeCount(item.id) > 0 && (
                      <span className="menu-badge">
                        {getBadgeCount(item.id)}
                      </span>
                    )}
                  </Link>
                )}
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
