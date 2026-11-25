import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import Script from "next/script";
import { ShopFooter } from "@/components/layout/shop-footer";
import { ShopHeader } from "@/components/layout/shop-header";
import { ContactAssistant } from "@/features/engagement/contact-assistant";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Toy Shop | Find your next favourite",
  description: "Explore toys, categories and special offers at our local toy shop.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><Script src="/theme-init.js" strategy="beforeInteractive" /></head>
      <body className={nunitoSans.variable}>
        <ShopHeader />
        {children}
        <ShopFooter />
        <ContactAssistant />
      </body>
    </html>
  );
}
