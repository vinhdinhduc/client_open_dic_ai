import { TermCardData } from "@/components/terms/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { searchTerms } from "@/services/termService";
import { BallTriangle } from "react-loader-spinner";
import TermCard from "@/components/terms/TermCard";
export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [terms, setTerms] = useState<TermCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);

      try {
        const res = await searchTerms(query);
        setTerms(res.terms);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    }

    if (query) {
      fetchResults();
    }
  }, [query]);

  const handleFavoriteToggle = (termId: string, isFavorited: boolean) => {
    const newFavorites = new Set(favoriteIds);
    if (isFavorited) {
      newFavorites.add(termId);
    } else {
      newFavorites.delete(termId);
    }
    setFavoriteIds(newFavorites);
  };

  if (loading) {
    return (
      <div className="loading">
        <BallTriangle
          height="100"
          width="100"
          color="#4fa94d"
          ariaLabel="ball-triangle-loading"
        />
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="container">
        <h1 className="search-results-page__title">
          Kết quả tìm kiếm cho "{query}"
        </h1>

        <div className="search-results-page__count">
          Tìm thấy {terms.length} kết quả
        </div>

        <div className="search-results-page__list">
          {terms.map((term) => (
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

        {terms.length === 0 && (
          <div className="search-results-page__empty">
            Không tìm thấy kết quả phù hợp
          </div>
        )}
      </div>
    </div>
  );
}
