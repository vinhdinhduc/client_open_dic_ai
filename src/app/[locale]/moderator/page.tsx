import { Metadata } from "next";
import ModeratorDashboardClient from "./ModeratorDashboardClient";

export const metadata: Metadata = {
  title: "Tổng quan Kiểm duyệt viên - OpenDict",
  description: "Bảng điều khiển kiểm duyệt thuật ngữ và nội dung từ điển",
};

export default function ModeratorDashboardPage() {
  return <ModeratorDashboardClient />;
}
