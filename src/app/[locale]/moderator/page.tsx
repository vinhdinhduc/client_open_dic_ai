"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FolderTree,
  GitPullRequest,
  Flag,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  Loader2,
  Bell,
  Eye,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";
import contributionService, {
  Contribution,
} from "@/services/contributionService";
import {
  getReports,
  getReportStats,
  Report,
  ReportStats,
} from "@/services/reportService";
import commentService from "@/services/commentService";
import notificationService, {
  Notification,
} from "@/services/notificationService";
import "./moderator-dashboard.scss";

interface ModeratorStats {
  assignedCategories: number;
  pendingContributions: number;
  pendingReports: number;
  pendingComments: number;
  totalProcessed: number;
}

interface RecentActivity {
  id: string;
  type: "contribution" | "report" | "comment";
  title: string;
  user: string;
  date: string;
  status: string;
  categoryName?: string;
}

export default function ModeratorDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ModeratorStats>({
    assignedCategories: 0,
    pendingContributions: 0,
    pendingReports: 0,
    pendingComments: 0,
    totalProcessed: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        contributionsRes,
        reportsStatsRes,
        commentsRes,
        categoriesRes,
        notificationsRes,
      ] = await Promise.all([
        contributionService
          .getContributions({ status: "pending", limit: 5 })
          .catch(() => null),
        getReportStats().catch(() => null),
        commentService
          .getAllComments({ status: "pending", limit: 5 })
          .catch(() => null),
        axiosInstance
          .get("/categories/moderator/my-categories")
          .catch(() => null),
        notificationService.getNotifications({ limit: 10 }).catch(() => null),
      ]);

      // Stats
      const assignedCats = categoriesRes?.data?.data?.length || 0;
      const pendingContribs = contributionsRes?.data?.pagination?.total || 0;
      const pendingReportCount = reportsStatsRes?.data?.pending || 0;
      const pendingCommentsCount = commentsRes?.stats?.pending || 0;
      const resolvedReports = reportsStatsRes?.data?.resolved || 0;
      const approvedContribs =
        (contributionsRes?.data?.pagination?.total || 0) > 0 ? 0 : 0;

      setStats({
        assignedCategories: assignedCats,
        pendingContributions: pendingContribs,
        pendingReports: pendingReportCount,
        pendingComments: pendingCommentsCount,
        totalProcessed:
          resolvedReports + (reportsStatsRes?.data?.rejected || 0),
      });

      // Recent activities from contributions
      const activities: RecentActivity[] = [];

      if (contributionsRes?.data?.contributions) {
        contributionsRes.data.contributions
          .slice(0, 3)
          .forEach((c: Contribution) => {
            activities.push({
              id: c._id,
              type: "contribution",
              title:
                c.type === "new_term"
                  ? `Thuật ngữ mới: ${c.term?.vi || "N/A"}`
                  : `Gợi ý sửa: ${c.term?.vi || "N/A"}`,
              user: c.contributor?.fullName || "Người dùng",
              date: c.createdAt,
              status: c.status,
              categoryName:
                typeof c.category === "object" && c.category?.name
                  ? (c.category.name as any)?.vi || ""
                  : "",
            });
          });
      }

      // Recent activities from comments
      if (commentsRes?.comments) {
        commentsRes.comments.slice(0, 3).forEach((c: any) => {
          activities.push({
            id: c._id,
            type: "comment",
            title: `Bình luận: ${c.content?.substring(0, 50) || "N/A"}...`,
            user: c.author?.fullName || "Người dùng",
            date: c.createdAt,
            status: c.status,
            categoryName: c.term?.category?.name?.vi || "",
          });
        });
      }

      // Sort by date
      activities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setRecentActivities(activities.slice(0, 8));

      // Notifications
      if (notificationsRes) {
        setNotifications(notificationsRes.notifications || []);
        setUnreadCount(notificationsRes.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="mod-badge mod-badge--warning">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case "approved":
      case "resolved":
        return (
          <span className="mod-badge mod-badge--success">
            <CheckCircle size={12} /> Đã xử lý
          </span>
        );
      case "rejected":
        return (
          <span className="mod-badge mod-badge--danger">
            <XCircle size={12} /> Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contribution":
        return <GitPullRequest size={16} />;
      case "report":
        return <Flag size={16} />;
      case "comment":
        return <MessageSquare size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "contribution_new":
      case "contribution_approved":
      case "contribution_rejected":
        return <GitPullRequest size={16} />;
      case "report_new":
      case "report_resolved":
      case "report_rejected":
        return <Flag size={16} />;
      case "comment_reply":
      case "comment_moderated":
        return <MessageSquare size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả thông báo đã đọc");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="mod-dashboard__loading">
        <Loader2 className="spin" size={32} />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="mod-dashboard">
      {/* Header */}
      <div className="mod-dashboard__header">
        <div className="header-content">
          <div className="header-icon">
            <LayoutDashboard size={24} />
          </div>
          <div className="header-text">
            <h1>Dashboard Kiểm duyệt viên</h1>
            <p>
              Xin chào <strong>{user?.fullName}</strong>! Đây là tổng quan công
              việc kiểm duyệt của bạn.
            </p>
          </div>
        </div>
        <div className="header-actions">
          <span className="header-date">
            <Calendar size={16} />
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <button className="refresh-btn" onClick={loadDashboardData}>
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mod-dashboard__stats">
        <div className="stat-card stat-card--categories">
          <div className="stat-card__icon">
            <FolderTree size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.assignedCategories}</span>
            <span className="stat-card__label">Danh mục phụ trách</span>
          </div>
          <Link href="/moderator/categories" className="stat-card__link">
            Xem chi tiết <ArrowRight size={14} />
          </Link>
        </div>

        <div className="stat-card stat-card--contributions">
          <div className="stat-card__icon">
            <GitPullRequest size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">
              {stats.pendingContributions}
            </span>
            <span className="stat-card__label">Đóng góp chờ duyệt</span>
          </div>
          <Link
            href="/moderator/moderation/contributions"
            className="stat-card__link"
          >
            Kiểm duyệt <ArrowRight size={14} />
          </Link>
        </div>

        <div className="stat-card stat-card--reports">
          <div className="stat-card__icon">
            <Flag size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.pendingReports}</span>
            <span className="stat-card__label">Báo xấu chờ xử lý</span>
          </div>
          <Link
            href="/moderator/moderation/reports"
            className="stat-card__link"
          >
            Xử lý <ArrowRight size={14} />
          </Link>
        </div>

        <div className="stat-card stat-card--comments">
          <div className="stat-card__icon">
            <MessageSquare size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.pendingComments}</span>
            <span className="stat-card__label">Bình luận chờ duyệt</span>
          </div>
          <Link href="/moderator/comments" className="stat-card__link">
            Kiểm duyệt <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Alert Banner nếu có nhiều pending */}
      {(stats.pendingContributions > 0 ||
        stats.pendingReports > 0 ||
        stats.pendingComments > 0) && (
        <div className="mod-dashboard__alert">
          <AlertTriangle size={20} />
          <span>
            Bạn có{" "}
            <strong>
              {stats.pendingContributions +
                stats.pendingReports +
                stats.pendingComments}
            </strong>{" "}
            nội dung cần kiểm duyệt
          </span>
          <div className="alert-actions">
            {stats.pendingContributions > 0 && (
              <Link
                href="/moderator/moderation/contributions"
                className="alert-link"
              >
                {stats.pendingContributions} đóng góp
              </Link>
            )}
            {stats.pendingReports > 0 && (
              <Link href="/moderator/moderation/reports" className="alert-link">
                {stats.pendingReports} báo xấu
              </Link>
            )}
            {stats.pendingComments > 0 && (
              <Link href="/moderator/comments" className="alert-link">
                {stats.pendingComments} bình luận
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="mod-dashboard__grid">
        {/* Recent Activities */}
        <div className="mod-dashboard__section">
          <div className="section-header">
            <h2>
              <Clock size={20} /> Hoạt động gần đây
            </h2>
          </div>
          <div className="section-content">
            {recentActivities.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={32} />
                <p>Không có hoạt động nào cần xử lý</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div
                      className={`activity-item__icon activity-item__icon--${activity.type}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-item__content">
                      <div className="activity-item__title">
                        {activity.title}
                      </div>
                      <div className="activity-item__meta">
                        <span className="activity-item__user">
                          {activity.user}
                        </span>
                        {activity.categoryName && (
                          <>
                            <span className="activity-item__separator">•</span>
                            <span className="activity-item__category">
                              {activity.categoryName}
                            </span>
                          </>
                        )}
                        <span className="activity-item__separator">•</span>
                        <span className="activity-item__date">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                    </div>
                    <div className="activity-item__status">
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="mod-dashboard__section">
          <div className="section-header">
            <h2>
              <Bell size={20} /> Thông báo
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="section-content">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={32} />
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${!notification.isRead ? "notification-item--unread" : ""}`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkNotificationRead(notification._id);
                      }
                    }}
                  >
                    <div
                      className={`notification-item__icon notification-item__icon--${notification.type}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-item__content">
                      <div className="notification-item__title">
                        {notification.title}
                      </div>
                      <div className="notification-item__message">
                        {notification.message}
                      </div>
                      <div className="notification-item__date">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="notification-item__dot" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mod-dashboard__quick-actions">
        <h2>Hành động nhanh</h2>
        <div className="quick-actions-grid">
          <Link
            href="/admin/moderation/contributions"
            className="quick-action-card quick-action-card--contributions"
          >
            <GitPullRequest size={24} />
            <span>Kiểm duyệt đóng góp</span>
            {stats.pendingContributions > 0 && (
              <span className="quick-action-badge">
                {stats.pendingContributions}
              </span>
            )}
          </Link>
          <Link
            href="/admin/moderation/reports"
            className="quick-action-card quick-action-card--reports"
          >
            <Flag size={24} />
            <span>Xử lý báo xấu</span>
            {stats.pendingReports > 0 && (
              <span className="quick-action-badge">{stats.pendingReports}</span>
            )}
          </Link>
          <Link
            href="/admin/comments"
            className="quick-action-card quick-action-card--comments"
          >
            <MessageSquare size={24} />
            <span>Kiểm duyệt bình luận</span>
            {stats.pendingComments > 0 && (
              <span className="quick-action-badge">
                {stats.pendingComments}
              </span>
            )}
          </Link>
          <Link
            href="/moderator/categories"
            className="quick-action-card quick-action-card--categories"
          >
            <FolderTree size={24} />
            <span>Danh mục phụ trách</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
