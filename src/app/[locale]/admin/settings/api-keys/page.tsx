import { Metadata } from "next";
import ApiKeysClient from "./ApiKeysClient";

export const metadata: Metadata = {
  title: "Quản lý API Keys - Admin | Từ Điển Chuyên Ngành",
  description: "Quản lý các khóa API cho tích hợp AI và dịch vụ bên ngoài",
};

export default function ApiKeysPage() {
  return <ApiKeysClient />;
}
