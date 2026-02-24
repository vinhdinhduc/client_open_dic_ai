"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EditTermForm } from "@/components/forms/manage_terms/EditTermForm";

export default function EditTermPage() {
  const params = useParams();
  const termId = params.id as string;

  if (!termId) {
    return (
      <div className="error-container">
        <h2>Lỗi</h2>
        <p>Không tìm thấy ID thuật ngữ</p>
      </div>
    );
  }

  return <EditTermForm termId={termId} />;
}
