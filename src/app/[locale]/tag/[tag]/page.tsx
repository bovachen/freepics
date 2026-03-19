"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import Masonry from "react-masonry-css";
import { getImagesByTag } from "@/data/mock";
import ImageCard from "@/components/ImageCard";
import "./tagpage.css";

export default function TagPage() {
  const t = useTranslations("tag");
  const locale = useLocale() as "zh" | "en";
  const params = useParams();
  const tag = decodeURIComponent(params.tag as string);

  const images = useMemo(() => getImagesByTag(tag, locale), [tag, locale]);

  const breakpointColumns = { default: 4, 1200: 3, 900: 2, 600: 1 };

  return (
    <div className="tag-page">
      <div className="container">
        <header className="tag-header">
          <span className="tag-hash">#</span>
          <h1 className="tag-name">{tag}</h1>
          <p className="tag-count">
            {images.length} {t("relatedImages")}
          </p>
        </header>

        {images.length === 0 ? (
          <div className="no-results">
            <p>No images found for this tag</p>
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-column"
          >
            {images.map((image, index) => (
              <ImageCard key={image.id} image={image} index={index} />
            ))}
          </Masonry>
        )}
      </div>
    </div>
  );
}
