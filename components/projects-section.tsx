"use client";

import Link from "next/link";
import { useState } from "react";

import { ProjectHoverPreview } from "@/components/project-hover-preview";
import { TechIcon } from "@/components/tech-chip";
import { useTranslation } from "@/components/language-provider";
import type { ProjectListItem } from "@/lib/project-content";
import { SECTION_EYEBROW } from "@/lib/section-eyebrow";
import { SKILL_ICON_COMPONENTS } from "@/lib/skillset-icons";

export type { ProjectListItem };

const GithubIcon = SKILL_ICON_COMPONENTS.github;

/**
 * `page` is the projects index, where this block is the whole route: its title is
 * the page's `h1` and the header reads from the left like a document.
 *
 * `home` is an excerpt of the same list further down a longer page. The title
 * drops to `h2` — the hero already owns the `h1` there — and the header centres
 * to match every other home section.
 */
export type ProjectsSectionVariant = "page" | "home";

const ProjectsSection = ({
  projects,
  variant = "page",
  allProjectsHref,
}: {
  projects: ProjectListItem[];
  variant?: ProjectsSectionVariant;
  /** Renders the "all projects" link. Home only — on the index it would self-link. */
  allProjectsHref?: string;
}) => {
  const { dict } = useTranslation();
  const copy = dict.projects;
  const isHome = variant === "home";
  const Heading = isHome ? "h2" : "h1";
  const RowHeading = isHome ? "h3" : "h2";

  /*
   * One preview element for the whole list rather than one per row: only ever a
   * single row is hovered, and a per-row element would mount a portal per project.
   */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = projects.find((project) => project.id === hoveredId);

  return (
    <section
      id="projects"
      className={`isolate w-full scroll-mt-24 font-sans text-zinc-950 dark:text-white${
        isHome ? " bg-zinc-50 dark:bg-zinc-950" : ""
      }`}
      aria-labelledby="projects-heading"
    >
      <ProjectHoverPreview image={hovered?.preview} active={Boolean(hovered)} />

      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20 lg:py-28">
        <header
          className={
            isHome
              ? "mx-auto mb-8 max-w-2xl text-center sm:mb-10"
              : "mb-8 max-w-2xl sm:mb-10"
          }
        >
          <p className={SECTION_EYEBROW}>{copy.eyebrow}</p>
          <Heading
            id="projects-heading"
            className="mt-2 font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-[48px]"
          >
            {copy.title}
          </Heading>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-white/70 sm:text-lg">
            {copy.subtitle}
          </p>
        </header>

        <ul className="border-t border-zinc-200/95 dark:border-white/12">
          {projects.map((project) => (
            /* `group` drives the hover treatment; the row is one link via the
               stretched `after` overlay on the title. */
            <li
              key={project.id}
              className="group relative border-b border-zinc-200/95 dark:border-white/12"
              onPointerEnter={(event) => {
                // Touch reports a pointerenter on tap; the preview is for pointers
                // that hover, and `ProjectHoverPreview` gates on width besides.
                if (event.pointerType === "touch") return;
                setHoveredId(project.id);
              }}
              onPointerLeave={() => setHoveredId(null)}
            >
              <div className="-mx-4 rounded-2xl px-4 py-6 transition-colors group-hover:bg-zinc-950/[0.025] dark:group-hover:bg-white/[0.035] sm:py-7">
                <div className="flex items-baseline justify-between gap-4">
                  {/* One level under whatever the section's own title is. */}
                  <RowHeading className="font-nohemi text-xl font-bold leading-[1.25] text-zinc-950 dark:text-white sm:text-2xl">
                    <Link
                      href={project.detailHref}
                      className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:focus-visible:ring-white/35"
                    >
                      {project.name}
                      <span className="sr-only"> — {copy.details}</span>
                      <span
                        aria-hidden
                        className="ml-2 inline-block text-zinc-400 transition-transform duration-300 group-hover:translate-x-1 dark:text-white/40"
                      >
                        &rarr;
                      </span>
                    </Link>
                  </RowHeading>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-zinc-500 dark:text-white/45">
                    {project.year}
                  </p>
                </div>

                <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-zinc-600 dark:text-white/65">
                  {project.summary}
                </p>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {project.tech.map((tech) => (
                      <TechIcon key={tech.name} tech={tech} />
                    ))}
                  </ul>

                  {/* Sits above the stretched overlay so these stay separately clickable. */}
                  <div className="relative z-10 flex shrink-0 items-center gap-1">
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${copy.view_source} — ${project.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 outline-none transition-colors hover:bg-zinc-950/5 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-white/35"
                    >
                      <GithubIcon size={18} className="shrink-0" aria-hidden />
                    </a>
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${copy.view_live} — ${project.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-base text-zinc-500 outline-none transition-colors hover:bg-zinc-950/5 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-white/35"
                      >
                        <span aria-hidden>&#8599;</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {allProjectsHref ? (
          <div className="mt-8 flex justify-center sm:mt-10">
            <Link
              href={allProjectsHref}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-950/12 px-4 py-2 text-sm text-zinc-700 outline-none transition-colors hover:border-zinc-950/25 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/15 dark:text-white/75 dark:hover:border-white/30 dark:hover:text-white dark:focus-visible:ring-white/35"
            >
              {copy.view_all}
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ProjectsSection;
