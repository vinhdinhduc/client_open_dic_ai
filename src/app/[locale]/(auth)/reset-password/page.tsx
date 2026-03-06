import { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - OpenDict",
  description: "Đặt lại mật khẩu mới cho tài khoản từ điển chuyên ngành",
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
