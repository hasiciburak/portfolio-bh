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
  /** Omit for private repositories — the source button is then left out. */
  repoUrl?: string;
  liveUrl?: string;
  appStoreUrl?: string;
  tech: SkillItem[];
}

export const PROJECT_ENTRIES: ProjectEntry[] = [
  {
    id: "tastemap",
    year: "2026",
    appStoreUrl: "https://apps.apple.com/app/id6814514512",
    liveUrl: "https://tastemapapp.vercel.app",
    tech: [
      { name: "Swift", icon: "swift" },
      { name: "SwiftUI", icon: "apple" },
      { name: "SwiftData", icon: null },
      { name: "WidgetKit", icon: null },
      { name: "App Intents", icon: null },
      { name: "Foundation Models", icon: null },
      { name: "Xcode", icon: "xcode" },
      { name: "Next.js 16", icon: "nextjs" },
      { name: "Tailwind CSS v4", icon: "tailwind" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
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
