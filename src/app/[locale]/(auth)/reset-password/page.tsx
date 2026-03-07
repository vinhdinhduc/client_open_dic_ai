import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ResetPasswordClient from "./ResetPasswordClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("resetPasswordMetaTitle"),
    description: t("resetPasswordMetaDescription"),
  };
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
