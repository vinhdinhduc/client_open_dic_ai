import { Metadata } from "next";
import ReputationClient from "./ReputationClient";

export const metadata: Metadata = {
  title: "Điểm Uy Tín - UTB OpenDict",
  description: "Theo dõi điểm uy tín và bảng xếp hạng",
};

export default function ReputationPage() {
  return <ReputationClient />;
}
