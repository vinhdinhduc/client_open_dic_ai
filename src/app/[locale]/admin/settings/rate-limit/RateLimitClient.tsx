import { AdminRateLimitSettings } from "@/components/admin";
import { Shield } from "lucide-react";

export default function SettingsRateLimitPage() {
  return (
    <div className="admin-settings__rate-limit">
      <div className="admin-settings__header">
        <h1>
          <Shield size={28} />
          Cấu hình Rate Limit
        </h1>
        <p>Quản lý giới hạn số lượng request để bảo vệ hệ thống</p>
      </div>
      <AdminRateLimitSettings />
    </div>
  );
}
