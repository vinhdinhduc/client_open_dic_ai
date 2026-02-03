import { Suspense } from "react";
import { Layout } from "@/components/layouts";
import { SearchLoading } from "@/components/common";
import { searchTermsServer } from "@/lib/serverAxios";
import SearchResultsClient from "./SearchResults";
import "./Term.scss";

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

// Generate metadata for SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const { q: query } = await searchParams;
  return {
    title: query
      ? `Tìm kiếm: ${query} - Từ Điển Chuyên Ngành`
      : "Tìm kiếm thuật ngữ - Từ Điển Chuyên Ngành",
    description: query
      ? `Kết quả tìm kiếm cho "${query}" trong từ điển chuyên ngành`
      : "Tìm kiếm thuật ngữ chuyên ngành bằng tiếng Việt, Anh và Lào",
  };
}

// Server Component to fetch search results
async function SearchResultsServer({
  query,
  language,
}: {
  query: string;
  language: string;
}) {
  if (!query) {
    return (
      <div className="search-results-page">
        <div className="container">
          <div className="search-results-page__empty">
            Vui lòng nhập từ khóa để tìm kiếm
          </div>
        </div>
      </div>
    );
  }

  const result = await searchTermsServer(query, language);
  const terms = result?.data?.terms || [];

  return <SearchResultsClient initialTerms={terms} query={query} />;
}

// Main page component with Suspense for streaming
export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const { q: query = "", lang: language = "vi" } = await searchParams;

  return (
    <Layout>
      <Suspense fallback={<SearchLoading text="Đang tìm kiếm..." />}>
        <SearchResultsServer query={query} language={language} />
      </Suspense>
    </Layout>
  );
}
