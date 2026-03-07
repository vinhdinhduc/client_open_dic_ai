import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContributionsClient from "./ContributionsClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribution" });
  return {
    title: t("myContributionsMetaTitle"),
    description: t("myContributionsMetaDescription"),
  };
}

export default function ContributionsPage() {
  return <ContributionsClient />;
}
