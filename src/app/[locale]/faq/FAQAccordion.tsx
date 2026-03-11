"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_COUNT = 8;

export default function FAQAccordion() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-list">
      {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((num) => (
        <div
          key={num}
          className={`faq-item ${openIndex === num ? "open" : ""}`}
        >
          <button className="faq-item__question" onClick={() => toggle(num)}>
            <span>{t(`q${num}`)}</span>
            <ChevronDown
              size={20}
              className={`faq-item__arrow ${openIndex === num ? "rotated" : ""}`}
            />
          </button>
          {openIndex === num && (
            <div className="faq-item__answer">
              <p>{t(`a${num}`)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
