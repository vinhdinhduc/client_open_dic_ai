"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  BookOpen,
  FileCheck,
  MessageSquare,
  ArrowRight,
  Activity,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import userService from "@/services/userService";
import { getTermStats } from "@/services/termService";
import contributionService from "@/services/contributionService";
import commentService from "@/services/commentService";
import "./dashboard.scss";

interface DashboardStats {
  totalUsers: number;
  totalTerms: number;
  pendingContributions: number;
  totalComments: number;
}

interface PendingItem {
  id: string;
  type: string;
  title: string;
  user: string;
  date: string;
  status: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTerms: 0,
    pendingContributions: 0,
    totalComments: 0,
  });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [userStatsRes, termStatsRes, pendingContribRes, commentsRes] =
        await Promise.all([
          userService.getUserStats().catch(() => null),
          getTermStats().catch(() => null),
          contributionService
            .getContributions({ status: "pending", limit: 5 })
            .catch(() => null),
          commentService.getAllComments({ limit: 1 }).catch(() => null),
        ]);

      setStats({
        totalUsers: (userStatsRes?.data as any)?.total || 0,
        totalTerms: termStatsRes?.data?.stats?.total || 0,
        pendingContributions: pendingContribRes?.data?.pagination?.total || 0,
        totalComments:
          (commentsRes as any)?.pagination?.total ||
          (commentsRes as any)?.stats?.total ||
          0,
      });

      // Map pending contributions to display items
      if (pendingContribRes?.data?.contributions) {
        const items = pendingContribRes.data.contributions.map((c: any) => ({
          id: c._id,
          type: c.type,
          title:
            c.type === "new_term"
              ? c.term?.vi || "Thuật ngữ mới"
              : `Chỉnh sửa: ${c.term?.vi || ""}`,
          user: c.contributor?.fullName || "Người dùng",
          date: new Date(c.createdAt).toLocaleDateString("vi-VN"),
          status: c.status,
        }));
        setPendingItems(items);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    iconColor,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    iconColor: string;
  }) => (
    <div className="admin-stat-card">
      <div
        className={`admin-stat-card__icon admin-stat-card__icon--${iconColor}`}
      >
        <Icon size={24} />
      </div>
      <div className="admin-stat-card__content">
        <div className="admin-stat-card__value">{value.toLocaleString()}</div>
        <div className="admin-stat-card__label">{label}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Dashboard</h1>
          <p className="admin-page-header__subtitle">
            Chào mừng bạn quay lại! Đây là tổng quan hệ thống hôm nay.
          </p>
        </div>
        <div className="admin-page-header__actions">
          <span className="dashboard__date">
            <Calendar size={16} />
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={stats.totalUsers}
          iconColor="primary"
        />
        <StatCard
          icon={BookOpen}
          label="Tổng thuật ngữ"
          value={stats.totalTerms}
          iconColor="success"
        />
        <StatCard
          icon={FileCheck}
          label="Đóng góp chờ duyệt"
          value={stats.pendingContributions}
          iconColor="warning"
        />
        <StatCard
          icon={MessageSquare}
          label="Tổng bình luận"
          value={stats.totalComments}
          iconColor="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard__grid">
        {/* Pending Contributions */}
        <div className="admin-card dashboard__pending">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <FileCheck size={18} />
              Đóng góp chờ duyệt ({stats.pendingContributions})
            </h3>
            <Link
              href="/admin/moderation/contributions"
              className="admin-btn admin-btn--ghost admin-btn--sm"
            >
              Xem tất cả
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="admin-card__body">
            {pendingItems.length > 0 ? (
              <div className="pending-list">
                {pendingItems.map((item) => (
                  <div key={item.id} className="pending-item">
                    <div className="pending-item__info">
                      <span
                        className={`admin-badge admin-badge--${item.type === "new_term" ? "success" : "info"}`}
                      >
                        {item.type === "new_term" ? "Mới" : "Sửa"}
                      </span>
                      <span className="pending-item__title">{item.title}</span>
                    </div>
                    <div className="pending-item__meta">
                      <span>{item.user}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <p className="admin-empty__text">Không có đóng góp chờ duyệt</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Terms */}

        <div className="admin-card dashboard__top-terms">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Activity size={18} />
              Tổng quan hệ thống
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="top-terms-list">
              <div className="top-term-item">
                <span className="top-term-item__name">Người dùng</span>
                <span className="top-term-item__views">
                  {stats.totalUsers.toLocaleString()}
                </span>
              </div>
              <div className="top-term-item">
                <span className="top-term-item__name">Thuật ngữ</span>
                <span className="top-term-item__views">
                  {stats.totalTerms.toLocaleString()}
                </span>
              </div>
              <div className="top-term-item">
                <span className="top-term-item__name">Đóng góp chờ duyệt</span>
                <span className="top-term-item__views">
                  {stats.pendingContributions.toLocaleString()}
                </span>
              </div>
              <div className="top-term-item">
                <span className="top-term-item__name">Bình luận</span>
                <span className="top-term-item__views">
                  {stats.totalComments.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card dashboard__quick-actions">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Thao tác nhanh</h3>
          </div>
          <div className="admin-card__body">
            <div className="quick-actions-grid">
              <Link href="/admin/terms/new" className="quick-action-item">
                <BookOpen size={24} />
                <span>Thêm thuật ngữ</span>
              </Link>
              <Link href="/admin/categories" className="quick-action-item">
                <FileCheck size={24} />
                <span>Quản lý danh mục</span>
              </Link>
              <Link href="/admin/users" className="quick-action-item">
                <Users size={24} />
                <span>Quản lý người dùng</span>
              </Link>
              <Link href="/admin/import" className="quick-action-item">
                <Activity size={24} />
                <span>Nhập dữ liệu</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
