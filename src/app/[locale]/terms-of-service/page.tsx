import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import "./TermsOfService.scss";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "tos" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function TermsOfServicePage() {
  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <TermsOfServiceClient />
      </div>
    </div>
  );
}

function TermsOfServiceClient() {
  const t = useTranslations("tos");

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

        {/* Acceptance of Terms */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("acceptanceTitle")}</h2>
          <p className="legal-section__text">{t("acceptanceText")}</p>
        </section>

        {/* User Accounts */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("accountsTitle")}</h2>
          <p className="legal-section__text">{t("accountsText")}</p>
          <ul className="legal-section__list">
            <li>{t("accountsItem1")}</li>
            <li>{t("accountsItem2")}</li>
            <li>{t("accountsItem3")}</li>
            <li>{t("accountsItem4")}</li>
          </ul>
        </section>

        {/* User Content */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("contentTitle")}</h2>
          <p className="legal-section__text">{t("contentText")}</p>
          <ul className="legal-section__list">
            <li>{t("contentItem1")}</li>
            <li>{t("contentItem2")}</li>
            <li>{t("contentItem3")}</li>
            <li>{t("contentItem4")}</li>
          </ul>
        </section>

        {/* Prohibited Activities */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("prohibitedTitle")}</h2>
          <p className="legal-section__text">{t("prohibitedText")}</p>
          <ul className="legal-section__list">
            <li>{t("prohibitedItem1")}</li>
            <li>{t("prohibitedItem2")}</li>
            <li>{t("prohibitedItem3")}</li>
            <li>{t("prohibitedItem4")}</li>
            <li>{t("prohibitedItem5")}</li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("ipTitle")}</h2>
          <p className="legal-section__text">{t("ipText")}</p>
        </section>

        {/* Disclaimer */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("disclaimerTitle")}</h2>
          <p className="legal-section__text">{t("disclaimerText")}</p>
        </section>

        {/* Limitation of Liability */}
        <section className="legal-section">
          <h2 className="legal-section__title">{t("liabilityTitle")}</h2>
          <p className="legal-section__text">{t("liabilityText")}</p>
        </section>

        {/* Changes to Terms */}
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
