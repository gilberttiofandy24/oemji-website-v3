import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import NavBar from "@/components/navbar/NavBar";
import Footer from "@/components/Footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Oemji - Top Up Game Termurah & Tercepat",
    template: "%s | Oemji",
  },
  description:
    "Top up diamond, UC, dan item game favoritmu dengan proses instan dan harga terbaik.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Oemji",
    title: "Oemji - Top Up Game Termurah & Tercepat",
    description:
      "Top up diamond, UC, dan item game favoritmu dengan proses instan dan harga terbaik.",
    images: ["/logo-name.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oemji - Top Up Game Termurah & Tercepat",
    description:
      "Top up diamond, UC, dan item game favoritmu dengan proses instan dan harga terbaik.",
    images: ["/logo-name.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body>
        <div className="flex min-h-screen flex-col bg-background">
          <NavBar />
          <main className="min-h-[80vh]">
            <Providers>{children}</Providers>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
