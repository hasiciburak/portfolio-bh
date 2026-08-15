import type { ComponentType } from "react";

import type { Locale } from "@/app/[lang]/dictionaries";
import type { SkillItem } from "@/lib/skillset-data";
import { PROJECT_ENTRIES, projectHref } from "@/lib/projects";

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

/** One card on the projects index, or in the home page's excerpt of it. */
export interface ProjectListItem {
  id: string;
  name: string;
  summary: string;
  year: string;
  repoUrl: string;
  liveUrl?: string;
  tech: SkillItem[];
  detailHref: string;
  /** First gallery slide, used as the hover preview on the list. */
  preview?: ProjectGalleryImage;
}

/**
 * The project list, assembled from structural data in `lib/projects.ts` and prose
 * from each case study's own MDX metadata — so a project's name and summary have
 * one source, the write-up itself.
 *
 * Lives here rather than in the projects page because the home page shows an
 * excerpt of the same list, and two copies of this would drift the moment one of
 * them gained a field.
 *
 * `limit` takes the newest entries, `PROJECT_ENTRIES` being ordered newest first.
 */
export const getProjectListItems = async (
  locale: Locale,
  limit?: number,
): Promise<ProjectListItem[]> => {
  const entries = PROJECT_ENTRIES.filter((project) =>
    hasProjectSlug(project.id),
  );

  return Promise.all(
    (limit ? entries.slice(0, limit) : entries).map(async (project) => {
      const { metadata } = await getProjectContent(
        project.id as ProjectSlug,
        locale,
      );

      return {
        id: project.id,
        name: metadata.name,
        summary: metadata.summary,
        year: project.year,
        repoUrl: project.repoUrl,
        liveUrl: project.liveUrl,
        tech: project.tech,
        detailHref: projectHref(project.id, locale),
        preview: metadata.gallery[0],
      };
    }),
  );
};
