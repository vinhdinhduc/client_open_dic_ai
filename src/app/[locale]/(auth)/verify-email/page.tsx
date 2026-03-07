import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import VerifyEmailClient from "./VerifyEmailClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("verifyEmailMetaTitle"),
    description: t("verifyEmailMetaDescription"),
  };
}

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
