"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import type { ImageData } from "@/lib/database.types";
import "./ImageCard.css";

interface ImageCardProps {
  image: ImageData;
  index?: number;
}

export default function ImageCard({ image, index = 0 }: ImageCardProps) {
  const locale = useLocale() as "zh" | "en";
  const router = useRouter();
  const title = locale === "zh" ? image.title_zh : image.title_en;
  const tags = locale === "zh" ? image.tags_zh : image.tags_en;

  // 根据 index 确定性地决定横竖版（交替展示，形成错落效果）
  // 用 id 的 hash 来决定，这样同一张图总是同一个方向
  const isPortrait = useMemo(() => {
    const hash = image.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return hash % 3 === 0; // 约 1/3 的卡片显示竖版
  }, [image.id]);

  const thumbnail = isPortrait ? image.thumbnail_portrait : image.thumbnail;
  const aspectRatio = isPortrait ? 9 / 16 : image.aspect_ratio;

  return (
    <article
      className={`image-card card ${isPortrait ? "portrait" : "landscape"}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => router.push(`/${locale}/image/${image.id}`)}
    >
      <div className="image-card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={locale === "zh" ? image.alt_text_zh : image.alt_text_en}
          className="image-card-img"
          loading="lazy"
        />
        <div className="image-card-overlay">
          <div className="image-card-stats">
            <span className="stat">❤️ {image.likes_count}</span>
            <span className="stat">👁 {image.views_count}</span>
          </div>
          <span className={`style-badge ${image.style}`}>
            {image.style === "realistic" ? (locale === "zh" ? "写实" : "Realistic") : (locale === "zh" ? "动漫" : "Anime")}
          </span>
        </div>
      </div>
      <div className="image-card-info">
        <h3 className="image-card-title">{title}</h3>
        <div className="image-card-tags">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
