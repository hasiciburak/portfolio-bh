import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { INTRO_BOOT_SCRIPT } from "@/lib/entrance-intro";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/site-metadata";
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

/*
 * Base layer only. Everything locale-dependent — title, description, canonical,
 * hreflang, Open Graph — is set by `app/[lang]/layout.tsx`, which is the first
 * segment that knows which language it is rendering. What lives here is what is
 * true for every route: the origin relative metadata URLs resolve against, and
 * the crawler directives.
 */
/*
 * Search Console's meta-tag verification, supplied as an environment variable so
 * the token can be pasted into Vercel without a commit — and so a preview
 * deployment does not claim to be the verified property. Omitted entirely when
 * unset: an empty `content` attribute fails verification rather than skipping it.
 */
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: SITE_TAB_TITLE,
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
  description:
    "Software developer and UI/UX designer based in Istanbul, Turkey.",
  authors: [{ name: SITE_NAME, url: SITE_ORIGIN }],
  creator: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use the full OG image in results instead of a thumbnail, and
      // stop it truncating the description to its default snippet length.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
