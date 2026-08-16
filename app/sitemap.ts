import type { MetadataRoute } from "next";

import { PROJECT_SLUGS } from "@/lib/project-content";
import { languageAlternates, localeUrl } from "@/lib/site-metadata";

/**
 * When each page's content last actually changed, in ISO form.
 *
 * This used to be `new Date()`, which stamped every URL with the build time: a
 * deploy that touched one component told Google the whole site had been rewritten.
 * A crawler that has been lied to about freshness a few times stops using the
 * signal at all — and freshness is one of the few levers a site with no backlinks
 * still has.
 *
 * Hand-maintained on purpose. The dates are content facts, not build facts, and
 * nothing in the repo knows them: git history tracks files, and a page's meaning
 * can change without its own file being touched. Update the entry when the page's
 * substance changes, not when its markup is refactored.
 */
const LAST_MODIFIED: Record<string, string> = {
  "/": "2026-08-15",
  "/projects": "2026-08-10",
  "/cv": "2026-08-15",
};

/** Projects change when their MDX does; until that is wired up, they share a date. */
const PROJECT_LAST_MODIFIED = "2026-08-10";

/**
 * Every page exists in both locales, so each entry lists the English URL as the
 * canonical `loc` and hangs the Turkish one off `alternates.languages`. That is
 * the pairing Google needs to treat `/projects` and `/tr/projects` as one page in
 * two languages rather than two competing pages.
 */
const sitemap = (): MetadataRoute.Sitemap => {
  const staticPaths = [
    { path: "/", priority: 1, changeFrequency: "monthly" as const },
    { path: "/projects", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/cv", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const projectPaths = PROJECT_SLUGS.map((slug) => ({
    path: `/projects/${slug}`,
    priority: 0.7,
    changeFrequency: "yearly" as const,
  }));

  return [...staticPaths, ...projectPaths].map(
    ({ path, priority, changeFrequency }) => ({
      url: localeUrl("en", path),
      lastModified: LAST_MODIFIED[path] ?? PROJECT_LAST_MODIFIED,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(path) },
    }),
  );
};

export default sitemap;
