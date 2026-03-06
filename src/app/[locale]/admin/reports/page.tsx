import { Metadata } from "next";
import AdminReportsClient from "./AdminReportsClient";

export const metadata: Metadata = {
  title: "Báo cáo & Thống kê - Admin | OpenDict",
  description:
    "Xem báo cáo thống kê về thuật ngữ, người dùng và hoạt động hệ thống",
};

export default function AdminReportsPage() {
  return <AdminReportsClient />;
}
