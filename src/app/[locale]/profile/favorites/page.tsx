import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FavoritesClient from "./FavoritesClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "favorites" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function FavoritesPage() {
  return <FavoritesClient />;
}
