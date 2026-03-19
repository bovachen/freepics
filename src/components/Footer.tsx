"use client";

import { useTranslations, useLocale } from "next-intl";
import "./Footer.css";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">FreePics</span>
          </div>
          <p className="footer-powered">{t("poweredBy")}</p>
        </div>

        <div className="footer-links">
          <a href={`/${locale}/about`} className="footer-link">{t("about")}</a>
          <a href="mailto:bovachen@gmail.com" className="footer-link">{t("contact")}</a>
        </div>

        <p className="footer-copyright">{t("copyright")}</p>
      </div>
    </footer>
  );
}

