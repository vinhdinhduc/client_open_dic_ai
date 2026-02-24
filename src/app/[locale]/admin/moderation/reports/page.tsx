import { Metadata } from "next";
import ModerationReportsClient from "./ModerationReportsClient";

export const metadata: Metadata = {
  title: "Kiểm duyệt báo cáo - Admin | Từ Điển Chuyên Ngành",
  description: "Xem xét và xử lý các báo cáo vi phạm từ người dùng",
};

export default function AdminModerationReportsPage() {
  return <ModerationReportsClient />;
}
