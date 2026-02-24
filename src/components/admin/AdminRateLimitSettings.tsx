"use client";

import { useState, useEffect } from "react";
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

export default function AdminRateLimitSettings() {
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
          rate_limit_ai_max_requests:
            configObj.rate_limit_ai_max_requests || 5,
        });
      }
    } catch (error: any) {
      console.error("Load config error:", error);
      toast.error(error.message || "Không thể tải cấu hình rate limit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validation
      if (formData.rate_limit_window_ms < 1000) {
        toast.error("Thời gian cửa sổ phải ít nhất 1 giây (1000ms)");
        return;
      }

      if (formData.rate_limit_max_requests < 1) {
        toast.error("Số lượng request tối đa phải lớn hơn 0");
        return;
      }

      await systemConfigService.updateRateLimitConfig(formData);

      toast.success(
        hasExistingConfig
          ? "Đã cập nhật cấu hình Rate Limit thành công"
          : "Đã tạo mới cấu hình Rate Limit thành công",
      );
      await loadConfig();
    } catch (error: any) {
      console.error("Save config error:", error);
      toast.error(error.message || "Không thể lưu cấu hình");
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
          <p>Đang tải cấu hình...</p>
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
          Trạng thái Rate Limiting
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
            <span>Bật Rate Limiting</span>
          </label>
          <small className="form-text">
            Giới hạn số lượng request để bảo vệ hệ thống khỏi tấn công DDoS
          </small>
        </div>
      </div>

      {/* General Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Activity size={20} />
          Rate Limit Chung
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_window_ms">
            Cửa sổ thời gian (milliseconds)
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
          <small className="form-text">
            Thời gian theo dõi request từ cùng một IP (mặc định: 15 phút =
            900000ms)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_max_requests">Số request tối đa</label>
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
          <small className="form-text">
            Số lượng request tối đa cho phép trong cửa sổ thời gian (mặc định:
            100)
          </small>
        </div>

        <div className="rate-limit-preview">
          <Activity size={16} />
          <span>
            Cho phép <strong>{formData.rate_limit_max_requests}</strong>{" "}
            requests trong{" "}
            <strong>{formatTime(formData.rate_limit_window_ms)}</strong>
          </span>
        </div>
      </div>

      {/* API Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Clock size={20} />
          Rate Limit API
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_api_window_ms">
            Cửa sổ thời gian API (milliseconds)
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
          <small className="form-text">
            Cửa sổ thời gian cho API endpoints (mặc định: 1 phút = 60000ms)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_api_max_requests">
            Số request API tối đa
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
          <small className="form-text">
            Số request tối đa cho API trong cửa sổ thời gian (mặc định: 30)
          </small>
        </div>

        <div className="rate-limit-preview">
          <Clock size={16} />
          <span>
            Cho phép <strong>{formData.rate_limit_api_max_requests}</strong> API
            calls trong{" "}
            <strong>{formatTime(formData.rate_limit_api_window_ms)}</strong>
          </span>
        </div>
      </div>

      {/* Login Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Lock size={20} />
          Rate Limit Đăng Nhập
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_login_window_ms">
            Cửa sổ thời gian đăng nhập (milliseconds)
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
          <small className="form-text">
            Thời gian theo dõi các lần thử đăng nhập (mặc định: 15 phút =
            900000ms)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_login_max_attempts">
            Số lần thử đăng nhập tối đa
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
          <small className="form-text">
            Số lần đăng nhập sai cho phép trước khi khóa tạm thời (mặc định: 5)
          </small>
        </div>

        <div className="rate-limit-preview rate-limit-preview--warning">
          <Lock size={16} />
          <span>
            Cho phép <strong>{formData.rate_limit_login_max_attempts}</strong>{" "}
            lần thử sai trong{" "}
            <strong>{formatTime(formData.rate_limit_login_window_ms)}</strong>
          </span>
        </div>
      </div>

      {/* AI Rate Limit */}
      <div className="admin-settings-section__group">
        <h3>
          <Bot size={20} />
          Rate Limit Gọi AI
        </h3>

        <div className="form-group">
          <label htmlFor="rate_limit_ai_window_ms">
            Cửa sổ thời gian AI (milliseconds)
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
          <small className="form-text">
            Thời gian theo dõi số lượt gọi AI từ một người dùng (mặc định: 1 phút = 60000ms)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="rate_limit_ai_max_requests">
            Số lượt gọi AI tối đa
          </label>
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
          <small className="form-text">
            Số lượt gọi AI tối đa trong cửa sổ thời gian (mặc định: 5 lượt / phút)
          </small>
        </div>

        <div className="rate-limit-preview rate-limit-preview--ai">
          <Bot size={16} />
          <span>
            Cho phép <strong>{formData.rate_limit_ai_max_requests}</strong> lượt
            gọi AI trong{" "}
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
          Tải lại
        </button>

        <button
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={isSaving}
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
          <h4>Thông tin Rate Limiting</h4>
          <ul>
            <li>
              <strong>Rate Limit Chung:</strong> Áp dụng cho tất cả các requests
              từ một IP
            </li>
            <li>
              <strong>Rate Limit API:</strong> Giới hạn chặt chẽ hơn cho các API
              endpoints
            </li>
            <li>
              <strong>Rate Limit Đăng Nhập:</strong> Bảo vệ khỏi brute-force
              attack
            </li>
            <li>
              <strong>Rate Limit Gọi AI:</strong> Giới hạn số lần gọi AI mỗi
              phút để kiểm soát chi phí API
            </li>
            <li>
              Khi đạt giới hạn, người dùng sẽ nhận mã lỗi{" "}
              <code>429 Too Many Requests</code>
            </li>
            <li>
              Cẩn thận khi thay đổi giá trị - giá trị quá thấp có thể ảnh hưởng
              đến người dùng thật
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
