import { Metadata } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Layout } from "@/components/layouts";
import SearchBar from "@/components/search/SearchBar";
import { BookOpen, Users, Globe, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "OpenDict - Tra cứu thuật ngữ Việt Lào Anh",
  description:
    "Tra cứu thuật ngữ nhanh chóng, chính xác với hỗ trợ đa ngôn ngữ Việt - Lào - Anh. Cộng đồng đóng góp thuật ngữ mở.",
};

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <Layout className="layout--home">
      <div className="hero">
        <div className="hero__content">
          <h1 className="hero__title">{t("title")}</h1>
          <p className="hero__subtitle">{t("subtitle")}</p>
          <p className="hero__description">{t("description")}</p>
        </div>
        <div className="hero__search">
          <SearchBar autoFocus={true} />
        </div>
        <div className="hero__features">
          <div className="hero__feature">
            <div className="hero__feature-icon">
              <Globe size={24} />
            </div>
            <h3 className="hero__feature-title">{t("feature1Title")}</h3>
            <p className="hero__feature-desc">{t("feature1Desc")}</p>
          </div>
          <div className="hero__feature">
            <div className="hero__feature-icon">
              <Users size={24} />
            </div>
            <h3 className="hero__feature-title">{t("feature2Title")}</h3>
            <p className="hero__feature-desc">{t("feature2Desc")}</p>
          </div>
          <div className="hero__feature">
            <div className="hero__feature-icon">
              <Sparkles size={24} />
            </div>
            <h3 className="hero__feature-title">{t("feature3Title")}</h3>
            <p className="hero__feature-desc">{t("feature3Desc")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
