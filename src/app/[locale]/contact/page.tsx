import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Layout } from "@/components/layouts";
import ContactForm from "./ContactForm";
import "./Contact.scss";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });

  return (
    <Layout>
      <section className="contact-page">
        <div className="contact-page__container">
          <header className="contact-page__header">
            <h1 className="contact-page__title">{t("title")}</h1>
            <p className="contact-page__subtitle">{t("subtitle")}</p>
          </header>

          <ContactForm />

          <div className="contact-page__email">
            <p>{t("emailContact")}</p>
            <a href={`mailto:${t("emailAddress")}`}>{t("emailAddress")}</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
