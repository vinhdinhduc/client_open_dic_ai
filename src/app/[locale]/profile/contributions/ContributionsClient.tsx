"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "@/navigation";
import contributionService, {
  Contribution,
} from "@/services/contributionService";
import { toast } from "react-hot-toast";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Filter,
  Calendar,
  User,
} from "lucide-react";
import Pagination from "@/components/common/Pagination";
import "./page.scss";
import { Layout } from "@/components/layouts";
import SafeHtml from "@/components/common/SafeHtml";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function MyContributionsPage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    limit: 10,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Tải thống kê một lần khi đã xác thực
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  // Tải đóng góp khi bộ lọc thay đổi
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadContributions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, statusFilter, currentPage]);

  const loadStats = async () => {
    try {
      // Tải số lượng theo từng trạng thái theo cơ chế song song
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        contributionService.getMyContributions({ limit: 1 }),
        contributionService.getMyContributions({
          status: "pending",
          limit: 1,
        }),
        contributionService.getMyContributions({
          status: "approved",
          limit: 1,
        }),
        contributionService.getMyContributions({
          status: "rejected",
          limit: 1,
        }),
      ]);

      setStats({
        total: allRes.data?.pagination?.total || 0,
        pending: pendingRes.data?.pagination?.total || 0,
        approved: approvedRes.data?.pagination?.total || 0,
        rejected: rejectedRes.data?.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadContributions = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await contributionService.getMyContributions(params);

      if (response.success && response.data) {
        const contributionsArray = Array.isArray(response.data.contributions)
          ? response.data.contributions
          : [];

        setContributions(contributionsArray);
        setPagination({
          total: response.data.pagination.total || 0,
          pages: response.data.pagination.pages || 0,
          limit: response.data.pagination.limit || 10,
        });
      } else {
        setContributions([]);
      }
    } catch (error: any) {
      console.error("Failed to load contributions:", error);
      toast.error(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;

    try {
      await contributionService.deleteContribution(id);
      toast.success(t("deleteSuccess"));
      loadContributions();
    } catch (error: any) {
      console.error("Failed to delete contribution:", error);
      toast.error(t("deleteError"));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="status-icon status-icon--pending" size={18} />;
      case "approved":
        return (
          <CheckCircle
            className="status-icon status-icon--approved"
            size={18}
          />
        );
      case "rejected":
        return (
          <XCircle className="status-icon status-icon--rejected" size={18} />
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    return t(`status.${status}`);
  };

  const getCategoryName = (category: Contribution["category"]) => {
    if (!category?.name) return "";
    if (typeof category.name === "string") return category.name;
    return category.name.vi || category.name.en || category.name.lo || "";
  };

  // Hiển thị spinner loading khi kiểm tra xác thực
  if (authLoading) {
    return (
      <Layout>
        <div className="loading-page">
          <div className="spinner-large"></div>
          <p>{tCommon("loading")}</p>
        </div>
      </Layout>
    );
  }

  // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    router.push("/login?returnUrl=/profile/contributions");
    return null;
  }

  return (
    <Layout>
      <div className="contributions-page">
        <div className="contributions-page__header">
          <div className="header-content">
            <h1 className="page-title">{t("myContributions")}</h1>
            <p className="page-subtitle">{t("contributionsSubtitle")}</p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => router.push("/contribute")}
          >
            <FileText size={18} />
            {t("newContribution")}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--total">
              <FileText size={24} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.total}</div>
              <div className="stat-card__label">{t("stats.total")}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--pending">
              <Clock size={24} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.pending}</div>
              <div className="stat-card__label">{t("stats.pending")}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--approved">
              <CheckCircle size={24} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.approved}</div>
              <div className="stat-card__label">{t("stats.approved")}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--rejected">
              <XCircle size={24} />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">{stats.rejected}</div>
              <div className="stat-card__label">{t("stats.rejected")}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={18} />
            <span className="filter-label">{t("filterBy")}:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                {t("filterAll")}
              </button>
              <button
                className={`filter-btn ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("pending");
                  setCurrentPage(1);
                }}
              >
                {t("status.pending")}
              </button>
              <button
                className={`filter-btn ${statusFilter === "approved" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("approved");
                  setCurrentPage(1);
                }}
              >
                {t("status.approved")}
              </button>
              <button
                className={`filter-btn ${statusFilter === "rejected" ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter("rejected");
                  setCurrentPage(1);
                }}
              >
                {t("status.rejected")}
              </button>
            </div>
          </div>
        </div>

        {/* Contributions List */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>{tCommon("loading")}</p>
          </div>
        ) : contributions.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>{t("noContributions")}</h3>
            <p>{t("noContributionsText")}</p>
            <button
              className="btn btn--primary"
              onClick={() => router.push("/contribute")}
            >
              {t("createFirst")}
            </button>
          </div>
        ) : (
          <div className="contributions-list">
            {contributions.map((contribution) => (
              <div key={contribution._id} className="contribution-card">
                <div className="contribution-card__header">
                  <div className="contribution-info">
                    <h3 className="contribution-term">
                      {contribution.term?.vi}
                    </h3>
                    <div className="contribution-meta">
                      <span className="meta-item">
                        <Calendar size={14} />
                        {new Date(contribution.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </span>
                      <span className="meta-item">
                        {getCategoryName(contribution.category)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`status-badge status-badge--${contribution.status}`}
                  >
                    {getStatusIcon(contribution.status)}
                    <span>{getStatusText(contribution.status)}</span>
                  </div>
                </div>

                <div className="contribution-card__body">
                  <p className="contribution-definition">
                    <SafeHtml
                      content={
                        contribution.definition.vi ||
                        contribution.definition.en ||
                        contribution.definition.lo ||
                        ""
                      }
                      className="lang-text"
                    />
                  </p>

                  {contribution.moderatorNote && (
                    <div className="moderator-note">
                      <User size={14} />
                      <span>
                        <strong>{t("moderatorNote")}:</strong>{" "}
                        {contribution.moderatorNote}
                      </span>
                    </div>
                  )}
                </div>

                <div className="contribution-card__actions">
                  <button
                    className="btn-action btn-action--view"
                    onClick={() =>
                      router.push(`/profile/contributions/${contribution._id}`)
                    }
                  >
                    <Eye size={16} />
                    {t("viewDetails")}
                  </button>

                  {contribution.status === "pending" && (
                    <button
                      className="btn-action btn-action--delete"
                      onClick={() => handleDelete(contribution._id)}
                    >
                      <Trash2 size={16} />
                      {t("delete")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Layout>
  );
}
