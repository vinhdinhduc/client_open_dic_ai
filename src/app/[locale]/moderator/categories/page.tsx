import { Metadata } from "next";
import ModeratorCategoriesClient from "./ModeratorCategoriesClient";

export const metadata: Metadata = {
  title: "Quản lý danh mục - Kiểm duyệt viên | Từ Điển Chuyên Ngành",
  description: "Quản lý các chuyên ngành được phân công kiểm duyệt",
};

export default function ModeratorCategoriesPage() {
  return <ModeratorCategoriesClient />;
}
