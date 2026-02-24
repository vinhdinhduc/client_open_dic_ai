import { Metadata } from "next";
import TermDetailClient from "./TermDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Chi tiết thuật ngữ - Từ Điển Chuyên Ngành`,
    description: `Xem định nghĩa và giải thích chi tiết thuật ngữ chuyên ngành trong từ điển đa ngôn ngữ Việt - Lào - Anh`,
  };
}

export default function TermDetailPage() {
  return <TermDetailClient />;
}
