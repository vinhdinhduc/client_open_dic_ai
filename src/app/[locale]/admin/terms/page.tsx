import { Metadata } from "next";
import AdminTermsClient from "./AdminTermsClient";

export const metadata: Metadata = {
  title: "Quản lý thuật ngữ - Admin | OpenDict",
  description: "Quản lý, thêm, sửa, xóa thuật ngữ trong hệ thống từ điển",
};

export default function AdminTermsPage() {
  return <AdminTermsClient />;
}
