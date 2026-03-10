import { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Mail, Gauge, ChevronRight } from "lucide-react";
import "./settings.scss";

export const metadata: Metadata = {
  title: "Cài đặt hệ thống - Admin | OpenDict",
  description: "Quản lý cài đặt hệ thống OpenDict",
};

const settingsItems = [
  {
    href: "/admin/settings/api-keys",
    icon: KeyRound,
    title: "Quản lý API Keys",
    description: "Cấu hình các khóa API cho tích hợp AI và dịch vụ bên ngoài",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.08)",
  },
  {
    href: "/admin/settings/email",
    icon: Mail,
    title: "Cài đặt Email",
    description: "Cấu hình email thông báo và địa chỉ gửi mail hệ thống",
    color: "#0891b2",
    bg: "rgba(8, 145, 178, 0.08)",
  },
  {
    href: "/admin/settings/rate-limit",
    icon: Gauge,
    title: "Giới hạn tốc độ",
    description: "Kiểm soát giới hạn request API để bảo vệ hệ thống",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.08)",
  },
];

export default function SettingsIndexPage() {
  return (
    <div className="admin-settings-index">
      <div className="admin-settings-index__header">
        <h1>Cài đặt hệ thống</h1>
        <p>Quản lý các cấu hình và tùy chọn hệ thống</p>
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
