"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
  RefreshCw,
  Info,
  ChevronRight,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

// Types
interface ImportFile {
  id: string;
  file: File;
  name: string;
  size: string;
  status: "pending" | "processing" | "success" | "error";
  progress: number;
  result?: {
    total: number;
    success: number;
    failed: number;
    errors?: Array<{ row: number; error: string }>;
  };
}

interface CategoryOption {
  _id: string;
  name: { vi: string; en?: string; lo?: string };
  slug: string;
}

export default function ImportPage() {
  const t = useTranslations("adminImport");
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data.data?.categories || res.data.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (file) =>
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv"),
    );

    const importFiles: ImportFile[] = validFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...importFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const importFile = async (fileItem: ImportFile) => {
    // Update status to processing
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileItem.id
          ? { ...f, status: "processing" as const, progress: 30 }
          : f,
      ),
    );

    try {
      const formData = new FormData();
      formData.append("file", fileItem.file);
      if (selectedCategory) {
        formData.append("category", selectedCategory);
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, progress: 60 } : f)),
      );

      const response = await axiosInstance.post("/terms/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data.data;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status:
                  result.failed === 0
                    ? ("success" as const)
                    : ("error" as const),
                progress: 100,
                result: {
                  total: result.total || result.success + result.failed,
                  success: result.success,
                  failed: result.failed,
                  errors: result.errors,
                },
              }
            : f,
        ),
      );

      if (result.success > 0) {
        toast.success(t("importSuccess", { count: result.success }));
      }
      if (result.failed > 0) {
        toast.error(t("importPartialError", { count: result.failed }));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t("importError");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "error" as const,
                progress: 100,
                result: {
                  total: 0,
                  success: 0,
                  failed: 1,
                  errors: [{ row: 0, error: message }],
                },
              }
            : f,
        ),
      );
      toast.error(message);
    }
  };

  const handleImport = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    for (const file of pendingFiles) {
      await importFile(file);
    }
  };

  const clearCompleted = () => {
    setFiles((prev) =>
      prev.filter((f) => f.status === "pending" || f.status === "processing"),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <FileText size={20} className="status-icon status-icon--pending" />
        );
      case "processing":
        return (
          <RefreshCw
            size={20}
            className="status-icon status-icon--processing"
          />
        );
      case "success":
        return (
          <CheckCircle size={20} className="status-icon status-icon--success" />
        );
      case "error":
        return <XCircle size={20} className="status-icon status-icon--error" />;
      default:
        return null;
    }
  };

  return (
    <div className="import-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">{t("title")}</h1>
          <p className="admin-page-header__subtitle">
            {t("subtitle")}
          </p>
        </div>
        <div className="admin-page-header__actions">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={async () => {
              try {
                const response = await axiosInstance.get(
                  "/terms/import-template",
                  {
                    responseType: "blob",
                  },
                );
                const url = window.URL.createObjectURL(
                  new Blob([response.data]),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "import_template.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success(t("downloadSuccess"));
              } catch {
                toast.error(t("downloadError"));
              }
            }}
          >
            <Download size={16} />
            {t("downloadTemplate")}
          </button>
        </div>
      </div>

      {/* Guide Section */}
      {showGuide && (
        <div className="import-guide">
          <div className="import-guide__header">
            <div className="import-guide__title">
              <HelpCircle size={20} />
              <span>{t("instructions")}</span>
            </div>
            <button
              className="import-guide__close"
              onClick={() => setShowGuide(false)}
            >
              ×
            </button>
          </div>
          <div className="import-guide__content">
            <div className="guide-step">
              <span className="guide-step__number">1</span>
              <div className="guide-step__content">
                <h4>{t("step1Title")}</h4>
                <p>{t("step1Desc")}</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="guide-step__number">2</span>
              <div className="guide-step__content">
                <h4>{t("step2Title")}</h4>
                <p>
                  {t("step2Desc")}
                </p>
              </div>
            </div>
            <div className="guide-step">
              <span className="guide-step__number">3</span>
              <div className="guide-step__content">
                <h4>{t("step3Title")}</h4>
                <p>
                  {t("step3Desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="import-layout">
        {/* Main Upload Area */}
        <div className="import-main">
          {/* Drop Zone */}
          <div
            className={`drop-zone ${isDragging ? "drop-zone--active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone__icon">
              <Upload size={48} />
            </div>
            <h3>{t("dropzone")}</h3>
            <p>{t("or")}</p>
            <label className="admin-btn admin-btn--primary">
              <FileSpreadsheet size={16} />
              {t("browseFiles")}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                multiple
                onChange={handleFileInput}
                style={{ display: "none" }}
              />
            </label>
            <span className="drop-zone__hint">
              {t("supportedFormats")}
            </span>
          </div>

          {/* Category Selection */}
          <div className="import-options">
            <div className="option-group">
              <label>{t("defaultCategory")}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name.vi}
                  </option>
                ))}
              </select>
              <span className="option-hint">
                {t("defaultCategoryHint")}
              </span>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list__header">
                <h3>{t("fileList", { count: files.length })}</h3>
                {files.some(
                  (f) => f.status === "success" || f.status === "error",
                ) && (
                  <button
                    className="admin-btn admin-btn--ghost"
                    onClick={clearCompleted}
                  >
                    {t("clearProcessed")}
                  </button>
                )}
              </div>
              <div className="file-list__items">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`file-item file-item--${file.status}`}
                  >
                    <div className="file-item__icon">
                      {getStatusIcon(file.status)}
                    </div>
                    <div className="file-item__info">
                      <span className="file-item__name">{file.name}</span>
                      <span className="file-item__size">{file.size}</span>
                    </div>
                    {file.status === "processing" && (
                      <div className="file-item__progress">
                        <div
                          className="file-item__progress-bar"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                        <span>{file.progress}%</span>
                      </div>
                    )}
                    {file.result && (
                      <div className="file-item__result">
                        <span className="result-success">
                          ✓ {file.result.success}
                        </span>
                        {file.result.failed > 0 && (
                          <span className="result-failed">
                            ✗ {file.result.failed}
                          </span>
                        )}
                      </div>
                    )}
                    {file.status === "pending" && (
                      <button
                        className="file-item__remove"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Error Details */}
              {files.some(
                (f) => f.result?.errors && f.result.errors.length > 0,
              ) && (
                <div className="error-details">
                  <h4>
                    <AlertCircle size={16} />
                    {t("errorDetails")}
                  </h4>
                  {files
                    .filter((f) => f.result?.errors)
                    .map((file) => (
                      <div key={file.id} className="error-file">
                        <span className="error-file__name">{file.name}</span>
                        <ul>
                          {file.result?.errors?.map((error, idx) => (
                            <li key={idx}>
                              {typeof error === "string"
                                ? error
                                : t("rowError", { row: error.row, error: error.error })}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              )}

              {/* Import Button */}
              <div className="file-list__actions">
                <button
                  className="admin-btn admin-btn--primary admin-btn--lg"
                  onClick={handleImport}
                  disabled={!files.some((f) => f.status === "pending")}
                >
                  <Upload size={18} />
                  {t("importButton")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="import-sidebar">
          <div className="sidebar-card">
            <h3>
              <Info size={18} />
              {t("fileFormat")}
            </h3>
            <div className="format-info">
              <h4>{t("requiredColumns")}</h4>
              <ul>
                <li>
                  <code>term_xx</code> - {t("requiredCol1")} (vi, en,
                  lo)
                </li>
                <li>
                  <code>definition_xx</code> - {t("requiredCol2")}
                  (vi, en, lo)
                </li>
                <li>
                  <code>category</code> - {t("requiredCol3")}
                </li>
              </ul>
              <h4>{t("optionalColumns")}</h4>
              <ul>
                <li>
                  <code>term_xx</code> - {t("optionalColTermOther")}
                </li>

                <li>
                  <code>definition_xx</code> - {t("optionalColDefOther")}
                </li>

                <li>
                  <code>example</code> - {t("optionalCol1")}
                </li>
                <li>
                  <code>Tags</code>
                </li>
                <li>
                  <code>Related Terms</code>
                </li>
                <li>
                  <code>{t("optionalCol2")}</code>
                </li>
              </ul>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>
              <BookOpen size={18} />
              {t("importStats")}
            </h3>
            <div className="import-stats">
              <div className="import-stat">
                <span className="import-stat__value">
                  {files.reduce((sum, f) => sum + (f.result?.success || 0), 0)}
                </span>
                <span className="import-stat__label">{t("success")}</span>
              </div>
              <div className="import-stat import-stat--danger">
                <span className="import-stat__value">
                  {files.reduce((sum, f) => sum + (f.result?.failed || 0), 0)}
                </span>
                <span className="import-stat__label">{t("failed")}</span>
              </div>
              <div className="import-stat import-stat--pending">
                <span className="import-stat__value">
                  {files.filter((f) => f.status === "pending").length}
                </span>
                <span className="import-stat__label">{t("pendingStatus")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .import-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
        }

        .import-guide {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(37, 99, 235, 0.1) 100%
          );
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .import-guide__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(59, 130, 246, 0.1);
        }

        .import-guide__title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #3b82f6;
        }

        .import-guide__close {
          background: none;
          border: none;
          font-size: 24px;
          color: #3b82f6;
          cursor: pointer;
          line-height: 1;
        }

        .import-guide__content {
          display: flex;
          gap: 24px;
          padding: 20px;
        }

        .guide-step {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .guide-step__number {
          width: 28px;
          height: 28px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }

        .guide-step__content h4 {
          margin: 0 0 4px;
          font-size: 15px;
          color: var(--text-primary);
        }

        .guide-step__content p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .drop-zone {
          background: var(--bg-card);
          border: 2px dashed var(--border-color);
          border-radius: 16px;
          padding: 48px;
          text-align: center;
          transition: all 0.3s;
        }

        .drop-zone--active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .drop-zone__icon {
          color: #667eea;
          margin-bottom: 16px;
        }

        .drop-zone h3 {
          margin: 0 0 8px;
          font-size: 20px;
          color: var(--text-primary);
        }

        .drop-zone p {
          margin: 0 0 16px;
          color: var(--text-secondary);
        }

        .drop-zone__hint {
          display: block;
          margin-top: 16px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .import-options {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
        }

        .option-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option-group label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .option-group select {
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 14px;
        }

        .option-group select option {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .option-hint {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .file-list {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
        }

        .file-list__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .file-list__header h3 {
          margin: 0;
          font-size: 16px;
        }

        .file-list__items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .file-item__icon {
          flex-shrink: 0;
        }

        .status-icon--pending {
          color: #6b7280;
        }

        .status-icon--processing {
          color: #3b82f6;
          animation: spin 1s linear infinite;
        }

        .status-icon--success {
          color: #10b981;
        }

        .status-icon--error {
          color: #ef4444;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .file-item__info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .file-item__name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .file-item__size {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .file-item__progress {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 120px;
        }

        .file-item__progress-bar {
          flex: 1;
          height: 4px;
          background: #3b82f6;
          border-radius: 2px;
        }

        .file-item__progress span {
          font-size: 12px;
          color: #3b82f6;
          font-weight: 500;
        }

        .file-item__result {
          display: flex;
          gap: 12px;
        }

        .result-success {
          color: #10b981;
          font-weight: 500;
        }

        .result-failed {
          color: #ef4444;
          font-weight: 500;
        }

        .file-item__remove {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
        }

        .file-item__remove:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .error-details {
          margin-top: 16px;
          padding: 16px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          border-radius: 8px;
        }

        .error-details h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          color: #ef4444;
          font-size: 14px;
        }

        .error-file {
          margin-bottom: 12px;
        }

        .error-file__name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .error-file ul {
          margin: 8px 0 0;
          padding-left: 20px;
        }

        .error-file li {
          font-size: 13px;
          color: #ef4444;
          margin-bottom: 4px;
        }

        .file-list__actions {
          margin-top: 20px;
          text-align: center;
        }

        .admin-btn--lg {
          padding: 14px 28px;
          font-size: 16px;
        }

        .sidebar-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .sidebar-card h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 16px;
          font-size: 16px;
          color: var(--text-primary);
        }

        .format-info h4 {
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .format-info ul {
          margin: 0 0 16px;
          padding-left: 16px;
        }

        .format-info li {
          font-size: 13px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .format-info code {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .import-stats {
          display: flex;
          gap: 12px;
        }

        .import-stat {
          flex: 1;
          text-align: center;
          padding: 12px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
        }

        .import-stat--danger {
          background: rgba(239, 68, 68, 0.1);
        }

        .import-stat--pending {
          background: rgba(107, 114, 128, 0.1);
        }

        .import-stat__value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .import-stat__label {
          font-size: 11px;
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .import-layout {
            grid-template-columns: 1fr;
          }

          .import-sidebar {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .import-guide__content {
            flex-direction: column;
          }

          .drop-zone {
            padding: 32px 20px;
          }
        }
      `}</style>
    </div>
  );
}
