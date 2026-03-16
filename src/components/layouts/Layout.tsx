"use client";

import { Footer } from "./Footer";
import Header from "./Header";
import EmailVerificationBanner from "@/components/common/EmailVerificationBanner";
import "./Layout.scss";
import { useAuth } from "@/hooks";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout = ({ children, className }: LayoutProps) => {
  const { user } = useAuth();
  const [messageIndex, setMessageIndex] = useState(0);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const t = useTranslations("layout");
  const FAQ_MESSAGES = [
    t("faqPrompt1"),
    t("faqPrompt2"),
    t("faqPrompt3"),
    t("faqPrompt4"),
    t("faqPrompt5"),
  ];
  useEffect(() => {
    // Show bubble after 3 seconds
    const showTimer = setTimeout(() => setBubbleVisible(true), 3000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!bubbleVisible) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % FAQ_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [bubbleVisible]);

  return (
    <div className={`layout${className ? ` ${className}` : ""}`}>
      <Header />
      {!user && <EmailVerificationBanner />}
      <main className="layout__main">{children}</main>
      <Footer />
      <div className="faq-floating-wrapper">
        {bubbleVisible && (
          <div className="faq-bubble" key={messageIndex}>
            {FAQ_MESSAGES[messageIndex]}
          </div>
        )}
        <Link href="/faq" className="faq-floating-btn" aria-label="FAQ">
          <HelpCircle size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Layout;
