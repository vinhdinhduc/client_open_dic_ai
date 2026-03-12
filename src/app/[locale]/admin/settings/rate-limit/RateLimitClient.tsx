"use client";

import { AdminRateLimitSettings } from "@/components/admin";
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SettingsRateLimitPage() {
  const t = useTranslations("adminSettings");
  return (
    <div className="admin-settings__rate-limit">
      <div className="admin-settings__header">
        <h1>
          <Shield size={28} />
          {t("rateLimitConfigTitle")}
        </h1>
        <p>{t("rateLimitConfigSubtitle")}</p>
      </div>
      <AdminRateLimitSettings />
    </div>
  );
}
