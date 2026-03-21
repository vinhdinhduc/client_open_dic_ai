import { Metadata } from "next";
import ReportsTrashClient from "../ReportsTrashClient";

export const metadata: Metadata = {
  title: "Thùng rác báo cáo - Moderator | UTB OpenDict",
  description: "Quản lý báo cáo đã xoá mềm trong danh mục được phân công",
};

export default function ModeratorReportsTrashPage() {
  return <ReportsTrashClient />;
}
