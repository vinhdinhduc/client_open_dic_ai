"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Github, Mail, BookOpen, ExternalLink } from "lucide-react";
import "./Footer.scss";

export function Footer() {
  const t = useTranslations();
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
              <b>{d("descriptionBold")}</b>
            </p>
            <p className="footer-description-text"> {d("descriptionText")}</p>
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
              <li>
                <Link href="/contact">{d("contact")}</Link>
              </li>
            </ul>
          </div>

          {/* Guide (formerly Legal) */}
          <div className="footer-section">
            <h3 className="footer-title">{d("guide")}</h3>
            <ul className="footer-links">
              <li>
                <Link href="/user-guide">{d("userGuide")}</Link>
              </li>
              <li>
                <Link href="/faq">{d("faq")}</Link>
              </li>
              <li>
                <Link href="/terms-of-service">{d("termsOfService")}</Link>
              </li>
              <li>
                <Link href="/privacy-policy">{d("privacyPolicy")}</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">{d("contact")}</h3>
            <ul className="footer-links">
              <li>
                <a href="mailto:opendict@utb.edu.vn">
                  <Mail className="icon" />
                  opendict@utb.edu.vn
                </a>
              </li>

              <li>
                <a
                  href="https://www.utb.edu.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="icon" />
                  {d("fanpage")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            {d("copyrightLine1")}
            <br />
            {d("copyrightLine2")}
          </p>
        </div>
      </div>
    </footer>
  );
}
