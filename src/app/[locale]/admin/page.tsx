import { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Tổng quan Admin - OpenDict",
  description: "Bảng điều khiển quản trị hệ thống OpenDict",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
