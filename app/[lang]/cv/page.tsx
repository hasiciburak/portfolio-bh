import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CvDocument from "@/components/cv-document";
import { getDictionary, hasLocale, type Locale } from "@/app/[lang]/dictionaries";
import {
  OG_IMAGE,
  OG_LOCALE,
  PERSON_ID,
  SITE_NAME,
  languageAlternates,
  localeUrl,
} from "@/lib/site-metadata";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> => {
  const { lang } = await params;

  if (!hasLocale(lang)) return {};

  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const url = localeUrl(locale, "/cv");
  const title = `${dict.cv.eyebrow} — ${SITE_NAME}`;

  return {
    title: dict.cv.eyebrow,
    description: dict.cv.meta_description,
    alternates: {
      canonical: url,
      languages: languageAlternates("/cv"),
    },
    // Spelled out rather than inherited, like the projects page: a segment that
    // defines `openGraph` at all replaces the parent's block wholesale.
    openGraph: {
      type: "profile",
      url,
      siteName: SITE_NAME,
      title,
      description: dict.cv.meta_description,
      locale: OG_LOCALE[locale],
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.cv.meta_description,
      images: [OG_IMAGE],
    },
  };
};

const CvPage = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  /*
   * ProfilePage is the type Google documents for "a page about one person", and
   * naming the Person by id rather than describing them again keeps this page
   * pointing at the same entity the site-wide graph already defines. Two Person
   * nodes with the same name and different properties is how a site ends up
   * arguing with itself about who it is about.
   */
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: localeUrl(lang as Locale, "/cv"),
    inLanguage: lang,
    mainEntity: { "@id": PERSON_ID },
  };

  return (
    <main className="flex w-full flex-1 flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <CvDocument />
    </main>
  );
};

export default CvPage;
