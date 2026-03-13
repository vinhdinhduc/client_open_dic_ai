import { Metadata } from "next";
import ReportsTrashClient from "../ReportsTrashClient";

export const metadata: Metadata = {
  title: "Thung rac bao xau - Moderator | OpenDict",
  description: "Quan ly bao xau da xoa mem trong danh muc duoc phan cong",
};

export default function ModeratorReportsTrashPage() {
  return <ReportsTrashClient />;
}
