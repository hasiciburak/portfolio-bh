import type { Metadata } from "next";

import { EntranceIntro } from "@/components/entrance-intro";
import { TabAwayTitle } from "@/components/tab-away-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/site-navigation";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { getDictionary, Locale, hasLocale } from "./dictionaries";
import { LanguageProvider } from "@/components/language-provider";
import { SITE_TAB_TITLE } from "@/lib/site-tab-title";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import {
  OG_IMAGE,
  OG_LOCALE,
  SITE_NAME,
  SITE_ORIGIN,
  languageAlternates,
  localeUrl,
} from "@/lib/site-metadata";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "tr" }];
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> => {
  const { lang } = await params;

  if (!hasLocale(lang)) return {};

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const url = localeUrl(locale);

  return {
    // `default` keeps the home page's tab title exactly as it was; `template`
    // gives every nested page a suffix without each one repeating the name.
    title: { default: SITE_TAB_TITLE, template: `%s — ${SITE_NAME}` },
    description: dict.meta.description,
    alternates: {
      canonical: url,
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: OG_LOCALE[locale],
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [OG_IMAGE],
    },
  };
};

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) => {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  /*
   * Tells Google this site is a person rather than a company, which is what turns
   * a name search into a knowledge panel with the right links attached. `sameAs`
   * is the identity-reconciliation signal, so it takes profile URLs only — the
   * mailto: and wa.me entries in SITE_SOCIAL_LINKS are contact methods, not
   * profiles, and `email` carries the first of those properly.
   */
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: localeUrl(lang as Locale),
    image: `${SITE_ORIGIN}/images/hero-portrait.png`,
    jobTitle: dict.meta.job_title,
    description: dict.meta.description,
    email: "burakhasici@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Istanbul",
      addressCountry: "TR",
    },
    knowsLanguage: ["en", "tr"],
    sameAs: SITE_SOCIAL_LINKS.filter(
      ({ id }) => id !== "email" && id !== "whatsapp",
    ).map(({ href }) => href),
  };

  return (
    <LanguageProvider lang={lang as Locale} dict={dict}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <TabAwayTitle />
      {/* Sits outside SmoothScrollProvider — ScrollSmoother's transform on
          #smooth-content would otherwise break the overlay's `position: fixed`. */}
      <EntranceIntro />
      <SiteNavigation />
      <SmoothScrollProvider>
        {children}
        <SiteFooter />
      </SmoothScrollProvider>
    </LanguageProvider>
  );
};

export default RootLayout;
