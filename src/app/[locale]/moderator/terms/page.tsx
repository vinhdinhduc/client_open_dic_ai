import { Metadata } from "next";
import AdminTermsClient from "../../admin/terms/AdminTermsClient";

export const metadata: Metadata = {
  title: "Quản lý thuật ngữ - Moderator | UTB OpenDict",
  description: "Quản lý thuật ngữ được phân công cho moderator",
};

export default function ModeratorTermsPage() {
  return <AdminTermsClient />;
}
