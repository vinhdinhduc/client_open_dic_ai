import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import RegisterClient from "./RegisterClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("registerMetaTitle"),
    description: t("registerMetaDescription"),
  };
}

export default function RegisterPage() {
  return <RegisterClient />;
}
