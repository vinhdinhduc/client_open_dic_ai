"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ViewDetailTerm } from "@/components/forms/manage_terms/ViewDetailTerm";

export default function TermDetailPage() {
  const params = useParams();
  const termId = params.id as string;

  if (!termId) {
    return (
      <div
        className="error-container"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <h2>Lỗi</h2>
        <p>Không tìm thấy ID thuật ngữ</p>
      </div>
    );
  }

  return <ViewDetailTerm termId={termId} />;
}
