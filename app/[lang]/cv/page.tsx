import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CvDocument from "@/components/cv-document";
import { getDictionary, hasLocale, type Locale } from "@/app/[lang]/dictionaries";
import {
  OG_IMAGE,
  OG_LOCALE,
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

  return (
    <main className="flex w-full flex-1 flex-col bg-background text-foreground">
      <CvDocument />
    </main>
  );
};

export default CvPage;
