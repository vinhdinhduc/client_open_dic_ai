import { Metadata } from "next";
import ContributionsClient from "./ContributionsClient";

export const metadata: Metadata = {
  title: "Đóng góp của tôi - Từ Điển Chuyên Ngành",
  description: "Quản lý và theo dõi trạng thái các đóng góp thuật ngữ của bạn",
};

export default function ContributionsPage() {
  return <ContributionsClient />;
}
