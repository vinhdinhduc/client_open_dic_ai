import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân - Từ Điển Chuyên Ngành",
  description: "Quản lý thông tin cá nhân và xem thống kê đóng góp của bạn",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
