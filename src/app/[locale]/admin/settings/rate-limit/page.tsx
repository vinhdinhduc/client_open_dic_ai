import { Metadata } from "next";
import RateLimitClient from "./RateLimitClient";

export const metadata: Metadata = {
  title: "Giới hạn tốc độ - Admin | UTB OpenDict",
  description: "Cấu hình giới hạn tốc độ API và bảo mật hệ thống từ điển",
};

export default function RateLimitPage() {
  return <RateLimitClient />;
}
