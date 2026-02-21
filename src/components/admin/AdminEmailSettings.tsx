"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import systemConfigService, {
  EmailConfig,
} from "@/services/systemConfigService";
import "./AdminEmailSettings.scss";

export default function AdminEmailSettings() {
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

  // Form data
  const [formData, setFormData] = useState({
    email_service: "gmail",
    email_host: "smtp.gmail.com",
    email_port: 587,
    email_secure: false,
    email_user: "",
    email_password: "",
    email_from: "",
    email_from_name: "Từ điển Mở",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await systemConfigService.getEmailConfig();
      console.log("Check get config", response);

      if (response.success && response.data) {
        setConfig(response.data);

        // Convert array to object
        const configObj: any = {};
        response.data.forEach((item: any) => {
          configObj[item.key] = item.value;
        });

        setFormData({
          email_service: configObj.email_service || "gmail",
          email_host: configObj.email_host || "smtp.gmail.com",
          email_port: configObj.email_port || 587,
          email_secure: configObj.email_secure || false,
          email_user: configObj.email_user || "",
          email_password: configObj.email_password || "",
          email_from: configObj.email_from || "",
          email_from_name: configObj.email_from_name || "Từ điển Mở",
        });
      }
    } catch (error: any) {
      console.error("Load config error:", error);
      toast.error(error.message || "Không thể tải cấu hình email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setTestResult(null);

      // Validation
      if (!formData.email_user || !formData.email_password) {
        toast.error("Email và mật khẩu là bắt buộc");
        return;
      }

      if (formData.email_port < 1 || formData.email_port > 65535) {
        toast.error("Port phải từ 1 đến 65535");
        return;
      }

      // Gọi API bulk - tự động tạo mới nếu chưa có, cập nhật nếu đã có
      const result = await systemConfigService.updateEmailConfig(formData);

      if (result.success) {
        const hasExistingConfig = config.length > 0;
        toast.success(
          hasExistingConfig
            ? "Đã cập nhật cấu hình Email thành công"
            : "Đã tạo mới cấu hình Email thành công"
        );
        await loadConfig();
      }
    } catch (error: any) {
      console.error("Save config error:", error);
      toast.error(error.message || "Không thể lưu cấu hình");
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
        message: result.message || "Test thành công",
      });

      if (result.success) {
        toast.success(
          testEmail
            ? `Đã gửi email test đến ${testEmail}`
            : "Cấu hình email hợp lệ",
        );
      } else {
        toast.error("Cấu hình email không hợp lệ");
      }
    } catch (error: any) {
      console.error("Test email error:", error);
      setTestResult({
        success: false,
        message: error.message || "Lỗi khi test email",
      });
      toast.error(error.message || "Không thể test email");
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseInt(value) || 0
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
      {/* Provider Selection */}
      <div className="admin-settings-section__group">
        <h3>Dịch vụ Email</h3>
        <div className="form-group">
          <label htmlFor="email_service">Nhà cung cấp</label>
          <select
            id="email_service"
            name="email_service"
            value={formData.email_service}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
            <option value="smtp">SMTP Custom</option>
          </select>
          <small className="form-text">
            Chọn dịch vụ email bạn muốn sử dụng
          </small>
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="admin-settings-section__group">
        <h3>Cấu hình SMTP</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email_host">SMTP Host</label>
            <input
              type="text"
              id="email_host"
              name="email_host"
              value={formData.email_host}
              onChange={handleInputChange}
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
              value={formData.email_port}
              onChange={handleInputChange}
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
              checked={formData.email_secure}
              onChange={handleInputChange}
            />
            <span>Sử dụng SSL/TLS (port 465)</span>
          </label>
          <small className="form-text">
            Bật nếu sử dụng port 465, tắt nếu dùng port 587 (STARTTLS)
          </small>
        </div>
      </div>

      {/* Authentication */}
      <div className="admin-settings-section__group">
        <h3>Xác thực</h3>

        <div className="form-group">
          <label htmlFor="email_user">Email/Username</label>
          <input
            type="email"
            id="email_user"
            name="email_user"
            value={formData.email_user}
            onChange={handleInputChange}
            placeholder="email@example.com"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email_password">Mật khẩu/App Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              id="email_password"
              name="email_password"
              value={formData.email_password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu hoặc app password..."
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
          <small className="form-text">
            Với Gmail, hãy sử dụng App Password thay vì mật khẩu thông thường
          </small>
        </div>
      </div>

      {/* Sender Info */}
      <div className="admin-settings-section__group">
        <h3>Thông tin người gửi</h3>

        <div className="form-group">
          <label htmlFor="email_from">Email người gửi</label>
          <input
            type="email"
            id="email_from"
            name="email_from"
            value={formData.email_from}
            onChange={handleInputChange}
            placeholder="noreply@example.com"
            className="form-control"
          />
          <small className="form-text">
            Để trống để sử dụng email xác thực
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="email_from_name">Tên người gửi</label>
          <input
            type="text"
            id="email_from_name"
            name="email_from_name"
            value={formData.email_from_name}
            onChange={handleInputChange}
            placeholder="Từ điển Mở"
            className="form-control"
          />
        </div>
      </div>

      {/* Test Email */}
      <div className="admin-settings-section__group">
        <h3>Test cấu hình</h3>

        <div className="form-group">
          <label htmlFor="testEmail">Email nhận test (tuỳ chọn)</label>
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
          <small className="form-text">
            Để trống để chỉ kiểm tra cấu hình, nhập email để gửi email test
          </small>
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
          <h4>Hướng dẫn cấu hình Gmail</h4>
          <ul>
            <li>Bật xác thực 2 bước trong tài khoản Google của bạn</li>
            <li>
              Tạo App Password tại{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Account Settings
              </a>
            </li>
            <li>
              Sử dụng App Password (16 ký tự) thay vì mật khẩu thông thường
            </li>
            <li>Host: smtp.gmail.com, Port: 587, SSL/TLS: Tắt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
