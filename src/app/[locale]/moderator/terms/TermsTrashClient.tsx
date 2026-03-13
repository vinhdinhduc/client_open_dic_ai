"use client";

import AdminTermsClient from "../../admin/terms/AdminTermsClient";

export default function TermsTrashClient() {
  return <AdminTermsClient isModerator={true} initialStatusFilter="trash" />;
}
