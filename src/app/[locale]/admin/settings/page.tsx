import { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Mail, Gauge, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import "./settings.scss";

export const metadata: Metadata = {
  title: "Settings - Admin | UTB OpenDict",
  description: "Manage UTB OpenDict system settings",
};

export default async function SettingsIndexPage() {
  const t = await getTranslations("adminSettings");

  const settingsItems = [
    {
      href: "/admin/settings/api-keys",
      icon: KeyRound,
      title: t("apiKeys"),
      description: t("apiKeysDesc"),
      color: "#6366f1",
      bg: "rgba(99, 102, 241, 0.08)",
    },
    {
      href: "/admin/settings/email",
      icon: Mail,
      title: t("emailSettings"),
      description: t("emailSettingsDesc"),
      color: "#0891b2",
      bg: "rgba(8, 145, 178, 0.08)",
    },
    {
      href: "/admin/settings/rate-limit",
      icon: Gauge,
      title: t("rateLimit"),
      description: t("rateLimitDesc"),
      color: "#059669",
      bg: "rgba(5, 150, 105, 0.08)",
    },
  ];

  return (
    <div className="admin-settings-index">
      <div className="admin-settings-index__header">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </div>

      <div className="admin-settings-index__grid">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="admin-settings-index__card"
            >
              <div
                className="admin-settings-index__card-icon"
                style={{ background: item.bg, color: item.color }}
              >
                <Icon size={24} />
              </div>
              <div className="admin-settings-index__card-body">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              <ChevronRight
                size={20}
                className="admin-settings-index__card-arrow"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
