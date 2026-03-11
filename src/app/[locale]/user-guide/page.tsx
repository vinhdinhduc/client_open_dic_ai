import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Layout } from "@/components/layouts";
import { Search, PenLine, Sparkles, Heart, UserCog } from "lucide-react";
import "./UserGuide.scss";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userGuide" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function UserGuidePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userGuide" });

  const guides = [
    { icon: Search, titleKey: "searchTitle", descKey: "searchDesc" },
    { icon: PenLine, titleKey: "contributeTitle", descKey: "contributeDesc" },
    { icon: Sparkles, titleKey: "aiTitle", descKey: "aiDesc" },
    { icon: Heart, titleKey: "favoriteTitle", descKey: "favoriteDesc" },
    { icon: UserCog, titleKey: "accountTitle", descKey: "accountDesc" },
  ];

  return (
    <Layout>
      <section className="guide-page">
        <div className="guide-page__container">
          <header className="guide-page__header">
            <h1 className="guide-page__title">{t("title")}</h1>
            <p className="guide-page__subtitle">{t("subtitle")}</p>
          </header>

          <div className="guide-page__list">
            {guides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <article key={index} className="guide-card">
                  <div className="guide-card__icon">
                    <Icon size={28} />
                  </div>
                  <div className="guide-card__content">
                    <h2 className="guide-card__title">{t(guide.titleKey)}</h2>
                    <p className="guide-card__desc">{t(guide.descKey)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
