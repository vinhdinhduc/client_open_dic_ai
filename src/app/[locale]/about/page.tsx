import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Layout } from "@/components/layouts";
import AboutForms from "./AboutForms";
import "./About.scss";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });

  return (
    <Layout>
      <section className="about-page">
        <div className="about-page__container">
          <header className="about-page__header">
            <h1 className="about-page__title">{t("title")}</h1>
            <p className="about-page__subtitle">{t("subtitle")}</p>
          </header>

          <div className="about-page__grid">
            <article className="about-card">
              <h2 className="about-card__title">{t("missionTitle")}</h2>
              <p className="about-card__text">{t("missionText")}</p>
            </article>

            <article className="about-card">
              <h2 className="about-card__title">{t("visionTitle")}</h2>
              <p className="about-card__text">{t("visionText")}</p>
            </article>
          </div>

          <article className="about-card about-card--full">
            <h2 className="about-card__title">{t("featuresTitle")}</h2>
            <ul className="about-card__list">
              <li>{t("feature1")}</li>
              <li>{t("feature2")}</li>
              <li>{t("feature3")}</li>
              <li>{t("feature4")}</li>
            </ul>
          </article>

          <article className="about-card about-card--full">
            <h2 className="about-card__title">{t("communityTitle")}</h2>
            <p className="about-card__text">{t("communityText")}</p>
          </article>

          <article className="about-card about-card--full">
            <h2 className="about-card__title">{t("contactTitle")}</h2>
            <p className="about-card__text">{t("contactText")}</p>
            <p className="about-card__contact">opendict@utb.edu.vn</p>
          </article>

          <AboutForms />
        </div>
      </section>
    </Layout>
  );
}
