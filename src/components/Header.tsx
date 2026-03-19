"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitch from "./LanguageSwitch";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthContext";
import "./Header.css";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  const navItems = [
    { key: "home", href: `/${locale}` },
    { key: "search", href: `/${locale}/search` },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === `/${locale}`;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="header">
        <div className="header-inner container">
          <a href={`/${locale}`} className="header-logo" onClick={(e) => { e.preventDefault(); router.push(`/${locale}`); }}>
            <span className="logo-icon">✦</span>
            <span className="logo-text">FreePics</span>
          </a>

          <nav className={`header-nav ${mobileMenuOpen ? "open" : ""}`}>
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  setMobileMenuOpen(false);
                }}
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <LanguageSwitch />

            {isLoggedIn ? (
              <div className="user-menu">
                <button
                  className="btn btn-ghost nav-profile-btn"
                  onClick={() => router.push(`/${locale}/profile`)}
                >
                  <span className="profile-avatar">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </button>
                <button className="btn btn-ghost btn-logout" onClick={signOut}>
                  ✕
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-login"
                onClick={() => setAuthModalOpen(true)}
              >
                {t("login")}
              </button>
            )}

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${mobileMenuOpen ? "open" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </>
  );
}
