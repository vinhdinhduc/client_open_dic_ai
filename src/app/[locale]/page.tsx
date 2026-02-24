import { Metadata } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Layout } from "@/components/layouts";
import SearchBar from "@/components/search/SearchBar";

export const metadata: Metadata = {
  title: "Từ Điển Chuyên Ngành Mở - Tra cứu thuật ngữ Việt Lào Anh",
  description:
    "Tra cứu thuật ngữ chuyên ngành nhanh chóng, chính xác với hỗ trợ đa ngôn ngữ Việt - Lào - Anh. Cộng đồng đóng góp thuật ngữ mở.",
};

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <Layout>
      <SearchBar autoFocus={true} />
    </Layout>
  );
}
