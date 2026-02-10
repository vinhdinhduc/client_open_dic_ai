"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  FileCheck,
  MessageSquare,
  TrendingUp,
  Eye,
  Award,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import reportStatsService, { FullReport } from "@/services/reportStatsService";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import "./reports.scss";

const COLORS = [
  "#667eea",
  "#764ba2",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FullReport | null>(null);
  const [period, setPeriod] = useState("month");
  const [months, setMonths] = useState(12);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportStatsService.getFullReport(period, months);
      setReport(data);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  }, [period, months]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner"></div>
        <p>Đang tải báo cáo...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="admin-empty">
        <p className="admin-empty__text">Không thể tải dữ liệu báo cáo</p>
        <button className="admin-btn admin-btn--primary" onClick={loadReport}>
          Thử lại
        </button>
      </div>
    );
  }

  const { overview } = report;

  const roleLabels: Record<string, string> = {
    admin: "Quản trị viên",
    moderator: "Kiểm duyệt viên",
    user: "Người dùng",
  };

  return (
    <div className="reports-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">
            <BarChart3 size={28} />
            Báo cáo & Thống kê
          </h1>
          <p className="admin-page-header__subtitle">
            Tổng quan dữ liệu và hiệu suất hệ thống
          </p>
        </div>
        <div className="admin-page-header__actions">
          <select
            className="admin-form__select reports-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>
          <select
            className="admin-form__select reports-select"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          >
            <option value={3}>3 tháng</option>
            <option value={6}>6 tháng</option>
            <option value={12}>12 tháng</option>
          </select>
          <button
            className="admin-btn admin-btn--secondary"
            onClick={loadReport}
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--primary">
            <Users size={24} />
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">
              {overview.totalUsers.toLocaleString()}
            </div>
            <div className="admin-stat-card__label">Tổng người dùng</div>
            <div className="admin-stat-card__trend admin-stat-card__trend--up">
              {overview.activeUsers} đang hoạt động
            </div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <BookOpen size={24} />
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">
              {overview.totalTerms.toLocaleString()}
            </div>
            <div className="admin-stat-card__label">Tổng thuật ngữ</div>
            <div className="admin-stat-card__trend admin-stat-card__trend--up">
              {overview.approvedTerms} đã duyệt
            </div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <FileCheck size={24} />
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">
              {overview.totalContributions.toLocaleString()}
            </div>
            <div className="admin-stat-card__label">Tổng đóng góp</div>
            <div className="admin-stat-card__trend admin-stat-card__trend--down">
              {overview.pendingContributions} chờ duyệt
            </div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--info">
            <MessageSquare size={24} />
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">
              {overview.totalComments.toLocaleString()}
            </div>
            <div className="admin-stat-card__label">Tổng bình luận</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="reports-grid">
        {/* Terms Over Time - Area Chart */}
        <div className="admin-card reports-chart reports-chart--wide">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <TrendingUp size={18} />
              Thuật ngữ theo thời gian
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={report.termsOverTime}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    name="Đã duyệt"
                    stroke="#10b981"
                    fill="rgba(16, 185, 129, 0.2)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    name="Chờ duyệt"
                    stroke="#f59e0b"
                    fill="rgba(245, 158, 11, 0.2)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    name="Từ chối"
                    stroke="#ef4444"
                    fill="rgba(239, 68, 68, 0.1)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Users Over Time - Line Chart */}
        <div className="admin-card reports-chart">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Users size={18} />
              Người dùng mới theo tháng
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={report.usersOverTime}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Người dùng mới"
                    stroke="#667eea"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Terms By Category - Pie Chart */}
        <div className="admin-card reports-chart">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <BookOpen size={18} />
              Thuật ngữ theo danh mục
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={report.termsByCategory}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {report.termsByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Contributions Over Time - Bar Chart */}
        <div className="admin-card reports-chart reports-chart--wide">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <FileCheck size={18} />
              Đóng góp theo thời gian
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.contributionsOverTime}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="approved"
                    name="Đã duyệt"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="pending"
                    name="Chờ duyệt"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="rejected"
                    name="Từ chối"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Users By Role - Pie Chart */}
        <div className="admin-card reports-chart">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Users size={18} />
              Người dùng theo vai trò
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={report.usersByRole.map((r) => ({
                      ...r,
                      name: roleLabels[r.role] || r.role,
                    }))}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {report.usersByRole.map((_, index) => (
                      <Cell
                        key={`role-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="admin-card reports-chart">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Award size={18} />
              Top người đóng góp
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="top-list">
              {report.topContributors.map((contributor, index) => (
                <div key={contributor._id} className="top-list__item">
                  <span
                    className={`top-list__rank ${index < 3 ? "top-list__rank--top" : ""}`}
                  >
                    #{index + 1}
                  </span>
                  <div className="top-list__info">
                    <span className="top-list__name">
                      {contributor.fullName}
                    </span>
                    <span className="top-list__meta">{contributor.email}</span>
                  </div>
                  <span className="top-list__value">
                    {contributor.count} đóng góp
                  </span>
                </div>
              ))}
              {report.topContributors.length === 0 && (
                <p className="admin-empty__text">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Viewed Terms */}
        <div className="admin-card reports-chart reports-chart--wide">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Eye size={18} />
              Thuật ngữ được xem nhiều nhất
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="top-list">
              {report.topViewedTerms.map((term, index) => (
                <div key={term._id} className="top-list__item">
                  <span
                    className={`top-list__rank ${index < 3 ? "top-list__rank--top" : ""}`}
                  >
                    #{index + 1}
                  </span>
                  <div className="top-list__info">
                    <span className="top-list__name">{term.term.vi}</span>
                    <span className="top-list__meta">
                      {term.category?.name?.vi || "—"}
                    </span>
                  </div>
                  <div className="top-list__stats">
                    <span>
                      <Eye size={14} /> {term.viewCount}
                    </span>
                    <span>❤️ {term.favoriteCount}</span>
                    <span>💬 {term.commentCount}</span>
                  </div>
                </div>
              ))}
              {report.topViewedTerms.length === 0 && (
                <p className="admin-empty__text">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-card reports-chart reports-chart--wide">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Calendar size={18} />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="admin-card__body">
            <div className="activity-timeline">
              {report.recentActivity.slice(0, 15).map((activity, index) => (
                <div key={index} className="activity-timeline__item">
                  <div
                    className={`activity-timeline__dot activity-timeline__dot--${activity.type}`}
                  />
                  <div className="activity-timeline__content">
                    <div className="activity-timeline__header">
                      <span className="activity-timeline__type">
                        {activity.type === "term" && "📖 Thuật ngữ"}
                        {activity.type === "contribution" && "📝 Đóng góp"}
                        {activity.type === "comment" && "💬 Bình luận"}
                        {activity.type === "new_user" && "👤 Người dùng mới"}
                      </span>
                      {activity.status && (
                        <span
                          className={`admin-badge admin-badge--${
                            activity.status === "approved"
                              ? "success"
                              : activity.status === "pending"
                                ? "warning"
                                : "danger"
                          }`}
                        >
                          {activity.status === "approved"
                            ? "Đã duyệt"
                            : activity.status === "pending"
                              ? "Chờ duyệt"
                              : "Từ chối"}
                        </span>
                      )}
                    </div>
                    <p className="activity-timeline__title">{activity.title}</p>
                    <span className="activity-timeline__meta">
                      {activity.user} •{" "}
                      {new Date(activity.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
