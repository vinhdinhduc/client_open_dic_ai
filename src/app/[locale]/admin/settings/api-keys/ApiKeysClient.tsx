import { AdminAISettings } from "@/components/admin";
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SettingsAPIKeysPage() {
  const t = useTranslations("adminSettings");

  return (
    <div className="admin-settings_api_key">
      <div className="admin-settings__header">
        <h1>
          <KeyRound size={28} />
          {t("apiKeysConfigTitle")}
        </h1>
        <p>{t("apiKeysConfigSubtitle")}</p>
      </div>
      <AdminAISettings />
    </div>
  );
}
