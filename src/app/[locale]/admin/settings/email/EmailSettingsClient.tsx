"use client";

import { AdminEmailSettings } from "@/components/admin";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SettingsEmailPage() {
  const t = useTranslations("adminSettings");
  return (
    <div className="admin-settings__email">
      <div className="admin-settings__header">
        <h1>
          {" "}
          <Mail size={28} />
          {t("emailConfigTitle")}
        </h1>
      </div>
      <AdminEmailSettings />
    </div>
  );
}
