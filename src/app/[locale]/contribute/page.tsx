import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContributionForm from "@/components/forms/ContributionForm";
import { Layout } from "@/components/layouts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribution" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ContributePage() {
  return (
    <Layout>
      <div className="page-container">
        <ContributionForm />
      </div>
    </Layout>
  );
}
