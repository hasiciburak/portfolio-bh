import type { Metadata } from "next";

import { EntranceIntro } from "@/components/entrance-intro";
import { TabAwayTitle } from "@/components/tab-away-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavigation } from "@/components/site-navigation";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { getDictionary, Locale, hasLocale } from "./dictionaries";
import { LanguageProvider } from "@/components/language-provider";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { CV_EDUCATION } from "@/lib/cv";
import { SKILLSET_ROWS } from "@/lib/skillset-data";
import {
  OG_IMAGE,
  OG_LOCALE,
  PERSON_ID,
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_ORIGIN,
  WEBSITE_ID,
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
    /*
     * The home page's title is the single strongest on-page answer to someone
     * typing the name into a search box, and "Portfolio" answers nothing: it is
     * the one word every competing result also carries. The role is what a
     * recruiter pairs the name with, and it is what distinguishes this result from
     * the LinkedIn profile sitting above it.
     *
     * `template` gives every nested page the name as a suffix without each one
     * repeating it.
     */
    title: { default: dict.meta.title, template: `%s — ${SITE_NAME}` },
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
   *
   * One `@graph` rather than two loose scripts: the WebSite node names the Person
   * as its publisher by id, which is what lets Google treat the site and the
   * person behind it as one entity instead of two unrelated things that happen to
   * share a name.
   *
   * `sameAs` only works in both directions. The profiles listed here have to link
   * back to this domain — LinkedIn's website field, the Instagram bio, the GitHub
   * profile — or this is one unanswered claim against three well-established
   * profiles that Google already trusts.
   */
  const personJsonLd = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: localeUrl(lang as Locale),
    mainEntityOfPage: localeUrl(lang as Locale),
    image: `${SITE_ORIGIN}/images/hero-portrait.png`,
    jobTitle: dict.meta.job_title,
    description: dict.meta.description,
    email: "burakhasici@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Istanbul",
      addressCountry: "TR",
    },
    // Read from the CV rather than restated, so a degree can never be right in one
    // place and stale in the other.
    alumniOf: CV_EDUCATION.map(({ school }) => ({
      "@type": "CollegeOrUniversity",
      name: school,
    })),
    /*
     * The topics the site is actually about, and the ones a name search is likely
     * to be paired with ("burak haşıcı react"). Deliberately a subset of the
     * skillset rather than all forty entries: a list that claims everything
     * describes nothing.
     */
    knowsAbout: SKILLSET_ROWS.filter(({ id }) =>
      ["ai", "frontend", "languages"].includes(id),
    ).flatMap(({ skills }) => skills.map(({ name }) => name)),
    knowsLanguage: ["tr", "en", "de"],
    sameAs: SITE_SOCIAL_LINKS.filter(
      ({ id }) => id !== "email" && id !== "whatsapp",
    ).map(({ href }) => href),
  };

  /*
   * What Google reads to decide the name it prints above the URL in a result. Left
   * out, it guesses from the domain — which is how a personal site ends up
   * labelled "burakhasici.com" while LinkedIn's entry beside it carries a name.
   */
  const webSiteJsonLd = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: localeUrl(lang as Locale),
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    inLanguage: lang,
    publisher: { "@id": PERSON_ID },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [personJsonLd, webSiteJsonLd],
  };

  return (
    <LanguageProvider lang={lang as Locale} dict={dict}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
