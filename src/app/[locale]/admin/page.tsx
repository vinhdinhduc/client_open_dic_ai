import { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Tổng quan Admin - Từ Điển Chuyên Ngành",
  description: "Bảng điều khiển quản trị hệ thống từ điển chuyên ngành",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
