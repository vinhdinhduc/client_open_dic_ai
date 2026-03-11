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
  Flag,
  Tags,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Settings,
} from "lucide-react";
import Link from "next/link";
import contributionService from "@/services/contributionService";
import reportStatsService from "@/services/reportStatsService";
import "./dashboard.scss";

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
  const [overview, setOverview] = useState<any>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [overviewData, pendingContribRes] = await Promise.all([
        reportStatsService.getSystemOverview().catch(() => null),
        contributionService
          .getContributions({ status: "pending", limit: 5 })
          .catch(() => null),
      ]);

      setOverview(overviewData);

      if (pendingContribRes?.data?.contributions) {
        const items = pendingContribRes.data.contributions.map((c: any) => ({
          id: c._id,
          type: c.type,
          title:
            c.type === "new_term"
              ? c.term?.vi || c.term?.en || c.term?.lo || "Thuật ngữ mới"
              : `Chỉnh sửa: ${c.term?.vi || c.term?.en || c.term?.lo || ""}`,
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
    href,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    iconColor: string;
    href?: string;
  }) => {
    const content = (
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
    return href ? (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    ) : (
      content
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  const pendingContributions = overview?.pendingContributions ?? 0;
  const totalReports = overview?.totalReports ?? 0;

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Bảng điều khiển</h1>
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

      {/* Alert Banners */}
      {(pendingContributions > 0 || totalReports > 0) && (
        <div className="dashboard__alerts">
          {pendingContributions > 0 && (
            <Link
              href="/admin/moderation/contributions"
              className="dashboard__alert dashboard__alert--warning"
            >
              <AlertTriangle size={18} />
              <span>
                Có <strong>{pendingContributions}</strong> đóng góp đang chờ
                duyệt
              </span>
              <ArrowRight size={16} className="dashboard__alert-arrow" />
            </Link>
          )}
          {totalReports > 0 && (
            <Link
              href="/admin/moderation/reports"
              className="dashboard__alert dashboard__alert--danger"
            >
              <Flag size={18} />
              <span>
                Có <strong>{totalReports}</strong> báo cáo cần xem xét
              </span>
              <ArrowRight size={16} className="dashboard__alert-arrow" />
            </Link>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-stats admin-stats--6col">
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={overview?.totalUsers ?? 0}
          iconColor="primary"
          href="/admin/users"
        />
        <StatCard
          icon={CheckCircle}
          label="Thuật ngữ đã duyệt"
          value={overview?.approvedTerms ?? 0}
          iconColor="success"
          href="/admin/terms"
        />
        <StatCard
          icon={Clock}
          label="Thuật ngữ chờ duyệt"
          value={overview?.pendingTerms ?? 0}
          iconColor="warning"
          href="/admin/terms"
        />
        <StatCard
          icon={FileCheck}
          label="Đóng góp chờ duyệt"
          value={pendingContributions}
          iconColor="warning"
          href="/admin/moderation/contributions"
        />
        <StatCard
          icon={Flag}
          label="Báo cáo"
          value={totalReports}
          iconColor="danger"
          href="/admin/moderation/reports"
        />
        <StatCard
          icon={MessageSquare}
          label="Tổng bình luận"
          value={overview?.totalComments ?? 0}
          iconColor="info"
          href="/admin/comments"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard__grid">
        {/* Pending Contributions */}
        <div className="admin-card dashboard__pending">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <FileCheck size={18} />
              Đóng góp chờ duyệt ({pendingContributions})
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

        {/* System Overview */}
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
                <span className="top-term-item__name">
                  Người dùng hoạt động
                </span>
                <span className="top-term-item__views">
                  {(overview?.activeUsers ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="top-term-item">
                <span className="top-term-item__name">Tổng thuật ngữ</span>
                <span className="top-term-item__views">
                  {(overview?.totalTerms ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="top-term-item">
                <span className="top-term-item__name">Danh mục</span>
                <span className="top-term-item__views">
                  {(overview?.totalCategories ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="top-term-item">
                <span className="top-term-item__name">Tổng đóng góp</span>
                <span className="top-term-item__views">
                  {(overview?.totalContributions ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="top-term-item">
                <span className="top-term-item__name">Bình luận</span>
                <span className="top-term-item__views">
                  {(overview?.totalComments ?? 0).toLocaleString()}
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
              <Link
                href="/admin/moderation/contributions"
                className="quick-action-item"
              >
                <FileCheck size={24} />
                <span>Duyệt đóng góp</span>
              </Link>
              <Link
                href="/admin/moderation/reports"
                className="quick-action-item"
              >
                <Flag size={24} />
                <span>Xem báo cáo</span>
              </Link>
              <Link href="/admin/categories" className="quick-action-item">
                <Tags size={24} />
                <span>Danh mục</span>
              </Link>
              <Link href="/admin/users" className="quick-action-item">
                <Users size={24} />
                <span>Người dùng</span>
              </Link>
              <Link href="/admin/import" className="quick-action-item">
                <Upload size={24} />
                <span>Nhập dữ liệu</span>
              </Link>
              <Link href="/admin/report-stats" className="quick-action-item">
                <Activity size={24} />
                <span>Thống kê</span>
              </Link>
              <Link href="/admin/system-config" className="quick-action-item">
                <Settings size={24} />
                <span>Cấu hình</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
