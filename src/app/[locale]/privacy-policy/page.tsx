import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import "./PrivacyPolicy.scss";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "privacy",
  });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <PrivacyPolicyClient />
      </div>
    </div>
  );
}

function PrivacyPolicyClient() {
  const t = useTranslations("privacy");

  return (
    <>
      <header className="legal-page__header">
        <h1 className="legal-page__title">{t("title")}</h1>
        <p className="legal-page__last-updated">
          {t("lastUpdated")}: {t("updateDate")}
        </p>
      </header>

      <div className="legal-page__content">
        {/* Introduction */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("introTitle")}</h2>
          <p className="legal-section__text">{t("introText")}</p>
        </section>

        {/* Information We Collect */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("collectTitle")}</h2>
          <p className="legal-section__text">{t("collectText")}</p>

          <h3 className="legal-section__subtitle">
            {t("collectPersonalTitle")}
          </h3>
          <ul className="legal-section__list">
            <li>{t("collectPersonalItem1")}</li>
            <li>{t("collectPersonalItem2")}</li>
            <li>{t("collectPersonalItem3")}</li>
          </ul>

          <h3 className="legal-section__subtitle">{t("collectUsageTitle")}</h3>
          <ul className="legal-section__list">
            <li>{t("collectUsageItem1")}</li>
            <li>{t("collectUsageItem2")}</li>
            <li>{t("collectUsageItem3")}</li>
            <li>{t("collectUsageItem4")}</li>
          </ul>
        </section>

        {/* How We Use Information */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("useTitle")}</h2>
          <p className="legal-section__text">{t("useText")}</p>
          <ul className="legal-section__list">
            <li>{t("useItem1")}</li>
            <li>{t("useItem2")}</li>
            <li>{t("useItem3")}</li>
            <li>{t("useItem4")}</li>
            <li>{t("useItem5")}</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("sharingTitle")}</h2>
          <p className="legal-section__text">{t("sharingText")}</p>
          <ul className="legal-section__list">
            <li>{t("sharingItem1")}</li>
            <li>{t("sharingItem2")}</li>
            <li>{t("sharingItem3")}</li>
            <li>{t("sharingItem4")}</li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("securityTitle")}</h2>
          <p className="legal-section__text">{t("securityText")}</p>
        </section>

        {/* Cookies */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("cookiesTitle")}</h2>
          <p className="legal-section__text">{t("cookiesText")}</p>
        </section>

        {/* Your Rights */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("rightsTitle")}</h2>
          <p className="legal-section__text">{t("rightsText")}</p>
          <ul className="legal-section__list">
            <li>{t("rightsItem1")}</li>
            <li>{t("rightsItem2")}</li>
            <li>{t("rightsItem3")}</li>
            <li>{t("rightsItem4")}</li>
            <li>{t("rightsItem5")}</li>
          </ul>
        </section>

        {/* Children's Privacy */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("childrenTitle")}</h2>
          <p className="legal-section__text">{t("childrenText")}</p>
        </section>

        {/* Changes to Policy */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("changesTitle")}</h2>
          <p className="legal-section__text">{t("changesText")}</p>
        </section>

        {/* Contact */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("contactTitle")}</h2>
          <p className="legal-section__text">{t("contactText")}</p>
          <p className="legal-section__text">
            <strong>Email:</strong> opendict@utb.edu.vn
          </p>
        </section>
      </div>
    </>
  );
}
