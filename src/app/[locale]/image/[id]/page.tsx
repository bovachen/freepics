"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getImageById, mockImages } from "@/data/mock";
import { useAuth } from "@/components/AuthContext";
import TipModal from "@/components/TipModal";
import AuthModal from "@/components/AuthModal";
import ImageCard from "@/components/ImageCard";
import "./detail.css";

type Orientation = "landscape" | "portrait";

export default function ImageDetailPage() {
  const t = useTranslations("image");
  const locale = useLocale() as "zh" | "en";
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [paramsOpen, setParamsOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const image = getImageById(params.id as string);

  if (!image) {
    return (
      <div className="detail-page" style={{ paddingTop: "calc(var(--header-height) + 4rem)", textAlign: "center" }}>
        <h1>404 - Image Not Found</h1>
      </div>
    );
  }

  const title = locale === "zh" ? image.title_zh : image.title_en;
  const description = locale === "zh" ? image.description_zh : image.description_en;
  const altText = locale === "zh" ? image.alt_text_zh : image.alt_text_en;
  const prompt = locale === "zh" ? image.prompt_zh : image.prompt_en;
  const tags = locale === "zh" ? image.tags_zh : image.tags_en;

  // Current orientation dimensions
  const curWidth = orientation === "landscape" ? image.width : image.width_portrait;
  const curHeight = orientation === "landscape" ? image.height : image.height_portrait;
  const curThumbnail = orientation === "landscape" ? image.thumbnail : image.thumbnail_portrait;

  // Similar images
  const similarImages = mockImages
    .filter((img) => img.id !== image.id && img.style === image.style)
    .slice(0, 4);

  // Handle 4K download (requires login)
  const handle4KDownload = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const key = orientation === "landscape" ? image.r2_4k_key : image.r2_4k_portrait_key;
    const filename = `freepics-${image.id}-${orientation}-4k.png`;
    // In production: generate signed R2 URL; in mock mode: download thumbnail
    const url = key.startsWith("http") ? key : image.thumbnail;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  // Handle AVIF download (no login required)
  const handleAVIFDownload = () => {
    const key = orientation === "landscape" ? image.r2_avif_key : image.r2_avif_portrait_key;
    const filename = `freepics-${image.id}-${orientation}.avif`;
    // In production: generate signed R2 URL; in mock mode: download thumbnail
    const url = key.startsWith("http") ? key : image.thumbnail;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="detail-page">
      {/* Orientation Toggle + Hero Image */}
      <section className="detail-hero">
        <div className="orientation-toggle">
          <button
            className={`orient-btn ${orientation === "landscape" ? "active" : ""}`}
            onClick={() => setOrientation("landscape")}
            title={locale === "zh" ? "横版 16:9" : "Landscape 16:9"}
          >
            <span className="orient-icon orient-landscape">▬</span>
            <span>16:9</span>
          </button>
          <button
            className={`orient-btn ${orientation === "portrait" ? "active" : ""}`}
            onClick={() => setOrientation("portrait")}
            title={locale === "zh" ? "竖版 9:16" : "Portrait 9:16"}
          >
            <span className="orient-icon orient-portrait">▮</span>
            <span>9:16</span>
          </button>
        </div>

        <Image
          src={curThumbnail}
          alt={altText}
          width={orientation === "landscape" ? 1200 : 675}
          height={orientation === "landscape" ? 675 : 1200}
          className={`detail-hero-img ${orientation}`}
          priority
        />
      </section>

      <div className="detail-body container">
        {/* Title & Description */}
        <header className="detail-header">
          <div className="detail-meta-row">
            <span className={`style-badge-lg ${image.style}`}>
              {image.style === "realistic" ? t("realistic") : t("anime")}
            </span>
            {image.is_holiday && (
              <span className="holiday-badge">🎉 {image.holiday_name}</span>
            )}
            <span className="detail-date">{t("createdAt")}: {image.created_at}</span>
          </div>
          <h1 className="detail-title">{title}</h1>
          <p className="detail-description">{description}</p>
        </header>

        {/* Stats */}
        <div className="detail-stats">
          <div className="stat-item">
            <span className="stat-number">{image.likes_count + (liked ? 1 : 0)}</span>
            <span className="stat-label">{t("likes")}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{image.views_count}</span>
            <span className="stat-label">{t("views")}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{image.downloads_4k + image.downloads_avif}</span>
            <span className="stat-label">{t("downloads")}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="detail-actions">
          <button
            className={`btn btn-like ${liked ? "active" : ""}`}
            onClick={() => setLiked(!liked)}
          >
            {liked ? "❤️" : "🤍"} {liked ? t("liked") : t("likes")}
          </button>
          <button
            className={`btn btn-favorite ${favorited ? "active" : ""}`}
            onClick={() => setFavorited(!favorited)}
          >
            {favorited ? "⭐" : "☆"} {favorited ? t("favorited") : t("favorite")}
          </button>
          <button className="btn btn-download btn-download-4k" onClick={handle4KDownload}>
            🔒 {t("download4K")} ({orientation === "landscape" ? "16:9" : "9:16"})
          </button>
          <button className="btn btn-download btn-download-avif" onClick={handleAVIFDownload}>
            ⚡ {t("downloadAVIF")} ({orientation === "landscape" ? "16:9" : "9:16"})
          </button>
          {locale === "zh" ? (
            <button className="btn btn-tip" onClick={() => setTipModalOpen(true)}>
              ☕ {t("tip")}
            </button>
          ) : (
            <a
              href="https://www.buymeacoffee.com/yffs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bmc-inline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                className="bmc-btn-img"
              />
            </a>
          )}
        </div>

        {/* Download Info */}
        <div className="download-info">
          <p className="download-hint">
            {locale === "zh"
              ? `🔒 4K 原图 (${curWidth}×${curHeight} PNG) 需要登录后下载 · ⚡ AVIF 推荐版本可直接下载`
              : `🔒 4K Original (${curWidth}×${curHeight} PNG) requires login · ⚡ AVIF version is free to download`}
          </p>
        </div>

        {/* Parameters Panel */}
        <div className="params-section">
          <button
            className="params-toggle"
            onClick={() => setParamsOpen(!paramsOpen)}
          >
            <span>⚙️ {t("params")}</span>
            <span className={`toggle-arrow ${paramsOpen ? "open" : ""}`}>▾</span>
          </button>

          {paramsOpen && (
            <div className="params-panel animate-fade-in">
              <div className="params-grid">
                <div className="param-item">
                  <span className="param-label">{t("prompt")}</span>
                  <p className="param-value param-prompt">{prompt}</p>
                </div>
                <div className="param-item">
                  <span className="param-label">{t("negativePrompt")}</span>
                  <p className="param-value param-prompt">{image.negative_prompt}</p>
                </div>
                <div className="param-row">
                  <div className="param-item">
                    <span className="param-label">{t("model")}</span>
                    <span className="param-value">{image.model}</span>
                  </div>
                  {image.lora_name && (
                    <div className="param-item">
                      <span className="param-label">{t("lora")}</span>
                      <span className="param-value">{image.lora_name}</span>
                    </div>
                  )}
                  <div className="param-item">
                    <span className="param-label">{t("sampler")}</span>
                    <span className="param-value">{image.sampler}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">{t("steps")}</span>
                    <span className="param-value">{image.steps}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">{t("cfgScale")}</span>
                    <span className="param-value">{image.cfg_scale}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">{t("seed")}</span>
                    <span className="param-value param-mono">{image.seed}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">{t("resolution")}</span>
                    <span className="param-value">
                      {orientation === "landscape"
                        ? `${image.width} × ${image.height}`
                        : `${image.width_portrait} × ${image.height_portrait}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="detail-tags">
          <h3 className="section-label">{t("tags")}</h3>
          <div className="tags-list">
            {tags.map((tag) => (
              <a
                key={tag}
                className="tag"
                href={`/${locale}/tag/${encodeURIComponent(tag)}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/${locale}/tag/${encodeURIComponent(tag)}`);
                }}
              >
                #{tag}
              </a>
            ))}
          </div>
        </div>

        {/* Similar Images */}
        {similarImages.length > 0 && (
          <section className="similar-section">
            <h3 className="section-label">{t("similar")}</h3>
            <div className="similar-grid">
              {similarImages.map((img, i) => (
                <ImageCard key={img.id} image={img} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {tipModalOpen && <TipModal onClose={() => setTipModalOpen(false)} />}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
