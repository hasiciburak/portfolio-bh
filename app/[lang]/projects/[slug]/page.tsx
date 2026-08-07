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

  return {
    title: `${metadata.name} — Burak Haşıcı`,
    description: metadata.summary,
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
