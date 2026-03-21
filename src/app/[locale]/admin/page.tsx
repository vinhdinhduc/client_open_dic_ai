import { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Tổng quan Admin - UTB OpenDict",
  description: "Bảng điều khiển quản trị hệ thống UTB OpenDict",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
