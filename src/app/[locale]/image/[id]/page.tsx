"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getImageById, mockImages } from "@/data/mock";
import TipModal from "@/components/TipModal";
import ImageCard from "@/components/ImageCard";
import "./detail.css";

export default function ImageDetailPage() {
  const t = useTranslations("image");
  const locale = useLocale() as "zh" | "en";
  const params = useParams();
  const router = useRouter();
  const [paramsOpen, setParamsOpen] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
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

  // Similar images (mock - just pick other images of same style)
  const similarImages = mockImages
    .filter((img) => img.id !== image.id && img.style === image.style)
    .slice(0, 4);

  return (
    <div className="detail-page">
      {/* Hero Image */}
      <section className="detail-hero">
        <Image
          src={image.thumbnail}
          alt={altText}
          width={1200}
          height={Math.round(1200 / image.aspect_ratio)}
          className="detail-hero-img"
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
          <a className="btn btn-download" href={image.thumbnail} download>
            📥 {t("download4K")}
          </a>
          <a className="btn btn-download" href={image.thumbnail} download>
            ⚡ {t("downloadAVIF")}
          </a>
          <button className="btn btn-tip" onClick={() => setTipModalOpen(true)}>
            ☕ {t("tip")}
          </button>
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
                    <span className="param-value">{image.width} × {image.height}</span>
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
    </div>
  );
}
