'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Github, Mail, BookOpen } from 'lucide-react';
import './Footer.scss';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <div className="footer-logo">
              <BookOpen className="logo-icon" />
              <span className="logo-text">{t('common.appName')}</span>
            </div>
            <p className="footer-description">
              {t('common.appName')} - Hệ thống từ điển chuyên ngành mở, hỗ trợ đa ngôn ngữ Việt - Lào - Anh
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li>
                <Link href="/">{t('navigation.home')}</Link>
              </li>
              <li>
                <Link href="/terms">{t('navigation.terms')}</Link>
              </li>
              <li>
                <Link href="/contribute">{t('navigation.contribute')}</Link>
              </li>
              <li>
                <Link href="/about">Giới thiệu</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">Liên hệ</h3>
            <ul className="footer-links">
              <li>
                <a href="mailto:contact@example.com">
                  <Mail className="icon" />
                  contact@example.com
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="icon" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} {t('common.appName')}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}