import { getTranslations } from "next-intl/server";
import { Layout } from "@/components/layouts";
import LeaderboardClient from "./LeaderboardClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboardPage" });
  return {
    title: `${t("title")} - UTB OpenDict`,
    description: t("subtitle"),
  };
}

export default async function LeaderboardPage() {
  return (
    <Layout>
      <LeaderboardClient />
    </Layout>
  );
}
