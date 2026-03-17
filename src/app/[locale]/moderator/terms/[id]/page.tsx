import { Metadata } from "next";
import { ViewDetailTerm } from "@/components/forms/manage_terms/ViewDetailTerm";

interface ModeratorTermDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Chi tiết thuật ngữ - Moderator | OpenDict",
  description: "Xem và quản lý chi tiết thuật ngữ trong phạm vi moderator",
};

export default async function ModeratorTermDetailPage({
  params,
}: ModeratorTermDetailPageProps) {
  const { id } = await params;

  return <ViewDetailTerm termId={id} />;
}
