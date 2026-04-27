import { Suspense } from "react";
import { Layout } from "@/components/layouts";
import { SearchLoading } from "@/components/common";
import { searchTermsServer } from "@/lib/serverAxios";
import SearchResultsClient from "./SearchResults";
import "./Term.scss";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

// Bắt buộc render động - kết quả tìm kiếm luôn phải mới nhất
export const dynamic = "force-dynamic";

// Tạo metadata cho SEO
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const [{ locale }, { q: query }] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "searchResults" });
  return {
    title: query
      ? `${t("metaSearchPrefix")}: ${query} - UTB OpenDict`
      : t("metaTitle"),
    description: query
      ? `${t("metaSearchDescription")} "${query}"`
      : t("metaDescription"),
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

// Component trang chính dùng Suspense để tải từng phần
export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const { q: query = "", lang: language = "vi" } = await searchParams;
  const t = await getTranslations("common");
  return (
    <Layout>
      <Suspense fallback={<SearchLoading text={t("searching")} />}>
        <SearchResultsServer query={query} language={language} />
      </Suspense>
    </Layout>
  );
}
