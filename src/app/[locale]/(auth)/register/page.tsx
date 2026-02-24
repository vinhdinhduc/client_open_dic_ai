import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Đăng ký - Từ Điển Chuyên Ngành",
  description:
    "Tạo tài khoản miễn phí để đóng góp thuật ngữ và sử dụng đầy đủ tính năng từ điển",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
