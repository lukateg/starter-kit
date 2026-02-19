"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { CookieConsentWrapper } from "@/components/cookie-consent-wrapper";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieConsentWrapper />
    </>
  );
}
