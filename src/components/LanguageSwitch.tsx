"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import "./LanguageSwitch.css";

export default function LanguageSwitch() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    // Replace current locale prefix in pathname
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button className="language-switch" onClick={switchLocale} aria-label="Switch language">
      <span className="lang-icon">🌐</span>
      <span className="lang-text">{t("language")}</span>
    </button>
  );
}
