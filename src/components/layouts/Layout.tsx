"use client";

import { Footer } from "./Footer";
import Header from "./Header";
import EmailVerificationBanner from "@/components/common/EmailVerificationBanner";
import { FloatingChatButton } from "@/components/common";
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

  return (
    <div className={`layout${className ? ` ${className}` : ""}`}>
      <Header />
      {!user && <EmailVerificationBanner />}
      <main className="layout__main">{children}</main>
      <Footer />
      <FloatingChatButton />
      <div className="faq-floating-wrapper">
        <Link href="/faq" className="faq-floating-btn" aria-label="FAQ">
          <HelpCircle size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Layout;
