import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TermDetailClient from "./TermDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "searchResults" });
  return {
    title: t("termDetailMetaTitle"),
    description: t("termDetailMetaDescription"),
  };
}

export default function TermDetailPage() {
  return <TermDetailClient />;
}
