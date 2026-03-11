import { Metadata } from "next";
import ImportClient from "../../admin/import/ImportClient";

export const metadata: Metadata = {
  title: "Nhập dữ liệu - Moderator | UTB OpenDict",
  description: "Nhập hàng loạt thuật ngữ vào hệ thống từ file Excel hoặc CSV",
};

export default function ModeratorImportPage() {
  return <ImportClient />;
}
