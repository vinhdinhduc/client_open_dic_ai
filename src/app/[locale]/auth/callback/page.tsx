import { Metadata } from "next";
import CallbackClient from "./CallbackClient";

export const metadata: Metadata = {
  title: "Đăng nhập - OpenDict",
  description: "Xác thực đăng nhập qua Google",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return <CallbackClient />;
}
