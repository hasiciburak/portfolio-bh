import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { INTRO_BOOT_SCRIPT } from "@/lib/entrance-intro";
import { SITE_TAB_TITLE } from "@/lib/site-tab-title";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Wordmark (#HSC): HK Grotesk Wide Black — licensed font bundled under fonts/. */
const brandWordmark = localFont({
  src: "../public/fonts/hkgroteskwide-black.otf",
  variable: "--font-brand-wordmark",
  weight: "900",
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_TAB_TITLE,
  description:
    "Software developer and UI/UX designer based in Istanbul, Turkey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${brandWordmark.variable} h-full antialiased`}
    >
      <head>
        {/*
          Render-blocking on purpose, and deliberately not next/script: it has to
          resolve the intro mode before the body paints, which even
          `beforeInteractive` does not guarantee. Same shape as the next-themes
          anti-flash script.
        */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
