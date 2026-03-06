import { Metadata } from "next";
import ModeratorCategoriesClient from "./ModeratorCategoriesClient";

export const metadata: Metadata = {
  title: "Quản lý danh mục - Kiểm duyệt viên | OpenDict",
  description: "Quản lý các từ điển được phân công kiểm duyệt",
};

export default function ModeratorCategoriesPage() {
  return <ModeratorCategoriesClient />;
}
