"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, RotateCcw, Download } from "lucide-react";
import auditLogService from "@/services/auditLogService";
import "./filterSection.scss";

interface Filters {
  date: string;
  action: string;
  actorEmail: string;
}

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onSearch: (filters: Partial<Filters>) => void;
  onReset: () => void;
  isLoading: boolean;
}

const AUDIT_ACTIONS = [
  "TERM_CREATE",
  "TERM_UPDATE",
  "TERM_DELETE",
  "TERM_APPROVE",
  "TERM_REJECT",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_DELETE",
  "USER_BAN",
  "USER_LOCK",
  "USER_UNBAN",
  "ROLE_CHANGE",
  "REPORT_RESOLVED",
  "REPORT_REJECTED",
  "REPORT_CREATE",
  "CONTRIBUTION_APPROVE",
  "CONTRIBUTION_REJECT",
  "CONTRIBUTION_DELETE",
  "COMMENT_DELETE",
  "COMMENT_APPROVE",
  "COMMENT_REJECT",
  "LOGIN_FAILED",
  "LOGIN_SUCCESS",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "EMAIL_VERIFY",
];

export default function FilterSection({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  isLoading,
}: FilterSectionProps) {
  const t = useTranslations("auditLogs.filter");
  const ta = useTranslations("auditLogs.actions");
  const [isExporting, setIsExporting] = React.useState(false);

  const getActionLabel = (action: string) => {
    try {
      return ta(action);
    } catch (error) {
      return action;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await auditLogService.exportAuditLogs({
        date: filters.date,
        action: filters.action,
        actorEmail: filters.actorEmail,
      });
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="filter-section">
      <div className="filter-controls">
        {/* Date Picker */}
        <div className="filter-group">
          <label htmlFor="date-filter">{t("date")}</label>
          <input
            id="date-filter"
            type="date"
            value={filters.date}
            onChange={(e) => onFilterChange({ date: e.target.value })}
            className="filter-input"
          />
        </div>

        {/* Action Dropdown */}
        <div className="filter-group">
          <label htmlFor="action-filter">{t("action")}</label>
          <select
            id="action-filter"
            value={filters.action}
            onChange={(e) => onFilterChange({ action: e.target.value })}
            className="filter-input"
          >
            <option value="">{t("allActions")}</option>
            {AUDIT_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </div>

        {/* Actor Email */}
        <div className="filter-group">
          <label htmlFor="email-filter">{t("actorEmail")}</label>
          <input
            id="email-filter"
            type="email"
            placeholder={t("enterEmail")}
            value={filters.actorEmail}
            onChange={(e) => onFilterChange({ actorEmail: e.target.value })}
            className="filter-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="filter-buttons">
          <button
            onClick={() => onSearch(filters)}
            disabled={isLoading}
            className="btn btn-search"
          >
            <Search size={18} />
            {t("search")}
          </button>

          <button
            onClick={onReset}
            disabled={isLoading}
            className="btn btn-reset"
          >
            <RotateCcw size={18} />
            {t("reset")}
          </button>

          <button
            onClick={handleExport}
            disabled={isLoading || isExporting}
            className="btn btn-export"
          >
            <Download size={18} />
            {isExporting ? t("exporting") : t("export")}
          </button>
        </div>
      </div>
    </div>
  );
}
