import { Metadata } from "next";
import NewTermClient from "./NewTermClient";

export const metadata: Metadata = {
  title: "Thêm thuật ngữ mới - Admin | Từ Điển Chuyên Ngành",
  description: "Thêm thuật ngữ chuyên ngành mới vào hệ thống từ điển",
};

export default function NewTermPage() {
  return <NewTermClient />;
}
