"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth, useLanguage } from "@/hooks";
import { TermCardData } from "./types";
import { Heart, Eye, ChevronRight, Tag, MessageCircle } from "lucide-react";
import "./TermRow.scss";
import toast from "react-hot-toast";
import { toPlainText } from "@/utils/safeHtml";

interface TermRowProps {
  term: TermCardData;
  onFavoriteToggle?: (termId: string, favorited: boolean) => Promise<void>;
  isFavorited?: boolean;
  showCategory?: boolean;
  showMetadata?: boolean;
  showActions?: boolean;
}

export default function TermRow({
  term,
  onFavoriteToggle,
  isFavorited = false,
  showCategory = true,
  showMetadata = true,
  showActions = true,
}: TermRowProps) {
  const { currentLanguage } = useLanguage();
  const t = useTranslations();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(isFavorited);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  // Get text by language
  const getTermText = (): string => {
    return (
      term.term[currentLanguage] ||
      term.term["en"] ||
      term.term["vi"] ||
      term.term["lo"] ||
      ""
    );
  };

  const getDefinitionText = (): string => {
    const definition =
      term.definition[currentLanguage] ||
      term.definition["en"] ||
      term.definition["vi"] ||
      term.definition["lo"] ||
      "";

    return toPlainText(definition);
  };

  // Get category name by language
  const getCategoryName = (): string => {
    if (!term.category) return "";
    return (
      term.category.name[currentLanguage] ||
      term.category.name["en"] ||
      term.category.name["vi"] ||
      term.category.name["lo"] ||
      ""
    );
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error(t("term.loginToFavorite"));
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setFavorited(!favorited);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    if (onFavoriteToggle) {
      onFavoriteToggle(term._id, !favorited);
    }
  };

  // Format số lượng
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const termText = getTermText();
  const definition = getDefinitionText();
  const categoryName = getCategoryName();

  return (
    <Link href={`/terms/${term._id}`} className="term-row">
      <div className="term-row__content">
        {/* Left section - Term info */}
        <div className="term-row__main">
          <div className="term-row__title-section">
            <h3 className="term-row__title">{termText}</h3>
            {showCategory && term.category && (
              <div className="term-row__category">
                <Tag size={12} />
                <span>{categoryName}</span>
              </div>
            )}
          </div>

          <p className="term-row__definition">
            {truncateText(definition, 200)}
          </p>
        </div>

        {/* Right section - Metadata */}
        {showMetadata && (
          <div className="term-row__metadata">
            {showMetadata && (
              <>
                <div className="term-row__stat">
                  <Eye size={14} />
                  <span className="term-row__stat-value">
                    {formatCount(term.viewCount || 0)}
                  </span>
                </div>
                <div className="term-row__stat">
                  <MessageCircle size={14} />
                  <span className="term-row__stat-value">
                    {formatCount(term.commentCount || 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="term-row__actions">
            <button
              onClick={handleFavoriteClick}
              className={`term-row__favorite-btn ${favorited ? "favorited" : ""} ${
                isAnimating ? "animating" : ""
              }`}
              aria-label={favorited ? t("term.unfavorite") : t("term.favorite")}
            >
              <Heart
                size={18}
                fill={favorited ? "currentColor" : "none"}
                className="term-row__heart-icon"
              />
            </button>
            <ChevronRight size={18} className="term-row__chevron" />
          </div>
        )}
      </div>
    </Link>
  );
}
