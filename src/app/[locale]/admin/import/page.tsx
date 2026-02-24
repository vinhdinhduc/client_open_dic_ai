import { Metadata } from "next";
import ImportClient from "./ImportClient";

export const metadata: Metadata = {
  title: "Nhập dữ liệu - Admin | Từ Điển Chuyên Ngành",
  description: "Nhập hàng loạt thuật ngữ vào hệ thống từ file Excel hoặc CSV",
};

export default function ImportPage() {
  return <ImportClient />;
}
