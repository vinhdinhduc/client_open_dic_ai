import { Metadata } from "next";
import ContributionsTrashClient from "../ContributionsTrashClient";

export const metadata: Metadata = {
  title: "Thung rac dong gop - Moderator | OpenDict",
  description: "Quan ly dong gop da xoa mem trong cac danh muc duoc phan cong",
};

export default function ModeratorContributionsTrashPage() {
  return <ContributionsTrashClient />;
}
