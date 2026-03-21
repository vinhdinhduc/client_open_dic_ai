import { Metadata } from "next";
import NewTermClient from "./NewTermClient";

export const metadata: Metadata = {
  title: "Thêm thuật ngữ mới - Admin | UTB OpenDict",
  description: "Thêm thuật ngữ mới vào hệ thống UTB OpenDict",
};

export default function NewTermPage() {
  return <NewTermClient />;
}
