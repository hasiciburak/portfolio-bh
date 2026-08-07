import { notFound } from "next/navigation";

import ProjectsSection, {
  type ProjectListItem,
} from "@/components/projects-section";
import { hasLocale, type Locale } from "@/app/[lang]/dictionaries";
import { getProjectContent, hasProjectSlug } from "@/lib/project-content";
import { PROJECT_ENTRIES, projectHref } from "@/lib/projects";

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
