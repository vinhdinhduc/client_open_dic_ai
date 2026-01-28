"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faSun,
  faMoon,
  faShield,
  faUser,
  faPlus,
  faStar,
  faClock,
  faSignOutAlt,
  faSignInAlt,
  faUserPlus,
  faBars,
  faTimes,
  faChevronDown,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import "./Header.scss";

const Header = () => {
  const t = useTranslations();
  const { user, isAuthenticated, isAdmin, isModerator, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "lo", name: "ລາວ", flag: "🇱🇦" },
  ];

  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo & App Name */}
        <div className="header__left">
          <Link href="/" className="header__logo">
            <div className="header__logo-icon">
              <img
                src="/images/logo.jpg"
                className="logo"
                alt="Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </div>
            <span className="header__app-name">{t("common.appName")}</span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="header__right">
          {/* Language Selector */}
          <div className="header__language" ref={langMenuRef}>
            <button
              className="header__language-toggle"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-label={t("header.language")}
            >
              <span className="header__language-flag">
                {currentLang?.flag}
              </span>
              <span className="header__language-code">
                {currentLang?.code.toUpperCase()}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="header__language-arrow"
              />
            </button>

            {langMenuOpen && (
              <div className="header__language-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`header__language-item ${
                      currentLanguage === lang.code
                        ? "header__language-item--active"
                        : ""
                    }`}
                    onClick={() => {
                      changeLanguage(lang.code as "vi" | "en" | "lo");
                      setLangMenuOpen(false);
                    }}
                  >
                    <span className="header__language-flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              className="header__theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? t("header.lightMode") : t("header.darkMode")
              }
            >
              <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
            </button>
          )}

          {/* Auth Section */}
          {isAuthenticated ? (
            <>
              {/* Admin Link - Only for Admin/Moderator */}
              {isModerator && (
                <Link
                  href="/admin"
                  className="header__admin-link"
                >
                  <FontAwesomeIcon icon={faShield} />
                  <span>{t("header.admin")}</span>
                </Link>
              )}

              {/* User Menu */}
              <div className="header__user-menu" ref={userMenuRef}>
                <button
                  className="header__user-toggle"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="header__user-avatar"
                    />
                  ) : (
                    <div className="header__user-avatar header__user-avatar--default">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="header__user-name">{user?.fullName}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="header__user-arrow"
                  />
                </button>

                {userMenuOpen && (
                  <div className="header__user-dropdown">
                    <Link
                      href="/profile"
                      className="header__user-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>{t("header.profile")}</span>
                    </Link>

                    <Link
                      href="/contributions"
                      className="header__user-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      <span>{t("header.myContributions")}</span>
                    </Link>

                    <Link
                      href="/favorites"
                      className="header__user-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faStar} />
                      <span>{t("header.myFavorites")}</span>
                    </Link>

                    <Link
                      href="/history"
                      className="header__user-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FontAwesomeIcon icon={faClock} />
                      <span>{t("header.searchHistory")}</span>
                    </Link>

                    <div className="header__user-divider"></div>

                    <button
                      className="header__user-item header__user-item--logout"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>{t("common.logout")}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="header__auth-buttons">
              <Link
                href="/login"
                className="header__button header__button--login"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span>{t("common.login")}</span>
              </Link>
              <Link
                href="/register"
                className="header__button header__button--register"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                <span>{t("common.register")}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="header__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="header__mobile-menu">
          {isAuthenticated ? (
            <>
              <div className="header__mobile-user">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="header__mobile-avatar"
                  />
                ) : (
                  <div className="header__mobile-avatar header__mobile-avatar--default">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="header__mobile-name">{user?.fullName}</span>
              </div>

              {isModerator && (
                <Link
                  href="/admin"
                  className="header__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("header.admin")}
                </Link>
              )}

              <Link
                href="/profile"
                className="header__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("header.profile")}
              </Link>

              <Link
                href="/contributions"
                className="header__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("header.myContributions")}
              </Link>

              <Link
                href="/favorites"
                className="header__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("header.myFavorites")}
              </Link>

              <Link
                href="/history"
                className="header__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("header.searchHistory")}
              </Link>

              <button
                className="header__mobile-link header__mobile-link--logout"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                {t("common.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="header__mobile-button"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("common.login")}
              </Link>
              <Link
                href="/register"
                className="header__mobile-button header__mobile-button--primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("common.register")}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
