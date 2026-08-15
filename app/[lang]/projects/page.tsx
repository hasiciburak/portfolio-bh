import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectsSection from "@/components/projects-section";
import { getDictionary, hasLocale, type Locale } from "@/app/[lang]/dictionaries";
import { getProjectListItems } from "@/lib/project-content";
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
  const url = localeUrl(locale, "/projects");

  return {
    title: dict.projects.title,
    description: dict.projects.subtitle,
    alternates: {
      canonical: url,
      languages: languageAlternates("/projects"),
    },
    // Set in full rather than inherited: a child that defines `openGraph` replaces
    // the parent's block wholesale, so anything omitted here is simply dropped.
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${dict.projects.title} — ${SITE_NAME}`,
      description: dict.projects.subtitle,
      locale: OG_LOCALE[locale],
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.projects.title} — ${SITE_NAME}`,
      description: dict.projects.subtitle,
      images: [OG_IMAGE],
    },
  };
};

const ProjectsPage = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}) => {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const projects = await getProjectListItems(lang as Locale);

  return (
    <main className="flex w-full flex-1 flex-col bg-background text-foreground">
      <ProjectsSection projects={projects} />
    </main>
  );
};

export default ProjectsPage;
