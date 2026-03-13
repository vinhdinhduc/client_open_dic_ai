import { Metadata } from "next";
import ReportsTrashClient from "../ReportsTrashClient";

export const metadata: Metadata = {
  title: "Thùng rác báo cáo - Admin | OpenDict",
  description: "Quản lý báo cáo đã xoá mềm và khôi phục khi cần",
};

export default function AdminReportsTrashPage() {
  return <ReportsTrashClient />;
}
