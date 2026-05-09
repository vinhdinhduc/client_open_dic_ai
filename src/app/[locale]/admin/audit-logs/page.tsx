import { Metadata } from "next";
import AuditLogsClient from "./AuditLogsClient";

export const metadata: Metadata = {
  title: "Audit Logs - UTB OpenDict Admin",
  description: "Quản lý audit logs hệ thống",
};

export default function AuditLogsPage() {
  return <AuditLogsClient />;
}
