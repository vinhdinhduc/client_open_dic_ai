"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderTree,
  Search,
  Eye,
  BookOpen,
  GitPullRequest,
  Flag,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";
import "./moderator-categories.scss";

interface CategoryStats {
  termCount: number;
  pendingContributions: number;
  pendingReports: number;
  totalPending: number;
}

interface ModeratorCategory {
  _id: string;
  name: {
    vi: string;
    en?: string;
    lo?: string;
  };
  slug: string;
  description?: {
    vi?: string;
    en?: string;
    lo?: string;
  };
  icon?: string;
  isActive: boolean;
  termCount: number;
  stats: CategoryStats;
  createdAt: string;
  updatedAt: string;
}

export default function ModeratorCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ModeratorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/categories/moderator/my-categories",
      );
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching moderator categories:", error);
      toast.error("Không thể tải danh mục phụ trách");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((cat) => {
    const name = cat.name?.vi || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalStats = categories.reduce(
    (acc, cat) => ({
      totalTerms: acc.totalTerms + (cat.stats?.termCount || 0),
      totalPendingContributions:
        acc.totalPendingContributions + (cat.stats?.pendingContributions || 0),
      totalPendingReports:
        acc.totalPendingReports + (cat.stats?.pendingReports || 0),
      totalPending: acc.totalPending + (cat.stats?.totalPending || 0),
    }),
    {
      totalTerms: 0,
      totalPendingContributions: 0,
      totalPendingReports: 0,
      totalPending: 0,
    },
  );

  if (loading) {
    return (
      <div className="moderator-categories">
        <div className="moderator-categories__loading">
          <Loader2 className="spin" size={32} />
          <p>Đang tải danh mục phụ trách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="moderator-categories">
      {/* Header */}
      <div className="moderator-categories__header">
        <div className="header-content">
          <div className="header-icon">
            <FolderTree size={24} />
          </div>
          <div className="header-text">
            <h1>Danh mục phụ trách</h1>
            <p>
              Xin chào <strong>{user?.fullName}</strong>, bạn đang phụ trách{" "}
              <strong>{categories.length}</strong> danh mục
            </p>
          </div>
        </div>
        <button className="refresh-btn" onClick={fetchCategories}>
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Overview Stats */}
      <div className="moderator-categories__stats">
        <div className="stat-card stat-card--categories">
          <div className="stat-card__icon">
            <FolderTree size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{categories.length}</span>
            <span className="stat-card__label">Danh mục</span>
          </div>
        </div>
        <div className="stat-card stat-card--terms">
          <div className="stat-card__icon">
            <BookOpen size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{totalStats.totalTerms}</span>
            <span className="stat-card__label">Thuật ngữ</span>
          </div>
        </div>
        <div className="stat-card stat-card--contributions">
          <div className="stat-card__icon">
            <GitPullRequest size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">
              {totalStats.totalPendingContributions}
            </span>
            <span className="stat-card__label">Đóng góp chờ duyệt</span>
          </div>
        </div>
        <div className="stat-card stat-card--reports">
          <div className="stat-card__icon">
            <Flag size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">
              {totalStats.totalPendingReports}
            </span>
            <span className="stat-card__label">Báo xấu chờ xử lý</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="moderator-categories__search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="moderator-categories__empty">
          <AlertTriangle size={48} />
          <h3>
            {searchTerm
              ? "Không tìm thấy danh mục phù hợp"
              : "Bạn chưa được phân quyền danh mục nào"}
          </h3>
          <p>
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Liên hệ quản trị viên để được phân quyền"}
          </p>
        </div>
      ) : (
        <div className="moderator-categories__grid">
          {filteredCategories.map((category) => (
            <div key={category._id} className="category-card">
              {/* Card Header */}
              <div className="category-card__header">
                <div className="category-info">
                  <div
                    className={`category-icon ${!category.isActive ? "category-icon--inactive" : ""}`}
                  >
                    <FolderTree size={20} />
                  </div>
                  <div className="category-text">
                    <h3>{category.name?.vi || "Không có tên"}</h3>
                    {category.name?.en && (
                      <span className="category-name-en">
                        {category.name.en}
                      </span>
                    )}
                  </div>
                </div>
                {category.stats?.totalPending > 0 && (
                  <span className="pending-badge">
                    <Clock size={12} />
                    {category.stats.totalPending} chờ duyệt
                  </span>
                )}
                {category.stats?.totalPending === 0 && (
                  <span className="ok-badge">
                    <CheckCircle size={12} />
                    Đã xử lý
                  </span>
                )}
              </div>

              {/* Description */}
              {category.description?.vi && (
                <p className="category-card__description">
                  {category.description.vi}
                </p>
              )}

              {/* Stats */}
              <div className="category-card__stats">
                <div className="stat-item">
                  <BookOpen size={14} />
                  <span>{category.stats?.termCount || 0} thuật ngữ</span>
                </div>
                <div
                  className={`stat-item ${(category.stats?.pendingContributions || 0) > 0 ? "stat-item--warning" : ""}`}
                >
                  <GitPullRequest size={14} />
                  <span>
                    {category.stats?.pendingContributions || 0} đóng góp chờ
                    duyệt
                  </span>
                </div>
                <div
                  className={`stat-item ${(category.stats?.pendingReports || 0) > 0 ? "stat-item--danger" : ""}`}
                >
                  <Flag size={14} />
                  <span>
                    {category.stats?.pendingReports || 0} báo xấu chờ xử lý
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="category-card__actions">
                <Link
                  href={`/admin/moderation/contributions?category=${category._id}`}
                  className="action-btn action-btn--contributions"
                >
                  <GitPullRequest size={14} />
                  Kiểm duyệt đóng góp
                  {(category.stats?.pendingContributions || 0) > 0 && (
                    <span className="action-badge">
                      {category.stats.pendingContributions}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/admin/moderation/reports?category=${category._id}`}
                  className="action-btn action-btn--reports"
                >
                  <Flag size={14} />
                  Xử lý báo xấu
                  {(category.stats?.pendingReports || 0) > 0 && (
                    <span className="action-badge">
                      {category.stats.pendingReports}
                    </span>
                  )}
                </Link>
                <Link
                  href={`/admin/terms?category=${category._id}`}
                  className="action-btn action-btn--view"
                >
                  <Eye size={14} />
                  Xem thuật ngữ
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
