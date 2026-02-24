import { Metadata } from "next";
import AdminUsersClient from "./AdminUsersClient";

export const metadata: Metadata = {
  title: "Quản lý người dùng - Admin | Từ Điển Chuyên Ngành",
  description: "Quản lý tài khoản và phân quyền người dùng trong hệ thống",
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
