import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProfileClient from "./ProfileClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ProfilePage() {
  return <ProfileClient />;
}
