import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TabAwayTitle } from "@/components/tab-away-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/site-navigation";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { ThemeProvider } from "@/components/theme-provider";
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

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${brandWordmark.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <TabAwayTitle />
          <SiteNavigation />
          <SmoothScrollProvider>
            {children}
            <SiteFooter />
          </SmoothScrollProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;

