"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Github, Mail, BookOpen } from "lucide-react";
import "./Footer.scss";

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const d = useTranslations("footer");

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <img
                src="/images/logo.png"
                className="logo"
                alt="Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
              <span className="logo-text">{t("common.appName")}</span>
            </div>
            <p className="footer-description">
              {t("common.appName")} - Hệ thống từ điển mở, hỗ trợ đa ngôn ngữ
              Việt - Lào - Anh
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">{d("quickLinks")}</h3>
            <ul className="footer-links">
              <li>
                <Link href="/">{t("navigation.home")}</Link>
              </li>
              <li>
                <Link href="/contribute">{t("navigation.contribute")}</Link>
              </li>
              <li>
                <Link href="/about">{d("about")}</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">{d("contact")}</h3>
            <ul className="footer-links">
              <li>
                <a href="mailto:vinhdd.k63cntt-a@utb.edu.vn">
                  <Mail className="icon" />
                  vinhdd.k63cntt-a@utb.edu.vn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="icon" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h3 className="footer-title">{d("legal")}</h3>
            <ul className="footer-links">
              <li>
                <Link href="/terms-of-service">{d("termsOfService")}</Link>
              </li>
              <li>
                <Link href="/privacy-policy">{d("privacyPolicy")}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} {t("common.appName")}. All rights reserved. Dev
            by Đinh Đức Vình.
          </p>
        </div>
      </div>
    </footer>
  );
}
