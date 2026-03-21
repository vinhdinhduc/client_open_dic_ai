import { Metadata } from "next";
import ContributionsTrashClient from "../ContributionsTrashClient";

export const metadata: Metadata = {
  title: "Thùng rác đóng góp - Admin | UTBOpenDict",
  description: "Quản lý đóng góp đã xoá mềm và khôi phục khi cần",
};

export default function AdminModerationContributionsTrashPage() {
  return <ContributionsTrashClient />;
}
