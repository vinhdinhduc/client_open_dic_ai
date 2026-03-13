"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Loader2, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Report,
  emptyReportTrash,
  getReports,
  restoreReport,
} from "@/services/reportService";

export default function ReportsTrashClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [reasonFilter, setReasonFilter] = useState("all");

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getReports({
        page: 1,
        limit: 100,
        includeDeleted: true,
        onlyDeleted: true,
      });
      if (res.success) {
        setReports(res.data.reports || []);
      }
    } catch {
      toast.error("Khong the tai thung rac bao xau");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (reasonFilter === "all") return reports;
    return reports.filter((r) => r.reason === reasonFilter);
  }, [reports, reasonFilter]);

  const handleRestore = async (id: string) => {
    try {
      setRestoringId(id);
      const res = await restoreReport(id);
      if (res.success) {
        toast.success("Da khoi phuc bao xau");
        await loadReports();
      } else {
        toast.error(res.message || "Khong the khoi phuc bao xau");
      }
    } catch {
      toast.error("Khong the khoi phuc bao xau");
    } finally {
      setRestoringId(null);
    }
  };

  const handleEmpty = async () => {
    if (
      !confirm(
        "Ban co chac muon xoa vinh vien toan bo bao xau trong thung rac?",
      )
    ) {
      return;
    }
    try {
      const res = await emptyReportTrash();
      if (res.success) {
        toast.success(`Da xoa vinh vien ${res.data.deletedCount} bao xau`);
        await loadReports();
      } else {
        toast.error(res.message || "Khong the lam rong thung rac");
      }
    } catch {
      toast.error("Khong the lam rong thung rac");
    }
  };

  return (
    <div className="moderation-page">
      <div className="moderation-page__header">
        <div className="header-content">
          <div className="header-icon">
            <Trash2 size={24} />
          </div>
          <div className="header-text">
            <h1>Thung rac bao xau</h1>
            <p>Quan ly bao xau da xoa mem va khoi phuc khi can</p>
          </div>
        </div>
        <div className="header-actions">
          <Link
            href="/admin/moderation/reports"
            className="btn btn--secondary btn--icon"
          >
            <RotateCcw size={16} />
          </Link>
          <button className="btn btn--danger btn--icon" onClick={handleEmpty}>
            <Trash2 size={16} />
          </button>
          <button
            className="btn btn--secondary btn--icon"
            onClick={loadReports}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spinning" : ""} />
          </button>
        </div>
      </div>

      <div className="moderation-page__filters">
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="all">Tat ca ly do</option>
            <option value="duplicate">Trung lap</option>
            <option value="incorrect">Khong chinh xac</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Khong phu hop</option>
            <option value="other">Khac</option>
          </select>
        </div>
      </div>

      <div className="moderation-page__table">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={48} className="spinning" />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Thuat ngu</th>
                <th>Ly do</th>
                <th>Nguoi bao cao</th>
                <th>Trang thai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Khong co du lieu
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td>
                      {report.targetTerm?.term?.vi ||
                        report.targetTerm?.term?.en ||
                        "-"}
                    </td>
                    <td>{report.reason}</td>
                    <td>{report.reporter?.fullName || "-"}</td>
                    <td>{report.status}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn action-btn--approve"
                        onClick={() => handleRestore(report._id)}
                        disabled={restoringId === report._id}
                        title="Khoi phuc"
                      >
                        {restoringId === report._id ? (
                          <Loader2 size={14} className="spinning" />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
