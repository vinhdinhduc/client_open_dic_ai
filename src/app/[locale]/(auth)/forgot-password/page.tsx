import { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Quên mật khẩu - Từ Điển Chuyên Ngành",
  description: "Khôi phục mật khẩu tài khoản từ điển chuyên ngành của bạn",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
