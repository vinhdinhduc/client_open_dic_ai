import { Metadata } from "next";
import TermsTrashClient from "../TermsTrashClient";

export const metadata: Metadata = {
  title: "Thùng rác thuật ngữ - Moderator | OpenDict",
  description: "Quản lý thuật ngữ đã xoá mềm trong danh mục được phân công",
};

export default function ModeratorTermsTrashPage() {
  return <TermsTrashClient />;
}
