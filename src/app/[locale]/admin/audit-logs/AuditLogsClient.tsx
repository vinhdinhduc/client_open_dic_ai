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
  const filtersRef = React.useRef<FilterState>({
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
    setFilters((prev) => {
      const next = { ...prev, ...newFilters };
      filtersRef.current = next;
      return next;
    });
  }, []);

  const fetchAuditLogs = useCallback(
    async (activeFilters: FilterState, page = 1) => {
      setIsSearching(true);
      try {
        const params = {
          date: activeFilters.date,
          action: activeFilters.action,
          actorEmail: activeFilters.actorEmail,
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
    [],
  );

  const handleSearch = useCallback(
    async (newFilters: Partial<FilterState>, page = 1) => {
      const updatedFilters = { ...filtersRef.current, ...newFilters };
      filtersRef.current = updatedFilters;
      setFilters(updatedFilters);
      await fetchAuditLogs(updatedFilters, page);
    },
    [fetchAuditLogs],
  );

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") return;

    const timeoutId = window.setTimeout(() => {
      fetchAuditLogs(filtersRef.current, 1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [isLoading, isAuthenticated, user, filters, fetchAuditLogs]);

  const handleReset = useCallback(() => {
    const defaultFilters = {
      date: getLocalDateInputValue(),
      action: "",
      actorEmail: "",
    };

    filtersRef.current = defaultFilters;
    setFilters(defaultFilters);
    handleSearch(defaultFilters, 1);
  }, [handleSearch]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchAuditLogs(filtersRef.current, newPage);
    },
    [fetchAuditLogs],
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
