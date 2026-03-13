import { Metadata } from "next";
import AdminReputationClient from "./AdminReputationClient";

export const metadata: Metadata = {
  title: "Quản lý Điểm Uy Tín - Admin OpenDict",
  description: "Quản lý điểm uy tín và yêu cầu đổi điểm",
};

export default function AdminReputationPage() {
  return <AdminReputationClient />;
}
