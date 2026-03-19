"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import "./TipModal.css";

interface TipModalProps {
  onClose: () => void;
}

export default function TipModal({ onClose }: TipModalProps) {
  const t = useTranslations("image");
  const locale = useLocale();
  const bmcRef = useRef<HTMLDivElement>(null);

  // 英文版：加载 Buy Me a Coffee 小部件
  useEffect(() => {
    if (locale !== "en" || !bmcRef.current) return;

    const script = document.createElement("script");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "yffs");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-emoji", "☕");
    script.setAttribute("data-font", "Cookie");
    script.setAttribute("data-text", "Buy me a coffee");
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#ffffff");
    bmcRef.current.appendChild(script);

    return () => {
      // 清理
      if (bmcRef.current) {
        bmcRef.current.innerHTML = "";
      }
    };
  }, [locale]);

  if (locale === "en") {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content tip-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>

          <div className="tip-header">
            <span className="tip-emoji">☕</span>
            <h3 className="tip-title">{t("tipTitle")}</h3>
            <p className="tip-desc">{t("tipDesc")}</p>
          </div>

          <div className="tip-bmc-widget" ref={bmcRef} />
        </div>
      </div>
    );
  }

  // 中文版：微信二维码
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tip-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="tip-header">
          <span className="tip-emoji">☕</span>
          <h3 className="tip-title">{t("tipTitle")}</h3>
          <p className="tip-desc">{t("tipDesc")}</p>
        </div>

        <div className="tip-qr-placeholder">
          <div className="qr-code-box">
            <span className="qr-placeholder-text">微信收款码</span>
            <p className="qr-note">请将您的微信收款二维码<br/>替换此占位图</p>
          </div>
        </div>

        <p className="tip-note">微信扫码打赏</p>
      </div>
    </div>
  );
}
