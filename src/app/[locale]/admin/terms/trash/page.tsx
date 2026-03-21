import { Metadata } from "next";
import TermsTrashClient from "../TermsTrashClient";

export const metadata: Metadata = {
  title: "Thùng rác thuật ngữ - Admin | UTB OpenDict",
  description: "Quản lý các thuật ngữ đã xoá mềm",
};

export default function AdminTermsTrashPage() {
  return <TermsTrashClient />;
}
