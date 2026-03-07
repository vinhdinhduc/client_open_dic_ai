import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ForgotPasswordClient from "./ForgotPasswordClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("forgotPasswordMetaTitle"),
    description: t("forgotPasswordMetaDescription"),
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
