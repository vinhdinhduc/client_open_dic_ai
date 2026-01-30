"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  FileCheck,
  MessageSquare,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";

// Mock data for dashboard
const mockStats = {
  totalUsers: 1245,
  usersGrowth: 12.5,
  totalTerms: 8432,
  termsGrowth: 8.2,
  pendingContributions: 23,
  contributionsGrowth: -5.3,
  totalComments: 3567,
  commentsGrowth: 15.8,
};

const mockRecentActivities = [
  {
    id: 1,
    type: "contribution",
    user: "Nguyễn Văn A",
    action: "đã đóng góp thuật ngữ mới",
    target: "Trí tuệ nhân tạo",
    time: "5 phút trước",
  },
  {
    id: 2,
    type: "comment",
    user: "Trần Thị B",
    action: "đã bình luận về",
    target: "Machine Learning",
    time: "10 phút trước",
  },
  {
    id: 3,
    type: "user",
    user: "Lê Văn C",
    action: "đã đăng ký tài khoản mới",
    target: "",
    time: "15 phút trước",
  },
  {
    id: 4,
    type: "edit",
    user: "Phạm Văn D",
    action: "đề xuất chỉnh sửa",
    target: "Cơ sở dữ liệu",
    time: "30 phút trước",
  },
  {
    id: 5,
    type: "report",
    user: "Hệ thống",
    action: "cảnh báo nội dung vi phạm",
    target: "Thuật ngữ #1234",
    time: "1 giờ trước",
  },
];

const mockPendingItems = [
  {
    id: 1,
    type: "new_term",
    title: "Deep Learning",
    user: "Nguyễn Văn A",
    date: "2026-01-30",
    status: "pending",
  },
  {
    id: 2,
    type: "edit",
    title: "Chỉnh sửa: Neural Network",
    user: "Trần Thị B",
    date: "2026-01-29",
    status: "pending",
  },
  {
    id: 3,
    type: "new_term",
    title: "Blockchain",
    user: "Lê Văn C",
    date: "2026-01-29",
    status: "pending",
  },
  {
    id: 4,
    type: "edit",
    title: "Chỉnh sửa: Cloud Computing",
    user: "Phạm Văn D",
    date: "2026-01-28",
    status: "pending",
  },
];

const mockTopTerms = [
  { id: 1, term: "Trí tuệ nhân tạo", views: 5420, trend: "up" },
  { id: 2, term: "Machine Learning", views: 4380, trend: "up" },
  { id: 3, term: "Cơ sở dữ liệu", views: 3920, trend: "down" },
  { id: 4, term: "Lập trình hướng đối tượng", views: 3150, trend: "up" },
  { id: 5, term: "Mạng máy tính", views: 2840, trend: "down" },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    growth,
    iconColor,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    growth: number;
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
        <div
          className={`admin-stat-card__trend admin-stat-card__trend--${
            growth >= 0 ? "up" : "down"
          }`}
        >
          {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(growth)}% so với tháng trước</span>
        </div>
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
          value={mockStats.totalUsers}
          growth={mockStats.usersGrowth}
          iconColor="primary"
        />
        <StatCard
          icon={BookOpen}
          label="Tổng thuật ngữ"
          value={mockStats.totalTerms}
          growth={mockStats.termsGrowth}
          iconColor="success"
        />
        <StatCard
          icon={FileCheck}
          label="Đóng góp chờ duyệt"
          value={mockStats.pendingContributions}
          growth={mockStats.contributionsGrowth}
          iconColor="warning"
        />
        <StatCard
          icon={MessageSquare}
          label="Tổng bình luận"
          value={mockStats.totalComments}
          growth={mockStats.commentsGrowth}
          iconColor="info"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard__grid">
        {/* Recent Activity */}
        <div className="admin-card dashboard__activity">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Activity size={18} />
              Hoạt động gần đây
            </h3>
            <Link
              href="/admin/reports"
              className="admin-btn admin-btn--ghost admin-btn--sm"
            >
              Xem tất cả
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="admin-card__body">
            <div className="activity-list">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div
                    className={`activity-item__dot activity-item__dot--${activity.type}`}
                  />
                  <div className="activity-item__content">
                    <p>
                      <strong>{activity.user}</strong> {activity.action}{" "}
                      {activity.target && (
                        <span className="activity-item__target">
                          {activity.target}
                        </span>
                      )}
                    </p>
                    <span className="activity-item__time">
                      <Clock size={12} />
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Contributions */}
        <div className="admin-card dashboard__pending">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <FileCheck size={18} />
              Đóng góp chờ duyệt
            </h3>
            <Link
              href="/admin/contributions"
              className="admin-btn admin-btn--ghost admin-btn--sm"
            >
              Xem tất cả
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="admin-card__body">
            {mockPendingItems.length > 0 ? (
              <div className="pending-list">
                {mockPendingItems.map((item) => (
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
              <Eye size={18} />
              Thuật ngữ được xem nhiều
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="top-terms-list">
              {mockTopTerms.map((item, index) => (
                <div key={item.id} className="top-term-item">
                  <span className="top-term-item__rank">#{index + 1}</span>
                  <span className="top-term-item__name">{item.term}</span>
                  <span className="top-term-item__views">
                    {item.views.toLocaleString()} lượt xem
                  </span>
                  <span
                    className={`top-term-item__trend top-term-item__trend--${item.trend}`}
                  >
                    {item.trend === "up" ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                  </span>
                </div>
              ))}
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
              <Link href="/admin/categories/new" className="quick-action-item">
                <FileCheck size={24} />
                <span>Thêm danh mục</span>
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

      <style jsx>{`
        .dashboard__date {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .dashboard__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .dashboard__grid {
            grid-template-columns: 1fr;
          }
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .activity-item__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .activity-item__dot--contribution {
          background: #10b981;
        }

        .activity-item__dot--comment {
          background: #3b82f6;
        }

        .activity-item__dot--user {
          background: #667eea;
        }

        .activity-item__dot--edit {
          background: #f59e0b;
        }

        .activity-item__dot--report {
          background: #ef4444;
        }

        .activity-item__content {
          flex: 1;
        }

        .activity-item__content p {
          margin: 0;
          font-size: 14px;
          color: var(--text-primary);
        }

        .activity-item__target {
          color: #667eea;
          font-weight: 500;
        }

        .activity-item__time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .pending-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pending-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .pending-item__info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pending-item__title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .pending-item__meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .top-terms-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .top-term-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .top-term-item__rank {
          font-size: 14px;
          font-weight: 700;
          color: #667eea;
          width: 30px;
        }

        .top-term-item__name {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .top-term-item__views {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .top-term-item__trend {
          display: flex;
          align-items: center;
        }

        .top-term-item__trend--up {
          color: #10b981;
        }

        .top-term-item__trend--down {
          color: #ef4444;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .quick-action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .quick-action-item:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
        }

        .quick-action-item span {
          font-size: 13px;
          font-weight: 500;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
