"use client";

import Link from "next/link";

import { TechIcon } from "@/components/tech-chip";
import { useTranslation } from "@/components/language-provider";
import type { SkillItem } from "@/lib/skillset-data";
import { SKILL_ICON_COMPONENTS } from "@/lib/skillset-icons";

export interface ProjectListItem {
  id: string;
  name: string;
  summary: string;
  year: string;
  repoUrl: string;
  liveUrl?: string;
  tech: SkillItem[];
  detailHref: string;
}

const GithubIcon = SKILL_ICON_COMPONENTS.github;

const ProjectsSection = ({ projects }: { projects: ProjectListItem[] }) => {
  const { dict } = useTranslation();
  const copy = dict.projects;

  return (
    <section
      id="projects"
      className="isolate w-full scroll-mt-24 font-sans text-zinc-950 dark:text-white"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20 lg:py-28">
        <header className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-white/45">
            {copy.eyebrow}
          </p>
          <h1
            id="projects-heading"
            className="mt-2 font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-[48px]"
          >
            {copy.title}
          </h1>
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
            >
              <div className="-mx-4 rounded-2xl px-4 py-6 transition-colors group-hover:bg-zinc-950/[0.025] dark:group-hover:bg-white/[0.035] sm:py-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-nohemi text-xl font-bold leading-[1.25] text-zinc-950 dark:text-white sm:text-2xl">
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
                  </h2>
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
      </div>
    </section>
  );
};

export default ProjectsSection;
