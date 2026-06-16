import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fwc = localFont({
  src: [
    { path: "../../public/fonts/FWC2026-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/FWC2026-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-fwc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "2026 World Cup Daily",
  description: "Live scores, standings, and highlights for the FIFA World Cup 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fwc.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <div className="wc-rainbow-stripe h-2 w-full flex-shrink-0" />
        {children}
      </body>
    </html>
  );
}
