"use client";

import { useLocale, useTranslations } from "next-intl";
import "./TipModal.css";

interface TipModalProps {
  onClose: () => void;
}

export default function TipModal({ onClose }: TipModalProps) {
  const t = useTranslations("image");
  const locale = useLocale();

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

          <div className="tip-bmc-widget">
            <a href="https://www.buymeacoffee.com/yffs" target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                style={{ height: "60px", width: "217px" }}
              />
            </a>
          </div>
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
