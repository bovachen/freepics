"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ImageData } from "@/data/mock";
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

  return (
    <article
      className="image-card card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => router.push(`/${locale}/image/${image.id}`)}
    >
      <div className="image-card-media">
        <Image
          src={image.thumbnail}
          alt={locale === "zh" ? image.alt_text_zh : image.alt_text_en}
          width={400}
          height={Math.round(400 / image.aspect_ratio)}
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
