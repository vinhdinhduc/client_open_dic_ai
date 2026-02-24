import { Metadata } from "next";
import FavoritesClient from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Thuật ngữ yêu thích - Từ Điển Chuyên Ngành",
  description: "Danh sách các thuật ngữ chuyên ngành bạn đã lưu vào yêu thích",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
