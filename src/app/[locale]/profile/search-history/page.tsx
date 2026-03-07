import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SearchHistoryClient from "./SearchHistoryClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "searchHistory" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function SearchHistoryPage() {
  return <SearchHistoryClient />;
}
