import { Metadata } from "next";
import TermDetailAdminClient from "./TermDetailAdminClient";

export const metadata: Metadata = {
  title: "Chi tiết thuật ngữ - Admin | Từ Điển Chuyên Ngành",
  description: "Xem và quản lý chi tiết thuật ngữ trong hệ thống từ điển",
};

export default function TermDetailAdminPage() {
  return <TermDetailAdminClient />;
}
