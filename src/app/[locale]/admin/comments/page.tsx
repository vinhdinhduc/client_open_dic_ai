import { Metadata } from "next";
import AdminCommentsClient from "./AdminCommentsClient";

export const metadata: Metadata = {
  title: "Quản lý bình luận - Admin | UTB OpenDict",
  description: "Kiểm duyệt và quản lý bình luận của người dùng trong hệ thống",
};

export default function AdminCommentsPage() {
  return <AdminCommentsClient />;
}
