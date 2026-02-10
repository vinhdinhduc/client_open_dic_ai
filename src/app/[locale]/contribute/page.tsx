import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContributionForm from "@/components/forms/ContributionForm";
import { Layout } from "@/components/layouts";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "contribution" });

  return {
    title: t("title"),
    description: t("title"),
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
