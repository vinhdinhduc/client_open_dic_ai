"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Bot,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import aiService, { AIConfig } from "@/services/aiService";
import "./AdminAISettings.scss";

export default function AdminAISettings() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    apiKey: "",
    provider: "gemini",
    model: "Gemini 2.5 Flash",
    maxTokens: 1000,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const data = await aiService.getConfig();
      console.log("check config", data);

      setConfig(data);
      setHasExistingConfig(!!data.apiKey || !!data.hasApiKey);

      const isMaskedApiKey = data.apiKey && data.apiKey.includes("***");

      setFormData({
        apiKey: isMaskedApiKey ? "" : data.apiKey || "",
        provider: data.provider || "gemini",
        model: data.model || "Gemini 2.5 Flash",
        maxTokens: data.maxTokens || 1000,
      });

      // If API key is masked, the form field is left empty (placeholder shows masked value)
    } catch (error: any) {
      console.error("Load config error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setTestResult(null);

      // Validation
      if (formData.apiKey && formData.apiKey.length < 10) {
        toast.error("API Key không hợp lệ");
        return;
      }

      if (formData.maxTokens < 100 || formData.maxTokens > 4000) {
        toast.error("Max Tokens phải từ 100 đến 4000");
        return;
      }

      await aiService.updateConfig(formData);

      toast.success(
        hasExistingConfig
          ? "Đã cập nhật cấu hình AI thành công"
          : "Đã tạo mới cấu hình AI thành công",
      );
      await loadConfig();
    } catch (error: any) {
      console.error("Save config error:", error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      const result = await aiService.testConnection();
      setTestResult({
        success: result.success && result.configured,
        message: result.message,
      });

      if (result.success && result.configured) {
        toast.success("Kết nối AI thành công!");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      setTestResult({
        success: false,
        message: error.message,
      });
      toast.error(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "temperature" || name === "maxTokens"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="admin-settings-section">
        <div className="admin-settings-section__loading">
          <RefreshCw className="spin" size={32} />
          <p>Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-section">
      <div className="admin-settings-section__header">
        <Bot size={28} />
        <h2>Cài đặt AI</h2>
      </div>
      {/* Status Badge */}
      {config?.hasApiKey && (
        <div className="admin-settings-section__status">
          <CheckCircle size={18} />
          <span>API Key đã được cấu hình</span>
        </div>
      )}

      {/* Provider Selection */}
      <div className="admin-settings-section__group">
        <h3>Nhà cung cấp AI</h3>
        <div className="form-group">
          <label htmlFor="provider">Provider</label>
          <select
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI (Coming soon)</option>
          </select>
          <small className="form-text">
            Chọn nhà cung cấp dịch vụ AI bạn muốn sử dụng
          </small>
        </div>
      </div>

      {/* API Configuration */}
      <div className="admin-settings-section__group">
        <h3>Cấu hình API</h3>

        <div className="form-group">
          <label htmlFor="apiKey">
            API Key
            {formData.provider === "gemini" && (
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-link"
              >
                <ExternalLink size={14} />
                Lấy API key
              </a>
            )}
          </label>
          <div className="input-group">
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder={
                config?.hasApiKey && !formData.apiKey
                  ? "API key hiện tại: " + (config.apiKey || "****")
                  : "Nhập API key mới..."
              }
              className="form-control"
            />
            <button
              type="button"
              className="input-group__btn"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? "Ẩn API key" : "Hiện API key"}
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <small className="form-text">
            {config?.hasApiKey && !formData.apiKey ? (
              <span className="text-success">
                <CheckCircle size={18} /> API key đã được mã hóa AES-256 và lưu
                trữ an toàn. Để thay đổi, nhập API key mới.
              </span>
            ) : (
              <span>
                API key sẽ được mã hóa AES-256-GCM trước khi lưu vào database
              </span>
            )}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="model">Model</label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="form-control"
          >
            {formData.provider === "gemini" && (
              <>
                <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                <option value="Gemini 2.5 Flash Lite">
                  Gemini 2.5 Flash Lite
                </option>
                <option value="Gemini 2.5 Flash TTS">
                  Gemini 2.5 Flash TTS
                </option>
                <option value="Gemini 3 Flash">Gemini 3 Flash</option>
                <option value="Gemma 3 12B">Gemma 3 12B</option>
              </>
            )}
            {formData.provider === "openai" && (
              <>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </>
            )}
          </select>
          <small className="form-text">
            Sử dụng Google Generative AI SDK - Hỗ trợ tất cả models mới nhất
          </small>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="admin-settings-section__group">
        <h3>Cài đặt nâng cao</h3>

        <div className="form-group">
          <label htmlFor="maxTokens">Max Tokens</label>
          <input
            type="number"
            id="maxTokens"
            name="maxTokens"
            min="100"
            max="4000"
            step="100"
            value={formData.maxTokens}
            onChange={handleInputChange}
            className="form-control"
          />
          <small className="form-text">
            Số token tối đa cho mỗi phản hồi (100-4000)
          </small>
        </div>
      </div>

      {/* Test Result */}
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
              Đang test...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Test kết nối
            </>
          )}
        </button>

        <button
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={isSaving || isTesting}
        >
          {isSaving ? (
            <>
              <RefreshCw className="spin" size={18} />
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={18} />
              Lưu cấu hình
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="admin-settings-section__info">
        <AlertCircle size={20} />
        <div>
          <h4>Hướng dẫn sử dụng</h4>
          <ul>
            <li>
              <strong>SDK:</strong> Sử dụng @google/generative-ai SDK chính thức
              - Hỗ trợ đầy đủ models mới nhất
            </li>

            <li>
              Lấy API key miễn phí tại{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google AI Studio
              </a>
            </li>
            <li>
              <strong>Bảo mật:</strong> API key được mã hóa AES-256-GCM trước
              khi lưu
            </li>
            <li>Nhấn "Test kết nối" để kiểm tra trước khi lưu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
