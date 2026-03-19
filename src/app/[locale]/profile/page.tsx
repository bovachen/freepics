"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { mockImages } from "@/data/mock";
import "./profile.css";

type Tab = "likes" | "favorites" | "downloads";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const locale = useLocale() as "zh" | "en";
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("likes");
  const [isLoggedIn] = useState(false); // Mock

  if (!isLoggedIn) {
    return (
      <div className="profile-page">
        <div className="container profile-login-prompt">
          <span className="login-icon">🔒</span>
          <h2>{t("loginRequired")}</h2>
          <button className="btn btn-primary" onClick={() => {}}>
            {t("loginButton")}
          </button>
        </div>
      </div>
    );
  }

  // Mock data for logged-in view
  const likedImages = mockImages.slice(0, 4);
  const favoritedImages = mockImages.slice(2, 5);
  const downloadedImages = mockImages.slice(0, 3);

  const tabImages = {
    likes: likedImages,
    favorites: favoritedImages,
    downloads: downloadedImages,
  };

  const currentImages = tabImages[activeTab];

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title">{t("title")}</h1>

        <div className="profile-tabs">
          {(["likes", "favorites", "downloads"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "likes" && "❤️ "}
              {tab === "favorites" && "⭐ "}
              {tab === "downloads" && "📥 "}
              {t(`my${tab.charAt(0).toUpperCase() + tab.slice(1)}` as "myLikes" | "myFavorites" | "myDownloads")}
            </button>
          ))}
        </div>

        {currentImages.length === 0 ? (
          <div className="profile-empty">
            <p>{t("empty")}</p>
          </div>
        ) : (
          <div className="profile-grid">
            {currentImages.map((image) => {
              const title = locale === "zh" ? image.title_zh : image.title_en;
              return (
                <article
                  key={image.id}
                  className="profile-card card"
                  onClick={() => router.push(`/${locale}/image/${image.id}`)}
                >
                  <Image
                    src={image.thumbnail}
                    alt={locale === "zh" ? image.alt_text_zh : image.alt_text_en}
                    width={300}
                    height={Math.round(300 / image.aspect_ratio)}
                    className="profile-card-img"
                  />
                  <div className="profile-card-info">
                    <h3>{title}</h3>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
