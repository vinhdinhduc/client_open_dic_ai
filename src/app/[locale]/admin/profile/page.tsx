import { Metadata } from "next";
import AdminProfileClient from "./AdminProfileClient";

export const metadata: Metadata = {
  title: "Tài khoản - Admin | OpenDict",
  description: "Quản lý thông tin tài khoản quản trị viên",
};

export default function AdminProfilePage() {
  return <AdminProfileClient />;
}
