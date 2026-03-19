"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Masonry from "react-masonry-css";
import { searchImages, getAllTags, mockImages } from "@/data/mock";
import ImageCard from "@/components/ImageCard";
import "./search.css";

export default function SearchPage() {
  const t = useTranslations("search");
  const tTag = useTranslations("tag");
  const locale = useLocale() as "zh" | "en";
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => getAllTags(locale), [locale]);

  const results = useMemo(() => {
    if (selectedTag) {
      const tagImages = mockImages.filter((img) => {
        const tags = locale === "zh" ? img.tags_zh : img.tags_en;
        return tags.some((t) => t === selectedTag);
      });
      if (!query) return tagImages;
      return tagImages.filter((img) => {
        const title = locale === "zh" ? img.title_zh : img.title_en;
        return title.toLowerCase().includes(query.toLowerCase());
      });
    }
    if (!query) return mockImages;
    return searchImages(query, locale);
  }, [query, selectedTag, locale]);

  const breakpointColumns = { default: 4, 1200: 3, 900: 2, 600: 1 };

  return (
    <div className="search-page">
      <div className="container">
        <h1 className="search-title">{t("title")}</h1>

        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tag Cloud */}
        <div className="search-tags">
          <h3 className="search-tags-title">{tTag("title")}</h3>
          <div className="tags-cloud">
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`tag ${selectedTag === tag ? "active" : ""}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="search-results">
          <p className="results-count">
            {t("results")}: {results.length}
          </p>

          {results.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <p>{t("noResults")}</p>
            </div>
          ) : (
            <Masonry
              breakpointCols={breakpointColumns}
              className="masonry-grid"
              columnClassName="masonry-column"
            >
              {results.map((image, index) => (
                <ImageCard key={image.id} image={image} index={index} />
              ))}
            </Masonry>
          )}
        </div>
      </div>
    </div>
  );
}
