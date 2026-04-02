"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import {
  Mail,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  FileText,
  RotateCcw,
  ChevronDown,
  Palette,
  Info,
  Settings,
  Pen,
} from "lucide-react";
import systemConfigService, {
  EmailConfig,
} from "@/services/systemConfigService";
import "./AdminEmailSettings.scss";

interface TemplateField {
  key: string;
  label: string;
  type: "text" | "color" | "textarea";
  placeholder?: string;
  hint?: string;
  rows?: number;
}

interface EmailTemplate {
  key: string;
  label: string;
  description: string;
  variables: string[];
  fields: string[];
  default: Record<string, string>;
  db: Record<string, string> | null;
  merged: Record<string, string>;
  isCustomized: boolean;
}

type SupportedLocale = "vi" | "en" | "lo";
type TranslationValues = Record<string, string | number>;
type Translator = (key: string, values?: TranslationValues) => string;

const getFieldDefs = (tt: Translator): Record<string, TemplateField> => ({
  subject: {
    key: "subject",
    label: tt("auto.k001"),
    type: "text",
    placeholder: tt("auto.k038"),
    hint: tt("auto.k039"),
  },
  title: {
    key: "title",
    label: tt("auto.k002"),
    type: "text",
    placeholder: tt("auto.k040"),
    hint: tt("auto.k041"),
  },
  accentColor: {
    key: "accentColor",
    label: tt("auto.k003"),
    type: "color",
    hint: tt("auto.k042"),
  },
  intro: {
    key: "intro",
    label: tt("auto.k004"),
    type: "textarea",
    placeholder: tt("auto.k043"),
    hint: tt("auto.k044"),
    rows: 3,
  },
  ctaLabel: {
    key: "ctaLabel",
    label: tt("auto.k005"),
    type: "text",
    placeholder: tt("auto.k045"),
    hint: tt("auto.k046"),
  },
  warningHtml: {
    key: "warningHtml",
    label: tt("auto.k006"),
    type: "textarea",
    placeholder: tt("auto.k047"),
    hint: tt("auto.k048"),
    rows: 2,
  },
});

const buildPreviewHtml = (
  title: string,
  accentColor: string,
  intro: string,
  locale: SupportedLocale,
  previewHello: string,
  previewUser: string,
  previewRegards: string,
  previewTeam: string,
  previewFooter: string,
  ctaLabel?: string,
  warningHtml?: string,
): string => {
  const year = new Date().getFullYear();
  const ctaSection = ctaLabel
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="#" style="display:inline-block;padding:14px 36px;background:${accentColor};color:#ffffff;
                  text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
          ${ctaLabel}
        </a>
       </div>`
    : "";
  const warnSection = warningHtml
    ? `<div style="background:#fef9c3;border-left:4px solid #f59e0b;border-radius:6px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;color:#92400e;font-size:13px;">${warningHtml}</p>
       </div>`
    : "";

  return `<!DOCTYPE html><html lang="${locale}"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:20px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0"
           style="max-width:520px;width:100%;background:#fff;border-radius:12px;
                  box-shadow:0 4px 16px rgba(0,0,0,0.08);overflow:hidden;">
      <tr>
        <td style="background:${accentColor};padding:20px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">UTB OpenDict</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <h2 style="margin:0 0 16px;color:${accentColor};font-size:18px;font-weight:700;">${title}</h2>
          <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 10px;">
            ${previewHello} <strong>${previewUser}</strong>,
          </p>
          <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 14px;">${intro}</p>
          ${ctaSection}
          ${warnSection}
          <p style="color:#334155;font-size:13px;margin:20px 0 0;line-height:1.6;">
            ${previewRegards},<br/><strong>${previewTeam}</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
            ${previewFooter}<br/>
            © ${year} UTB OpenDict
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
};

export default function AdminEmailSettings() {
  const locale = useLocale();
  const t = useTranslations("adminEmailSettings");
  const tt = useCallback<Translator>(
    (key, values) => t(key as any, values as any),
    [t],
  );
  const safeLocale: SupportedLocale =
    locale === "en" || locale === "lo" ? locale : "vi";
  const fieldDefs = getFieldDefs(tt);

  const getTemplateLabel = useCallback(
    (template: EmailTemplate) => {
      const map: Record<string, string> = {
        verification: tt("auto.k049"),
        welcome: tt("auto.k007"),
        password_reset: tt("auto.k050"),
        contribution_approved: tt("auto.k051"),
        contribution_rejected: tt("auto.k052"),
        comment_moderated: tt("auto.k053"),
        report_resolved: tt("auto.k054"),
        new_contribution_admin: tt("auto.k055"),
        new_report_admin: tt("auto.k056"),
      };
      return map[template.key] || template.label;
    },
    [tt],
  );

  const getTemplateDescription = useCallback(
    (template: EmailTemplate) => {
      const map: Record<string, string> = {
        verification: tt("auto.k057"),
        welcome: tt("auto.k058"),
        password_reset: tt("auto.k059"),
        contribution_approved: tt("auto.k060"),
        contribution_rejected: tt("auto.k061"),
        comment_moderated: tt("auto.k062"),
        report_resolved: tt("auto.k063"),
        new_contribution_admin: tt("auto.k064"),
        new_report_admin: tt("auto.k065"),
      };
      return map[template.key] || template.description;
    },
    [tt],
  );

  const [activeTab, setActiveTab] = useState<"smtp" | "templates">("smtp");

  const [config, setConfig] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [smtpForm, setSmtpForm] = useState({
    email_service: "gmail",
    email_host: "smtp.gmail.com",
    email_port: 587,
    email_secure: false,
    email_user: "",
    email_password: "",
    email_from: "",
    email_from_name: tt("auto.k008"),
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
  const [templateForm, setTemplateForm] = useState<Record<string, string>>({});
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isResettingTemplate, setIsResettingTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    loadSmtpConfig();
  }, []);

  const loadSmtpConfig = async () => {
    try {
      setIsLoading(true);
      const response = await systemConfigService.getEmailConfig();
      if (response.success && response.data) {
        setConfig(response.data);
        const configObj: any = {};
        response.data.forEach((item: any) => {
          configObj[item.key] = item.value;
        });
        setSmtpForm({
          email_service: configObj.email_service || "gmail",
          email_host: configObj.email_host || "smtp.gmail.com",
          email_port: configObj.email_port || 587,
          email_secure: configObj.email_secure || false,
          email_user: configObj.email_user || "",
          email_password: configObj.email_password || "",
          email_from: configObj.email_from || "",
          email_from_name: configObj.email_from_name || tt("auto.k009"),
        });
      }
    } catch (error: any) {
      toast.error(error.message || tt("auto.k066"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmtpSave = async () => {
    try {
      setIsSaving(true);
      setTestResult(null);
      if (!smtpForm.email_user || !smtpForm.email_password) {
        toast.error(tt("auto.k067"));
        return;
      }
      if (smtpForm.email_port < 1 || smtpForm.email_port > 65535) {
        toast.error(tt("auto.k068"));
        return;
      }
      const result = await systemConfigService.updateEmailConfig(smtpForm);
      if (result.success) {
        toast.success(config.length > 0 ? tt("auto.k069") : tt("auto.k070"));
        await loadSmtpConfig();
      }
    } catch (error: any) {
      toast.error(error.message || tt("auto.k071"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const result = await systemConfigService.testEmailConfig(
        testEmail || undefined,
      );
      setTestResult({
        success: result.success,
        message: result.message || tt("auto.k010"),
      });
      if (result.success) {
        toast.success(
          testEmail
            ? tt("auto.k072", { testEmail: testEmail })
            : tt("auto.k073"),
        );
      } else {
        toast.error(tt("auto.k074"));
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || tt("auto.k075"),
      });
      toast.error(error.message || tt("auto.k076"));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSmtpInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setSmtpForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseInt(value) || 0
            : value,
    }));
  };

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      const response = await systemConfigService.getEmailTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
        if (response.data.length > 0 && !selectedTemplateKey) {
          const firstKey = response.data[0].key;
          setSelectedTemplateKey(firstKey);
          setTemplateForm(response.data[0].merged);
        }
      }
    } catch (error: any) {
      toast.error(error.message || tt("auto.k077"));
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [selectedTemplateKey, tt]);

  useEffect(() => {
    if (activeTab === "templates" && templates.length === 0) {
      loadTemplates();
    }
  }, [activeTab]);

  const selectedTemplate = templates.find((t) => t.key === selectedTemplateKey);

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    const tmpl = templates.find((t) => t.key === key);
    if (tmpl) setTemplateForm({ ...tmpl.merged });
  };

  const handleTemplateFieldChange = (key: string, value: string) => {
    setTemplateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplateKey) return;
    try {
      setIsSavingTemplate(true);
      const response = await systemConfigService.updateEmailTemplate(
        selectedTemplateKey,
        templateForm,
      );
      if (response.success) {
        toast.success(tt("auto.k078"));
        await loadTemplates();
      }
    } catch (error: any) {
      toast.error(error.message || tt("auto.k079"));
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleResetTemplate = async () => {
    if (!selectedTemplateKey || !selectedTemplate) return;
    const confirmed = window.confirm(
      tt("auto.k080", {
        getTemplateLabel_selectedTemplate: getTemplateLabel(selectedTemplate),
      }),
    );
    if (!confirmed) return;
    try {
      setIsResettingTemplate(true);
      const response =
        await systemConfigService.resetEmailTemplate(selectedTemplateKey);
      if (response.success) {
        toast.success(tt("auto.k081"));
        // Update local state
        setTemplateForm({ ...selectedTemplate.default });
        setTemplates((prev) =>
          prev.map((t) =>
            t.key === selectedTemplateKey
              ? {
                  ...t,
                  db: null,
                  merged: { ...t.default },
                  isCustomized: false,
                }
              : t,
          ),
        );
      }
    } catch (error: any) {
      toast.error(error.message || tt("auto.k082"));
    } finally {
      setIsResettingTemplate(false);
    }
  };

  const previewHtml = selectedTemplate
    ? buildPreviewHtml(
        templateForm.title || "",
        templateForm.accentColor || "#2563eb",
        templateForm.intro || "",
        safeLocale,
        tt("auto.k011"),
        tt("auto.k012"),
        tt("auto.k013"),
        tt("auto.k014"),
        tt("auto.k083"),
        templateForm.ctaLabel,
        templateForm.warningHtml,
      )
    : "";

  if (isLoading) {
    return (
      <div className="admin-settings-section">
        <div className="admin-settings-section__loading">
          <RefreshCw className="spin" size={32} />
          <p>{tt("auto.k084")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-section email-settings">
      {/* ── Tab Bar ── */}
      <div className="email-settings__tabs">
        <button
          className={`email-settings__tab ${activeTab === "smtp" ? "email-settings__tab--active" : ""}`}
          onClick={() => setActiveTab("smtp")}
        >
          <Settings size={16} />
          {tt("auto.k015")}
        </button>
        <button
          className={`email-settings__tab ${activeTab === "templates" ? "email-settings__tab--active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          <FileText size={16} />
          {tt("auto.k016")}
          {templates.some((t) => t.isCustomized) && (
            <span className="email-settings__tab-badge">
              {templates.filter((t) => t.isCustomized).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "smtp" && (
        <>
          {/* Provider Selection */}
          <div className="admin-settings-section__group">
            <h3>{tt("auto.k017")}</h3>
            <div className="form-group">
              <label htmlFor="email_service">{tt("auto.k018")}</label>
              <select
                id="email_service"
                name="email_service"
                value={smtpForm.email_service}
                onChange={handleSmtpInputChange}
                className="form-control"
              >
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="smtp">SMTP Custom</option>
              </select>
              <small className="form-text">{tt("auto.k085")}</small>
            </div>
          </div>

          {/* SMTP Configuration */}
          <div className="admin-settings-section__group">
            <h3>{tt("auto.k019")}</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email_host">SMTP Host</label>
                <input
                  type="text"
                  id="email_host"
                  name="email_host"
                  value={smtpForm.email_host}
                  onChange={handleSmtpInputChange}
                  placeholder="smtp.gmail.com"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email_port">Port</label>
                <input
                  type="number"
                  id="email_port"
                  name="email_port"
                  value={smtpForm.email_port}
                  onChange={handleSmtpInputChange}
                  placeholder="587"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="email_secure"
                  checked={smtpForm.email_secure}
                  onChange={handleSmtpInputChange}
                />
                <span>{tt("auto.k086")}</span>
              </label>
              <small className="form-text">{tt("auto.k087")}</small>
            </div>
          </div>

          {/* Authentication */}
          <div className="admin-settings-section__group">
            <h3>{tt("auto.k020")}</h3>
            <div className="form-group">
              <label htmlFor="email_user">Email/Username</label>
              <input
                type="email"
                id="email_user"
                name="email_user"
                value={smtpForm.email_user}
                onChange={handleSmtpInputChange}
                placeholder="email@example.com"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email_password">{tt("auto.k088")}</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="email_password"
                  name="email_password"
                  value={smtpForm.email_password}
                  onChange={handleSmtpInputChange}
                  placeholder={tt("auto.k089")}
                  className="form-control"
                />
                <button
                  type="button"
                  className="input-group__btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small className="form-text">{tt("auto.k090")}</small>
            </div>
          </div>

          {/* Sender Info */}
          <div className="admin-settings-section__group">
            <h3>{tt("auto.k021")}</h3>
            <div className="form-group">
              <label htmlFor="email_from">{tt("auto.k022")}</label>
              <input
                type="email"
                id="email_from"
                name="email_from"
                value={smtpForm.email_from}
                onChange={handleSmtpInputChange}
                placeholder="noreply@example.com"
                className="form-control"
              />
              <small className="form-text">{tt("auto.k091")}</small>
            </div>
            <div className="form-group">
              <label htmlFor="email_from_name">{tt("auto.k023")}</label>
              <input
                type="text"
                id="email_from_name"
                name="email_from_name"
                value={smtpForm.email_from_name}
                onChange={handleSmtpInputChange}
                placeholder={tt("auto.k092")}
                className="form-control"
              />
            </div>
          </div>

          {/* Test Email */}
          <div className="admin-settings-section__group">
            <h3>{tt("auto.k024")}</h3>
            <div className="form-group">
              <label htmlFor="testEmail">{tt("auto.k093")}</label>
              <div className="input-group">
                <input
                  type="email"
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="form-control"
                />
                <button
                  type="button"
                  className="input-group__btn"
                  onClick={handleTest}
                  disabled={isTesting || isSaving}
                >
                  {isTesting ? (
                    <RefreshCw className="spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
              <small className="form-text">{tt("auto.k094")}</small>
            </div>
            {testResult && (
              <div
                className={`admin-settings-section__test-result ${
                  testResult.success
                    ? "admin-settings-section__test-result--success"
                    : "admin-settings-section__test-result--error"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle size={20} />
                ) : (
                  <XCircle size={20} />
                )}
                <p>{testResult.message}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="admin-settings-section__actions">
            <button
              className="admin-btn admin-btn--secondary"
              onClick={handleTest}
              disabled={isTesting || isSaving}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="spin" size={18} />
                  {tt("auto.k025")}
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  {tt("auto.k026")}
                </>
              )}
            </button>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSmtpSave}
              disabled={isSaving || isTesting}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="spin" size={18} />
                  {tt("auto.k027")}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {tt("auto.k028")}
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="admin-settings-section__info">
            <AlertCircle size={20} />
            <div>
              <h4>{tt("auto.k095")}</h4>
              <ul>
                <li>{tt("auto.k096")}</li>
                <li>
                  {tt("auto.k097")}{" "}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Account Settings
                  </a>
                </li>
                <li>{tt("auto.k098")}</li>
                <li>{tt("auto.k099")}</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {activeTab === "templates" && (
        <div className="template-editor">
          {isLoadingTemplates ? (
            <div className="admin-settings-section__loading">
              <RefreshCw className="spin" size={28} />
              <p>{tt("auto.k100")}</p>
            </div>
          ) : (
            <>
              {/* Template Selector */}
              <div className="template-editor__selector-wrap">
                <div className="template-editor__selector">
                  <div className="template-editor__selector-label">
                    <FileText size={16} />
                    <span>{tt("auto.k101")}</span>
                  </div>
                  <div className="template-editor__dropdown-wrap">
                    <select
                      className="template-editor__dropdown"
                      value={selectedTemplateKey}
                      onChange={(e) => handleSelectTemplate(e.target.value)}
                    >
                      {templates.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.isCustomized ? <Pen /> : ""}
                          {getTemplateLabel(t)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="template-editor__dropdown-icon"
                    />
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="template-editor__template-meta">
                    <p className="template-editor__template-desc">
                      <Info size={13} />
                      {getTemplateDescription(selectedTemplate)}
                    </p>
                    {selectedTemplate.isCustomized ? (
                      <span className="template-editor__badge template-editor__badge--custom">
                        {tt("auto.k029")}
                      </span>
                    ) : (
                      <span className="template-editor__badge template-editor__badge--default">
                        {tt("auto.k102")}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {selectedTemplate && (
                <div className="template-editor__layout">
                  {/* ── Left: Form ── */}
                  <div className="template-editor__form-panel">
                    {/* Available Variables */}
                    {selectedTemplate.variables.length > 0 && (
                      <div className="template-editor__variables">
                        <span className="template-editor__variables-title">
                          {tt("auto.k103")}
                        </span>
                        {selectedTemplate.variables.map((v) => (
                          <code key={v} className="template-editor__var-chip">
                            {v}
                          </code>
                        ))}
                      </div>
                    )}

                    {/* Fields */}
                    {selectedTemplate.fields.map((fieldKey) => {
                      const field = fieldDefs[fieldKey];
                      if (!field) return null;

                      const currentVal = templateForm[field.key] || "";
                      const defaultVal =
                        selectedTemplate.default[field.key] || "";
                      const isOverridden = currentVal !== defaultVal;

                      return (
                        <div
                          key={field.key}
                          className={`form-group template-editor__field ${isOverridden ? "template-editor__field--modified" : ""}`}
                        >
                          <div className="template-editor__field-header">
                            <label htmlFor={`tmpl-${field.key}`}>
                              {field.type === "color" && <Palette size={13} />}
                              {field.label}
                            </label>
                            {isOverridden && (
                              <button
                                type="button"
                                className="template-editor__field-reset"
                                title={tt("auto.k104")}
                                onClick={() =>
                                  handleTemplateFieldChange(
                                    field.key,
                                    defaultVal,
                                  )
                                }
                              >
                                <RotateCcw size={12} />
                                {tt("auto.k030")}
                              </button>
                            )}
                          </div>

                          {field.type === "color" ? (
                            <div className="template-editor__color-row">
                              <input
                                type="color"
                                id={`tmpl-${field.key}`}
                                value={currentVal || "#2563eb"}
                                onChange={(e) =>
                                  handleTemplateFieldChange(
                                    field.key,
                                    e.target.value,
                                  )
                                }
                                className="template-editor__color-picker"
                              />
                              <input
                                type="text"
                                value={currentVal}
                                onChange={(e) =>
                                  handleTemplateFieldChange(
                                    field.key,
                                    e.target.value,
                                  )
                                }
                                placeholder="#2563eb"
                                className="form-control template-editor__color-hex"
                              />
                              <div
                                className="template-editor__color-preview"
                                style={{ background: currentVal || "#2563eb" }}
                              />
                            </div>
                          ) : field.type === "textarea" ? (
                            <textarea
                              id={`tmpl-${field.key}`}
                              value={currentVal}
                              onChange={(e) =>
                                handleTemplateFieldChange(
                                  field.key,
                                  e.target.value,
                                )
                              }
                              placeholder={field.placeholder}
                              className="form-control template-editor__textarea"
                              rows={field.rows || 3}
                            />
                          ) : (
                            <input
                              type="text"
                              id={`tmpl-${field.key}`}
                              value={currentVal}
                              onChange={(e) =>
                                handleTemplateFieldChange(
                                  field.key,
                                  e.target.value,
                                )
                              }
                              placeholder={field.placeholder}
                              className="form-control"
                            />
                          )}

                          {field.hint && (
                            <small className="form-text">{field.hint}</small>
                          )}

                          {/* Default value hint */}
                          {defaultVal && field.type !== "color" && (
                            <small className="template-editor__default-hint">
                              {tt("auto.k031")}{" "}
                              <em>
                                {defaultVal.length > 80
                                  ? defaultVal.slice(0, 80) + "…"
                                  : defaultVal}
                              </em>
                            </small>
                          )}
                        </div>
                      );
                    })}

                    {/* Actions */}
                    <div className="template-editor__actions">
                      <button
                        className="admin-btn admin-btn--ghost"
                        onClick={handleResetTemplate}
                        disabled={
                          isResettingTemplate ||
                          isSavingTemplate ||
                          !selectedTemplate.isCustomized
                        }
                        title={
                          !selectedTemplate.isCustomized ? tt("auto.k105") : ""
                        }
                      >
                        {isResettingTemplate ? (
                          <>
                            <RefreshCw className="spin" size={16} />
                            {tt("auto.k106")}
                          </>
                        ) : (
                          <>
                            <RotateCcw size={16} />
                            {tt("auto.k107")}
                          </>
                        )}
                      </button>

                      <button
                        className="admin-btn admin-btn--primary"
                        onClick={handleSaveTemplate}
                        disabled={isSavingTemplate || isResettingTemplate}
                      >
                        {isSavingTemplate ? (
                          <>
                            <RefreshCw className="spin" size={16} />
                            {tt("auto.k032")}
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            {tt("auto.k108")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ── Right: Preview ── */}
                  <div className="template-editor__preview-panel">
                    <div className="template-editor__preview-header">
                      <Eye size={15} />
                      <span>{tt("auto.k033")}</span>
                      <button
                        className="template-editor__preview-toggle"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? tt("auto.k034") : tt("auto.k035")}
                      </button>
                    </div>

                    {showPreview && (
                      <>
                        {/* Subject preview */}
                        <div className="template-editor__subject-preview">
                          <span className="template-editor__subject-label">
                            {tt("auto.k036")}
                          </span>
                          <span className="template-editor__subject-text">
                            {templateForm.subject || tt("auto.k109")}
                          </span>
                        </div>

                        {/* HTML preview iframe */}
                        <div className="template-editor__iframe-wrap">
                          <iframe
                            key={previewHtml}
                            srcDoc={previewHtml}
                            title={tt("auto.k110")}
                            className="template-editor__iframe"
                            sandbox="allow-same-origin"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="template-editor__legend">
                <div className="template-editor__legend-item">
                  <span className="template-editor__badge template-editor__badge--custom">
                    {tt("auto.k037")}
                  </span>
                  <span>{tt("auto.k111")}</span>
                </div>
                <div className="template-editor__legend-item">
                  <span className="template-editor__badge template-editor__badge--default">
                    {tt("auto.k112")}
                  </span>
                  <span>{tt("auto.k113")}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
