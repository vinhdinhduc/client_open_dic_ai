"use client";

import { useState } from "react";
import { Bot, Mail, Shield, Settings } from "lucide-react";
import AdminAISettings from "./AdminAISettings";
import AdminEmailSettings from "./AdminEmailSettings";
import AdminRateLimitSettings from "./AdminRateLimitSettings";
import "./AdminSystemSettings.scss";

type TabType = "ai" | "email" | "ratelimit";

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: Tab[] = [
  {
    id: "ai",
    label: "Cấu hình AI",
    icon: Bot,
    description: "Quản lý tích hợp AI và API keys",
  },
  {
    id: "email",
    label: "Cấu hình Email",
    icon: Mail,
    description: "Thiết lập SMTP và email notifications",
  },
  {
    id: "ratelimit",
    label: "Rate Limiting",
    icon: Shield,
    description: "Bảo vệ hệ thống khỏi spam và abuse",
  },
];

export default function AdminSystemSettings() {
  const [activeTab, setActiveTab] = useState<TabType>("ai");

  const renderTabContent = () => {
    switch (activeTab) {
      case "ai":
        return <AdminAISettings />;
      case "email":
        return <AdminEmailSettings />;
      case "ratelimit":
        return <AdminRateLimitSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-system-settings">
      <div className="admin-system-settings__header">
        <div className="admin-system-settings__header-content">
          <Settings size={40} />
          <div>
            <h1>Cấu hình Hệ thống</h1>
            <p>Quản lý các thiết lập và cấu hình của hệ thống</p>
          </div>
        </div>
      </div>

      <div className="admin-system-settings__container">
        {/* Tabs Navigation */}
        <div className="admin-system-settings__tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`admin-system-settings__tab ${
                  activeTab === tab.id
                    ? "admin-system-settings__tab--active"
                    : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="admin-system-settings__tab-icon">
                  <Icon size={24} />
                </div>
                <div className="admin-system-settings__tab-content">
                  <h3>{tab.label}</h3>
                  <p>{tab.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="admin-system-settings__content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
