import type { MetadataRoute } from "next";

import { PROJECT_SLUGS } from "@/lib/project-content";
import { languageAlternates, localeUrl } from "@/lib/site-metadata";

/**
 * Every page exists in both locales, so each entry lists the English URL as the
 * canonical `loc` and hangs the Turkish one off `alternates.languages`. That is
 * the pairing Google needs to treat `/projects` and `/tr/projects` as one page in
 * two languages rather than two competing pages.
 */
const sitemap = (): MetadataRoute.Sitemap => {
  const lastModified = new Date();

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
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(path) },
    }),
  );
};

export default sitemap;
