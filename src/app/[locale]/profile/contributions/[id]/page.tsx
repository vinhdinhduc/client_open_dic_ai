"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import contributionService, {
  Contribution,
} from "@/services/contributionService";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  BookOpen,
  FileText,
} from "lucide-react";
import "./page.scss";
import { Layout } from "@/components/layouts";

export default function ContributionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");

  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadContribution();
  }, [params.id, isAuthenticated, authLoading]);

  const loadContribution = async () => {
    if (!params.id) return;

    setIsLoading(true);
    try {
      const response = await contributionService.getContributionById(
        params.id as string,
      );
      if (response.success && response.data) {
        setContribution(response.data);
      }
    } catch (error: any) {
      console.error("Failed to load contribution:", error);
      toast.error(t("loadError"));
      router.push("/profile/contributions");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="status-icon--pending" size={24} />;
      case "approved":
        return <CheckCircle className="status-icon--approved" size={24} />;
      case "rejected":
        return <XCircle className="status-icon--rejected" size={24} />;
      default:
        return null;
    }
  };

  const getCategoryName = (category: Contribution["category"]) => {
    if (!category?.name) return "";
    if (typeof category.name === "string") return category.name;
    return category.name.vi || category.name.en || category.name.lo || "";
  };

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

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-page">
          <div className="spinner-large"></div>
          <p>{tCommon("loading")}</p>
        </div>
      </Layout>
    );
  }

  if (!contribution) {
    return (
      <Layout>
        <div className="error-page">
          <p>{t("loadError")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="contribution-detail">
        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => router.push("/profile/contributions")}
        >
          <ArrowLeft size={18} />
          {t("backToList") || "Quay lại danh sách"}
        </button>

        {/* Header */}
        <div className="detail-header">
          <div className="header-content">
            <h1 className="detail-title">{contribution.term.vi}</h1>
            <div className="header-meta">
              <span className="meta-item">
                <Calendar size={16} />
                {new Date(contribution.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="meta-item">
                <Tag size={16} />
                {getCategoryName(contribution.category)}
              </span>
            </div>
          </div>
          <div className={`status-badge status-badge--${contribution.status}`}>
            {getStatusIcon(contribution.status)}
            <span>{t(`status.${contribution.status}`)}</span>
          </div>
        </div>

        {/* Content Sections */}
        <div className="detail-content">
          {/* Definition Section */}
          <section className="content-section">
            <h2 className="section-title">
              <BookOpen size={20} />
              Định nghĩa
            </h2>
            <div className="language-content">
              <div className="lang-item">
                <span className="lang-label">🇻🇳 Tiếng Việt:</span>
                <p className="lang-text">{contribution.definition.vi}</p>
              </div>
              {contribution.definition.en && (
                <div className="lang-item">
                  <span className="lang-label">🇬🇧 English:</span>
                  <p className="lang-text">{contribution.definition.en}</p>
                </div>
              )}
              {contribution.definition.lo && (
                <div className="lang-item">
                  <span className="lang-label">🇱🇦 ພາສາລາວ:</span>
                  <p className="lang-text">{contribution.definition.lo}</p>
                </div>
              )}
            </div>
          </section>

          {/* Detailed Explanation */}
          {contribution.detailedExplanation &&
            (contribution.detailedExplanation.vi ||
              contribution.detailedExplanation.en ||
              contribution.detailedExplanation.lo) && (
              <section className="content-section">
                <h2 className="section-title">
                  <FileText size={20} />
                  Giải thích chi tiết
                </h2>
                <div className="language-content">
                  {contribution.detailedExplanation.vi && (
                    <div className="lang-item">
                      <span className="lang-label">🇻🇳 Tiếng Việt:</span>
                      <p className="lang-text">
                        {contribution.detailedExplanation.vi}
                      </p>
                    </div>
                  )}
                  {contribution.detailedExplanation.en && (
                    <div className="lang-item">
                      <span className="lang-label">🇬🇧 English:</span>
                      <p className="lang-text">
                        {contribution.detailedExplanation.en}
                      </p>
                    </div>
                  )}
                  {contribution.detailedExplanation.lo && (
                    <div className="lang-item">
                      <span className="lang-label">🇱🇦 ພາສາລາວ:</span>
                      <p className="lang-text">
                        {contribution.detailedExplanation.lo}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* Examples */}
          {contribution.examples && contribution.examples.length > 0 && (
            <section className="content-section">
              <h2 className="section-title">
                <BookOpen size={20} />
                Ví dụ
              </h2>
              <div className="examples-list">
                {contribution.examples.map((example, index) => (
                  <div key={index} className="example-item">
                    <span className="example-number">{index + 1}</span>
                    <div className="language-content">
                      {example.vi && (
                        <div className="lang-item">
                          <span className="lang-label">🇻🇳</span>
                          <p className="lang-text">{example.vi}</p>
                        </div>
                      )}
                      {example.en && (
                        <div className="lang-item">
                          <span className="lang-label">🇬🇧</span>
                          <p className="lang-text">{example.en}</p>
                        </div>
                      )}
                      {example.lo && (
                        <div className="lang-item">
                          <span className="lang-label">🇱🇦</span>
                          <p className="lang-text">{example.lo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contributor Note */}
          {contribution.contributorNote && (
            <section className="content-section">
              <h2 className="section-title">
                <User size={20} />
                Ghi chú của người đóng góp
              </h2>
              <div className="note-box note-box--contributor">
                <p>{contribution.contributorNote}</p>
              </div>
            </section>
          )}

          {/* Moderator Note */}
          {contribution.moderatorNote && (
            <section className="content-section">
              <h2 className="section-title">
                <User size={20} />
                {t("moderatorNote")}
              </h2>
              <div className="note-box note-box--moderator">
                <p>{contribution.moderatorNote}</p>
                {contribution.moderator && contribution.moderatedAt && (
                  <div className="note-meta">
                    <span>{contribution.moderator.fullName}</span>
                    <span>•</span>
                    <span>
                      {new Date(contribution.moderatedAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}
