"use client";

import { Footer } from "./Footer";
import Header from "./Header";
import EmailVerificationBanner from "@/components/common/EmailVerificationBanner";
import "./Layout.scss";
import { useAuth } from "@/hooks";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  return (
    <div className="layout">
      <Header />
      {!user && <EmailVerificationBanner />}
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
