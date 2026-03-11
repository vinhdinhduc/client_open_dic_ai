import { Metadata } from "next";
import AdminFeedbackClient from "./Admin";

export const metadata: Metadata = {
  title: "Phản hồi & Đăng ký kiểm duyệt - Admin | UTB OpenDict",
  description: "Quản lý phản hồi người dùng và đơn đăng ký kiểm duyệt viên",
};

export default function AdminFeedbackPage() {
  return <AdminFeedbackClient />;
}
