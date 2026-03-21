import { Metadata } from "next";
import { AddTermForm } from "@/components/forms/manage_terms/AddTermForm";
import "../../../admin/terms/terms.scss";

export const metadata: Metadata = {
  title: "Thêm thuật ngữ mới - Moderator | UTB OpenDict",
  description: "Thêm thuật ngữ mới trong phạm vi quản lý của moderator",
};

export default function ModeratorNewTermPage() {
  return (
    <div className="terms-page">
      <AddTermForm />
    </div>
  );
}
