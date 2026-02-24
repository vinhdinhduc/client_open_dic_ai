import { Metadata } from "next";
import ContributionDetailClient from "./ContributionDetailClient";

export const metadata: Metadata = {
  title: "Chi tiết đóng góp - Từ Điển Chuyên Ngành",
  description: "Xem chi tiết và trạng thái đóng góp thuật ngữ của bạn",
};

export default function ContributionDetailPage() {
  return <ContributionDetailClient />;
}
