"use client";

import { useState } from "react";
import { TermCardData } from "@/components/terms/types";
import TermCard from "@/components/terms/TermCard";

interface SearchResultsClientProps {
  initialTerms: TermCardData[];
  query: string;
}

export default function SearchResultsClient({
  initialTerms,
  query,
}: SearchResultsClientProps) {
  const [terms] = useState<TermCardData[]>(initialTerms);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const handleFavoriteToggle = (termId: string, isFavorited: boolean) => {
    const newFavorites = new Set(favoriteIds);
    if (isFavorited) {
      newFavorites.add(termId);
    } else {
      newFavorites.delete(termId);
    }
    setFavoriteIds(newFavorites);
  };

  return (
    <div className="search-results-page">
      <div className="container">
        <h1 className="search-results-page__title">
          Kết quả tìm kiếm cho &quot;{query}&quot;
        </h1>

        <div className="search-results-page__count">
          Tìm thấy {terms?.length || 0} kết quả
        </div>

        <div className="search-results-page__list">
          {terms?.map((term) => (
            <TermCard
              key={term._id}
              term={term}
              isFavorited={favoriteIds.has(term._id)}
              onFavoriteToggle={handleFavoriteToggle}
              showCategory={true}
              showMetadata={true}
              showActions={true}
            />
          ))}
        </div>

        {(!terms || terms.length === 0) && (
          <div className="search-results-page__empty">
            Không tìm thấy kết quả phù hợp
          </div>
        )}
      </div>
    </div>
  );
}
