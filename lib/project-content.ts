import type { ComponentType } from "react";

import type { Locale } from "@/app/[lang]/dictionaries";

export interface ProjectGalleryImage {
  src: string;
  /** Full description for assistive tech — not shown on screen. */
  alt: string;
  /** Short visible label under the slide. Omit to render the image bare. */
  caption?: string;
  width: number;
  height: number;
}

/** Shape of the `metadata` export inside every project MDX file. */
export interface ProjectContentMetadata {
  name: string;
  /** Short card summary on the projects index */
  summary: string;
  gallery: ProjectGalleryImage[];
}

interface ProjectContentModule {
  default: ComponentType;
  metadata: ProjectContentMetadata;
}

/**
 * Static loader map — same idiom as `app/[lang]/dictionaries.ts`. Static imports keep
 * this type-safe and avoid relying on bundler context-module resolution for a
 * template-literal import path.
 */
const projectContent = {
  "portfolio-bh": {
    en: () => import("@/content/projects/portfolio-bh.en.mdx"),
    tr: () => import("@/content/projects/portfolio-bh.tr.mdx"),
  },
} as const;

export type ProjectSlug = keyof typeof projectContent;

export const hasProjectSlug = (slug: string): slug is ProjectSlug =>
  slug in projectContent;

export const PROJECT_SLUGS = Object.keys(projectContent) as ProjectSlug[];

export const getProjectContent = async (slug: ProjectSlug, locale: Locale) => {
  // `@types/mdx` only types an MDX module's default export; the named `metadata`
  // export is asserted here so nothing downstream needs a cast.
  const loaded = (await projectContent[slug][locale]()) as ProjectContentModule;

  return { Body: loaded.default, metadata: loaded.metadata };
};
