import { Metadata } from "next";
import { EditTermForm } from "@/components/forms/manage_terms/EditTermForm";
import "../../../../admin/terms/terms.scss";

interface ModeratorEditTermPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Chỉnh sửa thuật ngữ - Moderator | OpenDict",
  description: "Chỉnh sửa thuật ngữ trong phạm vi quản lý của moderator",
};

export default async function ModeratorEditTermPage({
  params,
}: ModeratorEditTermPageProps) {
  const { id } = await params;

  return (
    <div className="terms-page">
      <EditTermForm termId={id} />
    </div>
  );
}
