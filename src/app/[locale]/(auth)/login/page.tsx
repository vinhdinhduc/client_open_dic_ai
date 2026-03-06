import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Đăng nhập - OpenDict",
  description: "Đăng nhập vào Hệ thống Từ điển  đa ngôn ngữ Việt - Lào - Anh",
};

export default function LoginPage() {
  return <LoginClient />;
}
