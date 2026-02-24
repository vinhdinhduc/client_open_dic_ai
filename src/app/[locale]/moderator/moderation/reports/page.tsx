import { Metadata } from "next";
import ModeratorReportsClient from "./ModeratorReportsClient";

export const metadata: Metadata = {
  title: "Kiểm duyệt báo cáo - Kiểm duyệt viên | Từ Điển Chuyên Ngành",
  description: "Xem xét và xử lý báo cáo vi phạm trong danh mục được phân công",
};

export default function ModeratorReportsPage() {
  return <ModeratorReportsClient />;
}
