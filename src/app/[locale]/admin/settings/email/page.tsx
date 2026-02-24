import { Metadata } from "next";
import EmailSettingsClient from "./EmailSettingsClient";

export const metadata: Metadata = {
  title: "Cài đặt Email - Admin | Từ Điển Chuyên Ngành",
  description: "Cấu hình email thông báo cho hệ thống từ điển chuyên ngành",
};

export default function EmailSettingsPage() {
  return <EmailSettingsClient />;
}
