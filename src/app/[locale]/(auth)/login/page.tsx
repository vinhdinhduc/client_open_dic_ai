import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginClient from "./LoginClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("loginMetaTitle"),
    description: t("loginMetaDescription"),
  };
}

export default function LoginPage() {
  return <LoginClient />;
}
