"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Masonry from "react-masonry-css";
import { mockImages, getImagesByStyle } from "@/data/mock";
import ImageCard from "@/components/ImageCard";
import "./home.css";

type SortType = "latest" | "popular" | "downloads" | "random";
type StyleFilter = "all" | "realistic" | "anime";

export default function HomePage() {
  const t = useTranslations("home");
  const tSite = useTranslations("site");
  const locale = useLocale();
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("all");
  const [sortType, setSortType] = useState<SortType>("latest");

  const filteredImages = useMemo(() => {
    let images = getImagesByStyle(styleFilter);

    switch (sortType) {
      case "popular":
        images = [...images].sort((a, b) => b.likes_count - a.likes_count);
        break;
      case "downloads":
        images = [...images].sort(
          (a, b) => b.downloads_4k + b.downloads_avif - (a.downloads_4k + a.downloads_avif)
        );
        break;
      case "random":
        images = [...images].sort(() => Math.random() - 0.5);
        break;
      case "latest":
      default:
        images = [...images].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return images;
  }, [styleFilter, sortType]);

  const breakpointColumns = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1,
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <h1 className="hero-title">{t("hero")}</h1>
          <p className="hero-subtitle">{t("heroSub")}</p>
        </div>
      </section>

      {/* Filter & Sort Bar */}
      <section className="filter-bar container">
        <div className="filter-styles">
          {(["all", "realistic", "anime"] as StyleFilter[]).map((style) => (
            <button
              key={style}
              className={`filter-btn ${styleFilter === style ? "active" : ""}`}
              onClick={() => setStyleFilter(style)}
            >
              {style === "all" ? t("filterAll") : style === "realistic" ? t("filterRealistic") : t("filterAnime")}
            </button>
          ))}
        </div>
        <div className="filter-sorts">
          {(["latest", "popular", "downloads", "random"] as SortType[]).map((sort) => (
            <button
              key={sort}
              className={`sort-btn ${sortType === sort ? "active" : ""}`}
              onClick={() => setSortType(sort)}
            >
              {t(`sort${sort.charAt(0).toUpperCase() + sort.slice(1)}` as "sortLatest" | "sortPopular" | "sortDownloads" | "sortRandom")}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="gallery container">
        <Masonry
          breakpointCols={breakpointColumns}
          className="masonry-grid"
          columnClassName="masonry-column"
        >
          {filteredImages.map((image, index) => (
            <ImageCard key={image.id} image={image} index={index} />
          ))}
        </Masonry>
      </section>
    </div>
  );
}
