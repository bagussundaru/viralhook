import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ViralHook.id — AI untuk Konten TikTok & Reels Indonesia",
    template: "%s | ViralHook.id",
  },
  description:
    "Generate hook, script video, caption & hashtag TikTok dan Instagram Reels viral dalam hitungan detik. Untuk kreator konten Indonesia.",
  keywords: [
    "hook tiktok",
    "script tiktok",
    "caption instagram",
    "hashtag viral",
    "AI kreator konten Indonesia",
  ],
  openGraph: {
    title: "ViralHook.id",
    description: "AI untuk bikin konten TikTok & Reels viral. Cepat, mudah, Indonesia banget.",
    url: "https://viralhook.id",
    siteName: "ViralHook.id",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
