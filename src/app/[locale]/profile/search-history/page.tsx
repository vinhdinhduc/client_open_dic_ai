import { Metadata } from "next";
import SearchHistoryClient from "./SearchHistoryClient";

export const metadata: Metadata = {
  title: "Lịch sử tra cứu - Từ Điển Chuyên Ngành",
  description: "Xem lại các thuật ngữ bạn đã tìm kiếm trước đây",
};

export default function SearchHistoryPage() {
  return <SearchHistoryClient />;
}
