import { Metadata } from "next";
import Link from "next/link";
import { Layout } from "@/components/layouts";
import SearchBar from "@/components/search/SearchBar";
import { Users, Globe, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

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
