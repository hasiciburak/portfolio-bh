import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectsSection, {
  type ProjectListItem,
} from "@/components/projects-section";
import { getDictionary, hasLocale, type Locale } from "@/app/[lang]/dictionaries";
import { getProjectContent, hasProjectSlug } from "@/lib/project-content";
import { PROJECT_ENTRIES, projectHref } from "@/lib/projects";
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

  // Card copy comes from each project's MDX metadata, so the case study is the
  // single source of truth for its own name and summary.
  const projects: ProjectListItem[] = await Promise.all(
    PROJECT_ENTRIES.filter((project) => hasProjectSlug(project.id)).map(
      async (project) => {
        const { metadata } = await getProjectContent(
          project.id as Parameters<typeof getProjectContent>[0],
          lang as Locale,
        );

        return {
          id: project.id,
          name: metadata.name,
          summary: metadata.summary,
          year: project.year,
          repoUrl: project.repoUrl,
          liveUrl: project.liveUrl,
          tech: project.tech,
          detailHref: projectHref(project.id, lang),
        };
      },
    ),
  );

  return (
    <main className="flex w-full flex-1 flex-col bg-background text-foreground">
      <ProjectsSection projects={projects} />
    </main>
  );
};

export default ProjectsPage;
