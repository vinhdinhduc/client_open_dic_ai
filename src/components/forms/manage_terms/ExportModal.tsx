"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Loader2,
  FileSpreadsheet,
  Globe,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { exportTermsToExcel, ExportTermsOptions } from "@/services/termService";
import "./ExportModal.scss";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: {
    category?: string;
    status?: string;
    search?: string;
  };
  categoryName?: string;
}

type LanguageOption = "all" | "vi" | "en" | "lo";

const LANGUAGE_OPTIONS: {
  value: LanguageOption;
  label: string;
  flag: React.ReactNode;
}[] = [
  { value: "all", label: "Tất cả ngôn ngữ", flag: <Globe size={16} /> },
  { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "lo", label: "ພາສາລາວ", flag: "🇱🇦" },
];

const STATUS_LABELS: Record<string, string> = {
  all: "Tất cả",
  approved: "Đã duyệt",
  pending: "Chờ duyệt",
  rejected: "Từ chối",
};

export function ExportModal({
  isOpen,
  onClose,
  currentFilters = {},
  categoryName,
}: ExportModalProps) {
  const [exportType, setExportType] = useState<"current" | "all">("current");
  const [language, setLanguage] = useState<LanguageOption>("all");
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const options: ExportTermsOptions = {
        language,
      };

      // If export with current filters
      if (exportType === "current") {
        if (currentFilters.category) {
          options.category = currentFilters.category;
        }
        if (currentFilters.status) {
          options.status = currentFilters.status;
        }
        if (currentFilters.search) {
          options.search = currentFilters.search;
        }
      }

      await exportTermsToExcel(options);
      toast.success("Xuất file Excel thành công!");
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất file Excel");
    } finally {
      setExporting(false);
    }
  };

  const hasFilters =
    currentFilters.category !== "all" ||
    currentFilters.status !== "all" ||
    currentFilters.search;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-modal__header">
          <div className="header-icon">
            <FileSpreadsheet size={24} />
          </div>
          <div className="header-text">
            <h2>Xuất dữ liệu Excel</h2>
            <p>Chọn các tùy chọn để xuất danh sách thuật ngữ</p>
          </div>
          <button className="close-btn" onClick={onClose} disabled={exporting}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="export-modal__body">
          {/* Export Type */}
          <div className="option-group">
            <label className="option-label">
              <Filter size={16} />
              Phạm vi xuất
            </label>
            <div className="option-cards">
              <button
                className={`option-card ${exportType === "current" ? "active" : ""}`}
                onClick={() => setExportType("current")}
                disabled={exporting}
              >
                <div className="option-card__icon">
                  <Filter size={20} />
                </div>
                <div className="option-card__content">
                  <span className="option-card__title">
                    Theo bộ lọc hiện tại
                  </span>
                  <span className="option-card__desc">
                    {hasFilters ? (
                      <>
                        {currentFilters.category !== "all" && (
                          <span className="filter-tag">
                            Danh mục: {categoryName || currentFilters.category}
                          </span>
                        )}
                        {currentFilters.status !== "all" && (
                          <span className="filter-tag">
                            Trạng thái:{" "}
                            {STATUS_LABELS[currentFilters.status || "all"]}
                          </span>
                        )}
                        {currentFilters.search && (
                          <span className="filter-tag">
                            Tìm kiếm: "{currentFilters.search}"
                          </span>
                        )}
                      </>
                    ) : (
                      "Không có bộ lọc (tất cả thuật ngữ)"
                    )}
                  </span>
                </div>
              </button>

              <button
                className={`option-card ${exportType === "all" ? "active" : ""}`}
                onClick={() => setExportType("all")}
                disabled={exporting}
              >
                <div className="option-card__icon">
                  <Download size={20} />
                </div>
                <div className="option-card__content">
                  <span className="option-card__title">Tất cả thuật ngữ</span>
                  <span className="option-card__desc">
                    Xuất toàn bộ thuật ngữ trong hệ thống
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="option-group">
            <label className="option-label">
              <Globe size={16} />
              Ngôn ngữ xuất
            </label>
            <div className="language-options">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`language-btn ${language === opt.value ? "active" : ""}`}
                  onClick={() => setLanguage(opt.value)}
                  disabled={exporting}
                >
                  <span className="language-btn__flag">{opt.flag}</span>
                  <span className="language-btn__label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="export-info">
            <h4>File Excel sẽ bao gồm:</h4>
            <ul>
              <li>Thuật ngữ (các ngôn ngữ đã chọn)</li>
              <li>Định nghĩa và giải thích chi tiết</li>
              <li>Danh mục, từ loại, tags</li>
              <li>Thống kê (lượt xem, yêu thích)</li>
              <li>Thông tin người tạo và ngày tháng</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="export-modal__footer">
          <button
            className="btn btn--cancel"
            onClick={onClose}
            disabled={exporting}
          >
            Hủy
          </button>
          <button
            className="btn btn--export"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 size={18} className="spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download size={18} />
                Xuất Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
