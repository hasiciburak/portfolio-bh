import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/project-detail";
import { getDictionary, hasLocale, type Locale } from "@/app/[lang]/dictionaries";
import {
  PROJECT_SLUGS,
  getProjectContent,
  hasProjectSlug,
} from "@/lib/project-content";
import { findProject } from "@/lib/projects";
import {
  OG_IMAGE,
  OG_LOCALE,
  SITE_NAME,
  languageAlternates,
  localeUrl,
} from "@/lib/site-metadata";

interface ProjectPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export const generateStaticParams = () =>
  PROJECT_SLUGS.map((slug) => ({ slug }));

export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: ProjectPageProps): Promise<Metadata> => {
  const { lang, slug } = await params;

  if (!hasLocale(lang) || !hasProjectSlug(slug)) {
    return {};
  }

  const { metadata } = await getProjectContent(slug, lang);
  const url = localeUrl(lang, `/projects/${slug}`);

  return {
    // The `— Burak Haşıcı` suffix now comes from the title template in
    // `app/[lang]/layout.tsx`, so appending it here would double it up.
    title: metadata.name,
    description: metadata.summary,
    alternates: {
      canonical: url,
      languages: languageAlternates(`/projects/${slug}`),
    },
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title: `${metadata.name} — ${SITE_NAME}`,
      description: metadata.summary,
      locale: OG_LOCALE[lang],
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${metadata.name} — ${SITE_NAME}`,
      description: metadata.summary,
      images: [OG_IMAGE],
    },
  };
};

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { lang, slug } = await params;

  if (!hasLocale(lang) || !hasProjectSlug(slug)) {
    notFound();
  }

  const project = findProject(slug);

  if (!project) {
    notFound();
  }

  const [{ Body, metadata }, dict] = await Promise.all([
    getProjectContent(slug, lang as Locale),
    getDictionary(lang as Locale),
  ]);

  return (
    <main className="flex w-full flex-1 flex-col bg-background text-foreground">
      <ProjectDetail
        lang={lang}
        project={project}
        metadata={metadata}
        dict={dict}
      >
        <Body />
      </ProjectDetail>
    </main>
  );
};

export default ProjectPage;
