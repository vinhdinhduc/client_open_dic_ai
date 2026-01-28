"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/hooks";
import { TermCardData, TermCardProps } from "./types";
import {
  Heart,
  Eye,
  MessageCircle,
  BookOpen,
  Star,
  Sparkles,
  FileText,
  Users,
  ChevronRight,
  Tag,
} from "lucide-react";
import "./TermCard.scss";

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
  const [favorited, setFavorited] = useState(isFavorited);
  const [isAnimating, setIsAnimating] = useState(false);

  //Get text by language

  const getTermText = (): string => {
    return (
      term.term[currentLanguage] || term.term["en"] || term.term["vi"] || ""
    );
  };

  const getDefinitionText = (): string => {
    const definition =
      term.definitions.find((def) => def.language === currentLanguage) ||
      term.definitions.find((def) => def.language === "vi");

    return definition?.content || "";
  };
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "ai":
        return <Sparkles size={14} />;
      case "manual":
        return <BookOpen size={14} />;
      case "contribution":
        return <Users size={14} />;
      case "import":
        return <FileText size={14} />;
      default:
        return <BookOpen size={14} />;
    }
  };

  // Lấy level badge color
  const getLevelClass = (level: string): string => {
    switch (level) {
      case "basic":
        return "level-basic";
      case "intermediate":
        return "level-intermediate";
      case "advanced":
        return "level-advanced";
      default:
        return "level-basic";
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const definition = getDefinitionText();

  const definitionSource =
    term.definitions.find((def) => def.language === currentLanguage) ||
    term.definitions.find((def) => def.language === "vi");
  return (
    <Link
      href={`/terms/${term._id}`}
      className={`term-card ${compact ? "term-card--compact" : ""} ${className}`}
    >
      {/* Header */}
      <div className="term-card__header">
        <div className="term-card__title-wrapper">
          <h3 className="term-card__title">{getTermText()}</h3>

          {/* Source Badge */}
          {definitionSource && (
            <div
              className={`term-card__source-badge source-${definitionSource.source}`}
            >
              {getSourceIcon(definitionSource.source)}
              <span>{t(`term.source.${definitionSource.source}`)}</span>
            </div>
          )}
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

      {/* Category & Level */}
      {showCategory && term.categoryName && (
        <div className="term-card__meta-row">
          <div className="term-card__category">
            <Tag size={14} />
            <span>{term.categoryName}</span>
          </div>

          {definitionSource && (
            <div
              className={`term-card__level ${getLevelClass(definitionSource.level)}`}
            >
              <Star size={14} />
              <span>{t(`term.level.${definitionSource.level}`)}</span>
            </div>
          )}
        </div>
      )}

      {/* Definition */}
      <div className="term-card__definition">
        {compact
          ? truncateText(definition, 120)
          : truncateText(definition, 200)}
      </div>

      {/* Tags */}
      {!compact && term.tags && term.tags.length > 0 && (
        <div className="term-card__tags">
          {term.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="term-card__tag">
              {tag}
            </span>
          ))}
          {term.tags.length > 3 && (
            <span className="term-card__tag-more">+{term.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Metadata Footer */}
      {showMetadata && (
        <div className="term-card__footer">
          <div className="term-card__stats">
            <div className="term-card__stat">
              <Eye size={16} />
              <span>{formatCount(term.metadata.views)}</span>
            </div>

            <div className="term-card__stat">
              <Heart size={16} />
              <span>{formatCount(term.metadata.favorites)}</span>
            </div>

            {term.metadata.searchCount > 0 && (
              <div className="term-card__stat">
                <MessageCircle size={16} />
                <span>{formatCount(term.metadata.searchCount)}</span>
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
