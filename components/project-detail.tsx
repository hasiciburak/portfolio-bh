import Link from "next/link";

import { ProjectGallery } from "@/components/project-gallery";
import { TechChip } from "@/components/tech-chip";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { ProjectContentMetadata } from "@/lib/project-content";
import { projectsHref, type ProjectEntry } from "@/lib/projects";
import { SKILL_ICON_COMPONENTS } from "@/lib/skillset-icons";

const GithubIcon = SKILL_ICON_COMPONENTS.github;

/**
 * Case-study page shell. Server component — `children` is the compiled MDX body,
 * styled globally by `mdx-components.tsx`.
 */
export const ProjectDetail = ({
  lang,
  project,
  metadata,
  dict,
  children,
}: {
  lang: string;
  project: ProjectEntry;
  metadata: ProjectContentMetadata;
  dict: Dictionary;
  children: React.ReactNode;
}) => {
  const copy = dict.projects;

  return (
    <section className="isolate w-full font-sans text-zinc-950 dark:text-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20 lg:py-24">
        <Link
          href={projectsHref(lang)}
          className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-zinc-500 outline-none transition-colors hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white/45 dark:hover:text-white dark:focus-visible:ring-white/35"
        >
          <span aria-hidden>&larr;</span>
          {copy.back_to_projects}
        </Link>

        <header className="mt-6 border-b border-zinc-200/95 pb-8 dark:border-white/12 sm:mt-8">
          <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-white/45">
            {project.year}
          </p>
          <h1 className="mt-2 font-nohemi text-[40px] font-bold leading-[1.15] tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
            {metadata.name}
          </h1>
        </header>

        <ProjectGallery
          images={metadata.gallery}
          copy={{
            label: copy.gallery_label,
            prev: copy.gallery_prev,
            next: copy.gallery_next,
            expand: copy.gallery_expand,
            close: copy.gallery_close,
          }}
        />

        <article className="mt-10 sm:mt-12">{children}</article>

        <section
          aria-labelledby="project-stack-heading"
          className="mt-12 border-t border-zinc-200/95 pt-8 dark:border-white/12 sm:mt-14"
        >
          <h2
            id="project-stack-heading"
            className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-white/45"
          >
            {copy.tech_label}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <TechChip key={tech.name} tech={tech} />
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/95 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm outline-none transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/15 dark:bg-white/[0.06] dark:text-white/90 dark:shadow-none dark:hover:border-white/25 dark:hover:bg-white/[0.1] dark:focus-visible:ring-white/35"
          >
            <GithubIcon size={18} className="shrink-0" aria-hidden />
            {copy.view_source}
          </a>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white/70 dark:hover:text-white dark:focus-visible:ring-white/35"
            >
              {copy.view_live}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
};
