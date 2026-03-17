import { getTranslations } from "next-intl/server";
import { Layout } from "@/components/layouts";
import PublicProfileClient from "./PublicProfileClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "publicProfile" });
  return {
    title: `${t("title")} - UTB OpenDict`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Layout>
      <PublicProfileClient userId={id} />
    </Layout>
  );
}
