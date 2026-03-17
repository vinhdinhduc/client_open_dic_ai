"use client";

import React, { useState, useCallback, useEffect } from "react";
import "./ImportClient.scss";
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
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import categoryService, { Category } from "@/services/categoryService";
import { useLocale, useTranslations } from "next-intl";
import {
  importTermsFromFile,
  downloadImportTemplate,
} from "@/services/termService";

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

export default function ImportPage() {
  const t = useTranslations("adminImport");
  const locale = useLocale();
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data || []);
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
      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, progress: 60 } : f)),
      );

      const result = await importTermsFromFile(
        fileItem.file,
        selectedCategory || undefined,
      );

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
          <p className="admin-page-header__subtitle">{t("subtitle")}</p>
        </div>
        <div className="admin-page-header__actions">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={async () => {
              try {
                await downloadImportTemplate();
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
                <p>{t("step2Desc")}</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="guide-step__number">3</span>
              <div className="guide-step__content">
                <h4>{t("step3Title")}</h4>
                <p>{t("step3Desc")}</p>
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
            <span className="drop-zone__hint">{t("supportedFormats")}</span>
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
                    {typeof cat.name === "string"
                      ? cat.name
                      : (cat.name as any)[locale] ||
                        (cat.name as any).vi ||
                        (cat.name as any).en ||
                        (cat.name as any).lo ||
                        ""}
                  </option>
                ))}
              </select>
              <span className="option-hint">{t("defaultCategoryHint")}</span>
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
                                : t("rowError", {
                                    row: error.row,
                                    error: error.error,
                                  })}
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
                  <code>term_xx</code> - {t("requiredCol1")} (vi, en, lo)
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
    </div>
  );
}
