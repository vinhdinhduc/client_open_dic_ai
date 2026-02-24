import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Đăng nhập - Từ Điển Chuyên Ngành",
  description:
    "Đăng nhập vào hệ thống từ điển chuyên ngành đa ngôn ngữ Việt - Lào - Anh",
};

export default function LoginPage() {
  return <LoginClient />;
}
