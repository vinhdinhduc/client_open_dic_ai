import { Metadata } from "next";
import ModeratorContributionsClient from "./ModeratorContributionsClient";

export const metadata: Metadata = {
  title: "Kiểm duyệt đóng góp - Kiểm duyệt viên |UTB OpenDict",
  description:
    "Xem xét và phê duyệt đóng góp thuật ngữ trong danh mục được phân công",
};

export default function ModeratorContributionsPage() {
  return <ModeratorContributionsClient />;
}
