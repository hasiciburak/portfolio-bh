import type { SkillItem } from "@/lib/skillset-data";

/**
 * Structural project data. All prose (name, summary, case study, image alt text)
 * lives in the per-locale MDX files under `content/projects/` — see
 * `lib/project-content.ts`.
 */
export interface ProjectEntry {
  /** Doubles as the URL slug: /projects/<id> */
  id: string;
  year: string;
  repoUrl: string;
  liveUrl?: string;
  tech: SkillItem[];
}

export const PROJECT_ENTRIES: ProjectEntry[] = [
  {
    id: "portfolio-bh",
    year: "2026",
    repoUrl: "https://github.com/hasiciburak/portfolio-bh",
    tech: [
      { name: "Next.js 16", icon: "nextjs" },
      { name: "React 19", icon: "react" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Tailwind CSS v4", icon: "tailwind" },
      { name: "GSAP", icon: null },
      { name: "Claude Code", icon: "claude" },
      { name: "Vercel", icon: "vercel" },
      { name: "Figma", icon: "figma" },
    ],
  },
];

export const findProject = (id: string): ProjectEntry | undefined =>
  PROJECT_ENTRIES.find((project) => project.id === id);

/** Locale-aware href, matching the convention in `components/site-navigation.tsx`. */
export const projectHref = (id: string, lang: string): string =>
  lang === "tr" ? `/tr/projects/${id}` : `/projects/${id}`;

export const projectsHref = (lang: string): string =>
  lang === "tr" ? "/tr/projects" : "/projects";
