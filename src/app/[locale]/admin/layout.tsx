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
  KeyRound,
  Mail,
  Gauge,
  MoveLeft,
  Home,
  MessageCircle,
  Globe,
  Award,
  Activity,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/useLanguage";
import NotificationBell from "@/components/common/NotificationBell";
import AdminGlobalSearch from "@/components/common/AdminGlobalSearch";
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

// Menu cho quản trị viên - sử dụng key dịch thuật
const adminMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "users",
    label: "users",
    icon: Users,
    href: "/admin/users",
  },
  {
    id: "terms",
    label: "terms",
    icon: BookOpen,
    href: "/admin/terms",
  },
  {
    id: "categories",
    label: "categories",
    icon: FolderTree,
    href: "/admin/categories",
  },
  {
    id: "moderation",
    label: "moderation",
    icon: FileCheck,
    badge: true,
    children: [
      {
        id: "moderation-contributions",
        label: "moderationContributions",
        href: "/admin/moderation/contributions",
        icon: GitPullRequest,
        badge: true,
      },
      {
        id: "reports-moderation",
        label: "moderationReports",
        href: "/admin/moderation/reports",
        icon: Flag,
        badge: true,
      },
    ],
  },
  {
    id: "comments",
    label: "comments",
    icon: MessageSquare,
    href: "/admin/comments",
    badge: true,
  },
  {
    id: "import",
    label: "import",
    icon: Upload,
    href: "/admin/import",
  },
  {
    id: "reports",
    label: "reportStats",
    icon: BarChart3,
    href: "/admin/reports",
  },
  {
    id: "feedback",
    label: "feedback",
    icon: MessageCircle,
    href: "/admin/feedback",
  },
  {
    id: "reputation",
    label: "reputation",
    icon: Award,
    href: "/admin/reputation",
  },
  {
    id: "audit-logs",
    label: "auditLogs",
    icon: Activity,
    href: "/admin/audit-logs",
  },
  {
    id: "settings",
    label: "settings",
    icon: Settings,
    children: [
      {
        id: "setting-api-keys",
        label: "settingApiKeys",
        href: "/admin/settings/api-keys",
        icon: KeyRound,
        badge: true,
      },
      {
        id: "setting-email",
        label: "settingEmail",
        href: "/admin/settings/email",
        icon: Mail,
        badge: true,
      },
      {
        id: "setting-rate-limit",
        label: "settingRateLimit",
        href: "/admin/settings/rate-limit",
        icon: Gauge,
        badge: true,
      },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("adminLayout");
  const { currentLanguage, changeLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["moderation"]);
  const [pendingCount, setPendingCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [contributionCount, setContributionCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  // Fetch pending counts
  useEffect(() => {
    const fetchPendingCounts = async () => {
      if (!isAuthenticated || user?.role !== "admin") return;

      try {
        const [contribRes, reportRes, commentRes] = await Promise.all([
          import("@/services/contributionService").then((m) =>
            m.default
              .getContributions({ status: "pending", limit: 1 })
              .catch(() => null),
          ),
          import("@/services/reportService").then((m) =>
            m.getReportStats().catch(() => null),
          ),
          import("@/services/commentService").then((m) =>
            m.default
              .getAllComments({ status: "pending", limit: 1 })
              .catch(() => null),
          ),
        ]);

        const contribCount = contribRes?.data?.pagination?.total || 0;
        const rptCount = reportRes?.data?.pending || 0;
        const cmtCount = commentRes?.stats?.pending || 0;

        setContributionCount(contribCount);
        setReportCount(rptCount);
        setCommentCount(cmtCount);
        setPendingCount(contribCount + rptCount);
      } catch (error) {
        console.error("Error fetching pending counts:", error);
      }
    };

    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.role]);

  // Kiểm tra quyền truy cập quản trị viên
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login?returnUrl=/admin");
      return;
    }
    if (user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

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

  const getRawBadgeCount = (itemId: string): number => {
    switch (itemId) {
      case "moderation":
        return pendingCount;
      case "reports-moderation":
        return reportCount;
      case "moderation-contributions":
        return contributionCount;
      case "comments":
        return commentCount;
      default:
        return 0;
    }
  };

  const getBadgeCount = (itemId: string): string | number => {
    const count = getRawBadgeCount(itemId);
    if (count > 99) {
      return "99+";
    }
    return count;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Hiển thị loading nếu chưa được phân quyền
  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "moderator")
  ) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>{t("checkingAccess")}</p>
      </div>
    );
  }

  const LANGUAGES = [
    { code: "vi" as const, label: t("vietnamese"), flag: "🇻🇳" },
    { code: "en" as const, label: t("english"), flag: "🇬🇧" },
    { code: "lo" as const, label: t("lao"), flag: "🇱🇦" },
  ];

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
            <span className="logo-text">UTB OpenDict Admin</span>
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
            {adminMenuItems.map((item) => (
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
                      <span className="menu-text">{t(item.label)}</span>
                      {item.badge && getRawBadgeCount(item.id) > 0 && (
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
                            <span className="menu-text">{t(child.label)}</span>
                            {child.badge && getRawBadgeCount(child.id) > 0 && (
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
                    <span className="menu-text">{t(item.label)}</span>
                    {item.badge && getRawBadgeCount(item.id) > 0 && (
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
          <Link href="/" target="_blank" className="admin-sidebar__back">
            <Home size={16} />
            <span>{t("viewHomepage")}</span>
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
            <AdminGlobalSearch
              role="admin"
              basePath="/admin"
              language={currentLanguage}
              placeholder={t("searchPlaceholder")}
            />
          </div>

          <div className="admin-header__right">
            {/* Language Dropdown */}
            <div className="admin-header__lang">
              <button
                className="admin-header__icon-btn"
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setUserMenuOpen(false);
                }}
                title={t("language")}
              >
                <Globe size={20} />
              </button>
              {langMenuOpen && (
                <div className="admin-header__dropdown admin-header__dropdown--lang">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      className={`dropdown-item ${currentLanguage === lang.code ? "active" : ""}`}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                    >
                      <span className="dropdown-flag">{lang.flag}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              className="admin-header__icon-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={t("toggleTheme")}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <NotificationBell className="admin-header__notification" />

            {/* User Menu */}
            <div className="admin-header__user">
              <button
                className="admin-header__user-btn"
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setLangMenuOpen(false);
                }}
              >
                <div className="user-avatar">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.fullName || "Admin"}</span>
                  <span className="user-role">
                    {user?.role === "admin" ? t("admin") : t("moderator")}
                  </span>
                </div>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className="admin-header__dropdown">
                  <Link href="/admin/profile" className="dropdown-item">
                    <Users size={16} />
                    {t("account")}
                  </Link>
                  <Link href="/admin/settings" className="dropdown-item">
                    <Settings size={16} />
                    {t("settings")}
                  </Link>
                  <hr />
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    {t("logout")}
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
