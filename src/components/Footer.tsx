"use client";

import { useTranslations } from "next-intl";
import "./Footer.css";

export default function Footer() {
  const t = useTranslations("footer");

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
          <a href="#" className="footer-link">{t("about")}</a>
          <a href="#" className="footer-link">{t("privacy")}</a>
          <a href="#" className="footer-link">{t("contact")}</a>
        </div>

        <p className="footer-copyright">{t("copyright")}</p>
      </div>
    </footer>
  );
}
