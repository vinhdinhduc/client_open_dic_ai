import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Layout } from "@/components/layouts";
import FAQAccordion from "./FAQAccordion";
import "./FAQ.scss";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return (
    <Layout>
      <section className="faq-page">
        <div className="faq-page__container">
          <header className="faq-page__header">
            <h1 className="faq-page__title">{t("title")}</h1>
            <p className="faq-page__subtitle">{t("subtitle")}</p>
          </header>

          <FAQAccordion />
        </div>
      </section>
    </Layout>
  );
}
