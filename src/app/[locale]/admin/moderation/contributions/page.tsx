import { Metadata } from "next";
import ModerationContributionsClient from "./ModerationContributionsClient";

export const metadata: Metadata = {
  title: "Kiểm duyệt đóng góp - Admin | Từ Điển Chuyên Ngành",
  description: "Xem xét và phê duyệt các đóng góp thuật ngữ từ cộng đồng",
};

export default function AdminModerationContributionsPage() {
  return <ModerationContributionsClient />;
}
