"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import FilterSection from "./FilterSection";
import AuditLogsTable from "./AuditLogsTable";
import auditLogService from "@/services/auditLogService";
import "./auditLogs.scss";

interface AuditLog {
  _id: string;
  action: string;
  actor: {
    _id: string;
    email: string;
    fullName?: string;
    role?: string;
  };
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  reason?: string;
  status: "success" | "failed";
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface FilterState {
  date: string;
  action: string;
  actorEmail: string;
}

const getLocalDateInputValue = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().split("T")[0];
};

export default function AuditLogsClient() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const t = useTranslations("auditLogs");
  const hasFetchedOnLoad = React.useRef(false);
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<FilterState>({
    date: getLocalDateInputValue(),
    action: "",
    actorEmail: "",
  });

  // Check authorization
  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback(
    async (newFilters: Partial<FilterState>, page = 1) => {
      setIsSearching(true);
      try {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        const params = {
          date: updatedFilters.date,
          action: updatedFilters.action,
          actorEmail: updatedFilters.actorEmail,
          page,
          limit: 50,
        };

        const data = await auditLogService.getAuditLogs(params as any);

        setLogs(data.data?.data || []);
        setPagination({
          total: data.data?.total || 0,
          page: data.data?.page || 1,
          limit: data.data?.limit || 50,
          totalPages: data.data?.totalPages || 1,
        });
      } catch (error) {
        console.error("Error searching audit logs:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [filters],
  );

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") return;
    if (hasFetchedOnLoad.current) return;

    hasFetchedOnLoad.current = true;
    handleSearch({}, 1);
  }, [isLoading, isAuthenticated, user, handleSearch]);

  const handleReset = useCallback(() => {
    setFilters({
      date: getLocalDateInputValue(),
      action: "",
      actorEmail: "",
    });
    setLogs([]);
    setPagination({
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      handleSearch({}, newPage);
    },
    [handleSearch],
  );

  if (isLoading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>

      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        isLoading={isSearching}
      />

      <AuditLogsTable
        logs={logs}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isSearching}
        filters={filters}
      />
    </div>
  );
}
