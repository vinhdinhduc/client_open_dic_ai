import { Metadata } from "next";
import AdminCategoriesClient from "./AdminCategoriesClient";

export const metadata: Metadata = {
  title: "Quản lý danh mục - Admin | Từ Điển Chuyên Ngành",
  description: "Quản lý các chuyên ngành và danh mục thuật ngữ trong hệ thống",
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesClient />;
}
