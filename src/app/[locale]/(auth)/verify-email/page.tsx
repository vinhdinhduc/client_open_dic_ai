import { Metadata } from "next";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata: Metadata = {
  title: "Xác thực Email - Từ Điển Chuyên Ngành",
  description:
    "Xác thực địa chỉ email để kích hoạt tài khoản từ điển chuyên ngành",
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
