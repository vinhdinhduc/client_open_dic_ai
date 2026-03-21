import { Metadata } from "next";
import ModeratorCommentsClient from "./ModeratorCommentsClient";

export const metadata: Metadata = {
  title: "Kiểm duyệt bình luận - UTB OpenDict",
  description:
    "Xem xét và kiểm duyệt bình luận của người dùng trong danh mục được phân công",
};

export default function ModeratorCommentsPage() {
  return <ModeratorCommentsClient />;
}
