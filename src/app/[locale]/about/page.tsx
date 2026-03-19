"use client";

import { useTranslations, useLocale } from "next-intl";
import "./about.css";

export default function AboutPage() {
  const t = useTranslations("about");
  const locale = useLocale();

  return (
    <div className="about-page">
      <div className="container about-container">
        {/* Hero */}
        <header className="about-hero">
          <span className="about-icon">✦</span>
          <h1 className="about-title">{t("title")}</h1>
          <p className="about-subtitle">{t("subtitle")}</p>
        </header>

        {/* Mission */}
        <section className="about-section">
          <div className="about-card">
            <span className="card-icon">🎨</span>
            <h2>{t("missionTitle")}</h2>
            <p>{t("missionBody")}</p>
          </div>
        </section>

        {/* Features */}
        <section className="about-features">
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h3>{t("featureAI")}</h3>
            <p>{t("featureAIDesc")}</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📐</span>
            <h3>{t("featureDual")}</h3>
            <p>{t("featureDualDesc")}</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔓</span>
            <h3>{t("featureFree")}</h3>
            <p>{t("featureFreeDesc")}</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚙️</span>
            <h3>{t("featureParams")}</h3>
            <p>{t("featureParamsDesc")}</p>
          </div>
        </section>

        {/* Support */}
        <section className="about-section about-support">
          <div className="about-card support-card">
            <span className="card-icon">☕</span>
            <h2>{t("supportTitle")}</h2>
            <p>{t("supportBody")}</p>
            {locale === "en" ? (
              <a
                href="https://www.buymeacoffee.com/yffs"
                target="_blank"
                rel="noopener noreferrer"
                className="support-bmc"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                  alt="Buy Me A Coffee"
                  style={{ height: "50px", width: "auto" }}
                />
              </a>
            ) : (
              <p className="support-wechat-hint">{t("supportWechat")}</p>
            )}
          </div>
        </section>

        {/* Contact */}
        <section className="about-section about-contact">
          <h2>{t("contactTitle")}</h2>
          <p>
            {t("contactBody")}{" "}
            <a href="mailto:bovachen@gmail.com" className="contact-email">
              bovachen@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
