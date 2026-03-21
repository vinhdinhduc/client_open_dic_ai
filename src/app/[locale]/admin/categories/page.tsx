import { Metadata } from "next";
import AdminCategoriesClient from "./AdminCategoriesClient";

export const metadata: Metadata = {
  title: "Quản lý danh mục - Admin | UTB OpenDict",
  description: "Quản lý các từ điển và danh mục thuật ngữ trong hệ thống",
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesClient />;
}
