import { Metadata } from "next";
import ContributionsTrashClient from "../ContributionsTrashClient";

export const metadata: Metadata = {
  title: "Thùng rác đóng góp - Moderator | UTB OpenDict",
  description: "Quản lý đóng góp đã xoá mềm trong các danh mục được phân công",
};

export default function ModeratorContributionsTrashPage() {
  return <ContributionsTrashClient />;
}
