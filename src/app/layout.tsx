import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hifto – Frag die Leute in deiner Nähe",
  description:
    "Hifto ist der Marktplatz für akute Bedürfnisse. Beschreibe, was du brauchst, und finde Menschen in deiner Nähe, die dir helfen können.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 pb-16 font-sans lg:pb-0">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
