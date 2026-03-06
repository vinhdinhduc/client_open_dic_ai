import { Metadata } from "next";
import EmailSettingsClient from "./EmailSettingsClient";

export const metadata: Metadata = {
  title: "Cài đặt Email - Admin | OpenDict",
  description: "Cấu hình email thông báo cho hệ thống OpenDict",
};

export default function EmailSettingsPage() {
  return <EmailSettingsClient />;
}
