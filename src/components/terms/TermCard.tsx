"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth, useLanguage } from "@/hooks";
import { TermCardProps } from "./types";
import { Heart, Eye, ChevronRight, Tag } from "lucide-react";
import "./TermCard.scss";
import toast from "react-hot-toast";
import { toPlainText } from "@/utils/safeHtml";

export default function TermCard({
  term,
  onFavoriteToggle,
  isFavorited = false,
  showCategory = true,
  showMetadata = true,
  showActions = true,
  compact = false,
  className = "",
}: TermCardProps) {
  const { currentLanguage } = useLanguage();
  const t = useTranslations();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(isFavorited);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  //Get text by language

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
  // Lấy tên danh mục theo ngôn ngữ
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
      // Lưu URL hiện tại để redirect về sau khi login
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

  //Format số lượng

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

  const definitions = getDefinitionText();

  return (
    <Link
      href={`/terms/${term._id}`}
      className={`term-card ${compact ? "term-card--compact" : ""} ${className}`}
    >
      {/* Header */}
      <div className="term-card__header">
        <div className="term-card__title-wrapper">
          <h3 className="term-card__title">{getTermText()}</h3>
        </div>

        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={handleFavoriteClick}
            className={`term-card__favorite-btn ${favorited ? "favorited" : ""} ${
              isAnimating ? "animating" : ""
            }`}
            aria-label={favorited ? t("term.unfavorite") : t("term.favorite")}
          >
            <Heart size={20} fill={favorited ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Category */}
      {showCategory && term.category && (
        <div className="term-card__meta-row">
          <div className="term-card__category">
            <Tag size={14} />
            <span>{getCategoryName()}</span>
          </div>
        </div>
      )}

      {/* Definition */}
      <div className="term-card__definition">
        {compact
          ? truncateText(definitions, 120)
          : truncateText(definitions, 200)}
      </div>

      {/* Metadata Footer */}
      {showMetadata && (
        <div className="term-card__footer">
          <div className="term-card__stats">
            <div className="term-card__stat">
              <Eye size={16} />
              <span>{formatCount(term.viewCount)}</span>
            </div>

            {term.favoriteCount !== undefined && term.favoriteCount > 0 && (
              <div className="term-card__stat">
                <Heart size={16} />
                <span>{formatCount(term.favoriteCount)}</span>
              </div>
            )}
          </div>

          {/* View Details Arrow */}
          <div className="term-card__action">
            <span className="term-card__view-text">
              {t("term.viewDetails")}
            </span>
            <ChevronRight size={18} />
          </div>
        </div>
      )}
    </Link>
  );
}
