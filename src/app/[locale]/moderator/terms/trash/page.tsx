import { Metadata } from "next";
import TermsTrashClient from "../TermsTrashClient";

export const metadata: Metadata = {
  title: "Thung rac thuat ngu - Moderator | OpenDict",
  description: "Quan ly thuat ngu da xoa mem trong danh muc duoc phan cong",
};

export default function ModeratorTermsTrashPage() {
  return <TermsTrashClient />;
}
