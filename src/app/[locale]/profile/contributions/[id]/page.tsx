import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContributionDetailClient from "./ContributionDetailClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribution" });
  return {
    title: t("detailMetaTitle"),
    description: t("detailMetaDescription"),
  };
}

export default function ContributionDetailPage() {
  return <ContributionDetailClient />;
}
