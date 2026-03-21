import { Metadata } from "next";
import TermDetailAdminClient from "./TermDetailAdminClient";

export const metadata: Metadata = {
  title: "Chi tiết thuật ngữ - Admin | UTB OpenDict",
  description: "Xem và quản lý chi tiết thuật ngữ trong hệ thống từ điển",
};

export default function TermDetailAdminPage() {
  return <TermDetailAdminClient />;
}
