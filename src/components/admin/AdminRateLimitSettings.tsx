"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import {
  Shield,
  Save,
  RefreshCw,
  AlertCircle,
  Clock,
  Activity,
  Lock,
  Bot,
} from "lucide-react";
import systemConfigService from "@/services/systemConfigService";
import "./AdminRateLimitSettings.scss";

type SupportedLocale = "vi" | "en" | "lo";

type RateLimitText = {
  loadConfigError: string;
  minWindowError: string;
  minRequestError: string;
  saveUpdated: string;
  saveCreated: string;
  saveConfigError: string;
  loadingConfig: string;
  statusTitle: string;
  enableRateLimiting: string;
  enableRateLimitingDesc: string;
  generalTitle: string;
  generalWindow: string;
  generalWindowDesc: string;
  generalMaxRequests: string;
  generalMaxRequestsDesc: string;
  generalPreviewAllow: string;
  generalPreviewRequests: string;
  apiTitle: string;
  apiWindow: string;
  apiWindowDesc: string;
  apiMaxRequests: string;
  apiMaxRequestsDesc: string;
  apiPreviewAllow: string;
  apiPreviewCalls: string;
  loginTitle: string;
  loginWindow: string;
  loginWindowDesc: string;
  loginMaxAttempts: string;
  loginMaxAttemptsDesc: string;
  loginPreviewAllow: string;
  loginPreviewAttempts: string;
  aiTitle: string;
  aiWindow: string;
  aiWindowDesc: string;
  aiMaxRequests: string;
  aiMaxRequestsDesc: string;
  aiPreviewAllow: string;
  aiPreviewCalls: string;
  reload: string;
  saving: string;
  save: string;
  infoTitle: string;
  infoGeneralLabel: string;
  infoGeneral: string;
  infoApiLabel: string;
  infoApi: string;
  infoLoginLabel: string;
  infoLogin: string;
  infoAiLabel: string;
  infoAi: string;
  info429: string;
  infoWarning: string;
};

export default function AdminRateLimitSettings() {
  const locale = useLocale();
  const tr = useTranslations("adminRateLimitSettings");
  const safeLocale: SupportedLocale =
    locale === "en" || locale === "lo" ? locale : "vi";
  const t: RateLimitText = {
    loadConfigError: tr("loadConfigError"),
    minWindowError: tr("minWindowError"),
    minRequestError: tr("minRequestError"),
    saveUpdated: tr("saveUpdated"),
    saveCreated: tr("saveCreated"),
    saveConfigError: tr("saveConfigError"),
    loadingConfig: tr("loadingConfig"),
    statusTitle: tr("statusTitle"),
    enableRateLimiting: tr("enableRateLimiting"),
    enableRateLimitingDesc: tr("enableRateLimitingDesc"),
    generalTitle: tr("generalTitle"),
    generalWindow: tr("generalWindow"),
    generalWindowDesc: tr("generalWindowDesc"),
    generalMaxRequests: tr("generalMaxRequests"),
    generalMaxRequestsDesc: tr("generalMaxRequestsDesc"),
    generalPreviewAllow: tr("generalPreviewAllow"),
    generalPreviewRequests: tr("generalPreviewRequests"),
    apiTitle: tr("apiTitle"),
    apiWindow: tr("apiWindow"),
    apiWindowDesc: tr("apiWindowDesc"),
    apiMaxRequests: tr("apiMaxRequests"),
    apiMaxRequestsDesc: tr("apiMaxRequestsDesc"),
    apiPreviewAllow: tr("apiPreviewAllow"),
    apiPreviewCalls: tr("apiPreviewCalls"),
    loginTitle: tr("loginTitle"),
    loginWindow: tr("loginWindow"),
    loginWindowDesc: tr("loginWindowDesc"),
    loginMaxAttempts: tr("loginMaxAttempts"),
    loginMaxAttemptsDesc: tr("loginMaxAttemptsDesc"),
    loginPreviewAllow: tr("loginPreviewAllow"),
    loginPreviewAttempts: tr("loginPreviewAttempts"),
    aiTitle: tr("aiTitle"),
    aiWindow: tr("aiWindow"),
    aiWindowDesc: tr("aiWindowDesc"),
    aiMaxRequests: tr("aiMaxRequests"),
    aiMaxRequestsDesc: tr("aiMaxRequestsDesc"),
    aiPreviewAllow: tr("aiPreviewAllow"),
    aiPreviewCalls: tr("aiPreviewCalls"),
    reload: tr("reload"),
    saving: tr("saving"),
    save: tr("save"),
    infoTitle: tr("infoTitle"),
    infoGeneralLabel: tr("infoGeneralLabel"),
    infoGeneral: tr("infoGeneral"),
    infoApiLabel: tr("infoApiLabel"),
    infoApi: tr("infoApi"),
    infoLoginLabel: tr("infoLoginLabel"),
    infoLogin: tr("infoLogin"),
    infoAiLabel: tr("infoAiLabel"),
    infoAi: tr("infoAi"),
    info429: tr("info429"),
    infoWarning: tr("infoWarning"),
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    rate_limit_enabled: true,
    rate_limit_window_ms: 900000, // 15 minutes
    rate_limit_max_requests: 100,
    rate_limit_api_window_ms: 60000, // 1 minute
    rate_limit_api_max_requests: 30,
    rate_limit_login_window_ms: 900000, // 15 minutes
    rate_limit_login_max_attempts: 5,
    rate_limit_ai_window_ms: 60000, // 1 minute
    rate_limit_ai_max_requests: 5,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await systemConfigService.getRateLimitConfig();

      if (response.success && response.data) {
        setHasExistingConfig(response.data.length > 0);

        // Convert array to object
        const configObj: any = {};
        response.data.forEach((item: any) => {
          configObj[item.key] = item.value;
        });

        setFormData({
          rate_limit_enabled: configObj.rate_limit_enabled ?? true,
          rate_limit_window_ms: configObj.rate_limit_window_ms || 900000,
          rate_limit_max_requests: configObj.rate_limit_max_requests || 100,
          rate_limit_api_window_ms: configObj.rate_limit_api_window_ms || 60000,
          rate_limit_api_max_requests:
            configObj.rate_limit_api_max_requests || 30,
          rate_limit_login_window_ms:
            configObj.rate_limit_login_window_ms || 900000,
          rate_limit_login_max_attempts:
            configObj.rate_limit_login_max_attempts || 5,
          rate_limit_ai_window_ms: configObj.rate_limit_ai_window_ms || 60000,
          rate_limit_ai_max_requests: configObj.rate_limit_ai_max_requests || 5,
        });
      }
    } catch (error: any) {
      console.error("Load config error:", error);
      toast.error(error.message || t.loadConfigError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validation
      if (formData.rate_limit_window_ms < 1000) {
        toast.error(t.minWindowError);
        return;
      }

      if (formData.rate_limit_max_requests < 1) {
        toast.error(t.minRequestError);
        return;
      }

      await systemConfigService.updateRateLimitConfig(formData);

      toast.success(hasExistingConfig ? t.saveUpdated : t.saveCreated);
      await loadConfig();
    } catch (error: any) {
      console.error("Save config error:", error);
      toast.error(error.message || t.saveConfigError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseInt(value) || 0
            : value,
    }));
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (safeLocale === "en") {
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    }

    if (safeLocale === "lo") {
      if (hours > 0) {
        return `${hours} ຊົ່ວໂມງ ${minutes % 60} ນາທີ`;
      }
      if (minutes > 0) {
        return `${minutes} ນາທີ ${seconds % 60} ວິນາທີ`;
      }
      return `${seconds} ວິນາທີ`;
    }

    if (hours > 0) {
      return `${hours} giờ ${minutes % 60} phút`;
    } else if (minutes > 0) {
      return `${minutes} phút ${seconds % 60} giây`;
    } else {
      return `${seconds} giây`;
    }
  };

  if (isLoading) {
    return (
      <div className="admin-settings-section">
        <div className="admin-settings-section__loading">
          <RefreshCw className="spin" size={32} />
          <p>{t.loadingConfig}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-section">
      {/* Global Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Shield size={20} />
          {t.statusTitle}
        </h3>

        <div className="form-group">
          <label className="form-checkbox form-checkbox--switch">
            <input
              type="checkbox"
              name="rate_limit_enabled"
              checked={formData.rate_limit_enabled}
              onChange={handleInputChange}
            />
            <span className="switch-slider"></span>
            <span>{t.enableRateLimiting}</span>
          </label>
          <small className="form-text">{t.enableRateLimitingDesc}</small>
        </div>
      </div>

      {/* General Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Activity size={20} />
          {t.generalTitle}
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_window_ms">
            {t.generalWindow}
            <span className="label-badge">
              {formatTime(formData.rate_limit_window_ms)}
            </span>
          </label>
          <input
            type="number"
            id="rate_limit_window_ms"
            name="rate_limit_window_ms"
            value={formData.rate_limit_window_ms}
            onChange={handleInputChange}
            min="1000"
            step="1000"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.generalWindowDesc}</small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_max_requests">
            {t.generalMaxRequests}
          </label>
          <input
            type="number"
            id="rate_limit_max_requests"
            name="rate_limit_max_requests"
            value={formData.rate_limit_max_requests}
            onChange={handleInputChange}
            min="1"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.generalMaxRequestsDesc}</small>
        </div>

        <div className="rate-limit-preview">
          <Activity size={16} />
          <span>
            {t.generalPreviewAllow}{" "}
            <strong>{formData.rate_limit_max_requests}</strong>{" "}
            {t.generalPreviewRequests}{" "}
            <strong>{formatTime(formData.rate_limit_window_ms)}</strong>
          </span>
        </div>
      </div>

      {/* API Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Clock size={20} />
          {t.apiTitle}
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_api_window_ms">
            {t.apiWindow}
            <span className="label-badge">
              {formatTime(formData.rate_limit_api_window_ms)}
            </span>
          </label>
          <input
            type="number"
            id="rate_limit_api_window_ms"
            name="rate_limit_api_window_ms"
            value={formData.rate_limit_api_window_ms}
            onChange={handleInputChange}
            min="1000"
            step="1000"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.apiWindowDesc}</small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_api_max_requests">
            {t.apiMaxRequests}
          </label>
          <input
            type="number"
            id="rate_limit_api_max_requests"
            name="rate_limit_api_max_requests"
            value={formData.rate_limit_api_max_requests}
            onChange={handleInputChange}
            min="1"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.apiMaxRequestsDesc}</small>
        </div>

        <div className="rate-limit-preview">
          <Clock size={16} />
          <span>
            {t.apiPreviewAllow}{" "}
            <strong>{formData.rate_limit_api_max_requests}</strong>{" "}
            {t.apiPreviewCalls}{" "}
            <strong>{formatTime(formData.rate_limit_api_window_ms)}</strong>
          </span>
        </div>
      </div>

      {/* Login Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Lock size={20} />
          {t.loginTitle}
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_login_window_ms">
            {t.loginWindow}
            <span className="label-badge">
              {formatTime(formData.rate_limit_login_window_ms)}
            </span>
          </label>
          <input
            type="number"
            id="rate_limit_login_window_ms"
            name="rate_limit_login_window_ms"
            value={formData.rate_limit_login_window_ms}
            onChange={handleInputChange}
            min="1000"
            step="1000"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.loginWindowDesc}</small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_login_max_attempts">
            {t.loginMaxAttempts}
          </label>
          <input
            type="number"
            id="rate_limit_login_max_attempts"
            name="rate_limit_login_max_attempts"
            value={formData.rate_limit_login_max_attempts}
            onChange={handleInputChange}
            min="1"
            max="20"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.loginMaxAttemptsDesc}</small>
        </div>

        <div className="rate-limit-preview rate-limit-preview--warning">
          <Lock size={16} />
          <span>
            {t.loginPreviewAllow}{" "}
            <strong>{formData.rate_limit_login_max_attempts}</strong>{" "}
            {t.loginPreviewAttempts}{" "}
            <strong>{formatTime(formData.rate_limit_login_window_ms)}</strong>
          </span>
        </div>
      </div>

      {/* AI Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Bot size={20} />
          {t.aiTitle}
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_ai_window_ms">
            {t.aiWindow}
            <span className="label-badge">
              {formatTime(formData.rate_limit_ai_window_ms)}
            </span>
          </label>
          <input
            type="number"
            id="rate_limit_ai_window_ms"
            name="rate_limit_ai_window_ms"
            value={formData.rate_limit_ai_window_ms}
            onChange={handleInputChange}
            min="1000"
            step="1000"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.aiWindowDesc}</small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_ai_max_requests">{t.aiMaxRequests}</label>
          <input
            type="number"
            id="rate_limit_ai_max_requests"
            name="rate_limit_ai_max_requests"
            value={formData.rate_limit_ai_max_requests}
            onChange={handleInputChange}
            min="1"
            max="50"
            className="form-control"
            disabled={!formData.rate_limit_enabled}
          />
          <small className="form-text">{t.aiMaxRequestsDesc}</small>
        </div>

        <div className="rate-limit-preview rate-limit-preview--ai">
          <Bot size={16} />
          <span>
            {t.aiPreviewAllow}{" "}
            <strong>{formData.rate_limit_ai_max_requests}</strong>{" "}
            {t.aiPreviewCalls}{" "}
            <strong>{formatTime(formData.rate_limit_ai_window_ms)}</strong>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="admin-settings-section__actions">
        <button
          className="admin-btn admin-btn--secondary"
          onClick={loadConfig}
          disabled={isSaving}
        >
          <RefreshCw size={18} />
          {t.reload}
        </button>

        <button
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="spin" size={18} />
              {t.saving}
            </>
          ) : (
            <>
              <Save size={18} />
              {t.save}
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="admin-settings-section__info">
        <AlertCircle size={20} />
        <div>
          <h4>{t.infoTitle}</h4>
          <ul>
            <li>
              <strong>{t.infoGeneralLabel}</strong> {t.infoGeneral}
            </li>
            <li>
              <strong>{t.infoApiLabel}</strong> {t.infoApi}
            </li>
            <li>
              <strong>{t.infoLoginLabel}</strong> {t.infoLogin}
            </li>
            <li>
              <strong>{t.infoAiLabel}</strong> {t.infoAi}
            </li>
            <li>
              {t.info429} <code>429 Too Many Requests</code>
            </li>
            <li>{t.infoWarning}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
