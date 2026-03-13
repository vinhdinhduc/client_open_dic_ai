import { Metadata } from "next";
import ReportsTrashClient from "../ReportsTrashClient";

export const metadata: Metadata = {
  title: "Thung rac bao xau - Admin | OpenDict",
  description: "Quan ly bao xau da xoa mem va khoi phuc khi can",
};

export default function AdminReportsTrashPage() {
  return <ReportsTrashClient />;
}
