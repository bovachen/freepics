import { useTranslations } from "next-intl";
import { getImages } from "@/lib/data/images";
import HomeGallery from "@/components/HomeGallery";
import "./home.css";

export default async function HomePage() {
  // 从 Supabase 获取图片数据（服务端）
  const images = await getImages({ limit: 100 });

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* 客户端交互组件 */}
      <HomeGallery images={images} />
    </div>
  );
}

function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="container hero-content">
        <h1 className="hero-title">{t("hero")}</h1>
        <p className="hero-subtitle">{t("heroSub")}</p>
      </div>
    </section>
  );
}
