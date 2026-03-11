"use client";

import { Footer } from "./Footer";
import Header from "./Header";
import EmailVerificationBanner from "@/components/common/EmailVerificationBanner";
import "./Layout.scss";
import { useAuth } from "@/hooks";
import { HelpCircle } from "lucide-react";
import Link from "next/link";

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
      <Link href="/faq" className="faq-floating-btn" aria-label="FAQ">
        <HelpCircle size={24} />
      </Link>
    </div>
  );
};

export default Layout;
