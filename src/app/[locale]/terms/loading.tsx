import { SearchLoading } from "@/components/common";
import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("common");

  return <SearchLoading text={t("searching")} />;
}
