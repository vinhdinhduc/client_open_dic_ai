"use client";

import { Footer } from "./Footer";
import Header from "./Header";
import "./Layout.scss";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
