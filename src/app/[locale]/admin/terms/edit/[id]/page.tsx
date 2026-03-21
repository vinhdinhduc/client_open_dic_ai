import { Metadata } from "next";
import EditTermClient from "./EditTermClient";

export const metadata: Metadata = {
  title: "Chỉnh sửa thuật ngữ - Admin | UTB OpenDict",
  description: "Chỉnh sửa thông tin thuật ngữ trong hệ thống từ điển",
};

export default function EditTermPage() {
  return <EditTermClient />;
}
