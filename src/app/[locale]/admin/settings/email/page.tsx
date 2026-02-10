import AdminEmailSettings from "@/components/admin/AdminEmailSettings";
import { Mail } from "lucide-react";

export default function SettingsEmailPage() {
  return (
    <div className="admin-settings__email">
      <div className="admin-settings__header">
        <h1>
          {" "}
          <Mail size={28} />
          Cấu hình Email
        </h1>
      </div>
      <AdminEmailSettings />
    </div>
  );
}
