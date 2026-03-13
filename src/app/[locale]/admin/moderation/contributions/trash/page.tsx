import { Metadata } from "next";
import ContributionsTrashClient from "../ContributionsTrashClient";

export const metadata: Metadata = {
  title: "Thung rac dong gop - Admin | OpenDict",
  description: "Quan ly dong gop da xoa mem va khoi phuc khi can",
};

export default function AdminModerationContributionsTrashPage() {
  return <ContributionsTrashClient />;
}
