"use client";

import type { SkillItem } from "@/lib/skillset-data";
import { SKILL_ICON_COMPONENTS, skillMonogram } from "@/lib/skillset-icons";

/** Compact named tech tag — used on project cards and detail pages. */
export const TechChip = ({ tech }: { tech: SkillItem }) => {
  const Icon = tech.icon ? SKILL_ICON_COMPONENTS[tech.icon] : null;

  return (
    <li className="flex items-center gap-2 rounded-full border border-zinc-200/95 bg-white/75 py-1.5 pl-2 pr-3 shadow-sm dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none">
      {Icon ? (
        <Icon size={18} className="shrink-0 [&_*]:origin-center" aria-hidden />
      ) : (
        <span
          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-zinc-300/95 bg-white font-mono text-[8px] font-semibold uppercase leading-none tracking-tight text-zinc-800 dark:border-white/18 dark:bg-white/[0.07] dark:text-white"
          aria-hidden
        >
          {skillMonogram(tech.name)}
        </span>
      )}
      <span className="text-[13px] font-medium leading-none text-zinc-800 dark:text-white/90">
        {tech.name}
      </span>
    </li>
  );
};

/**
 * Logo-only variant for dense contexts like the projects index, where eight named
 * chips would wrap to a second row. The name still reaches assistive tech via
 * `sr-only`, and `title` gives sighted users a native tooltip.
 */
export const TechIcon = ({ tech }: { tech: SkillItem }) => {
  const Icon = tech.icon ? SKILL_ICON_COMPONENTS[tech.icon] : null;

  return (
    <li
      title={tech.name}
      className="flex items-center opacity-70 transition-opacity group-hover:opacity-100"
    >
      {Icon ? (
        <Icon size={20} className="shrink-0 [&_*]:origin-center" aria-hidden />
      ) : (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-zinc-300/95 bg-white font-mono text-[8px] font-semibold uppercase leading-none tracking-tight text-zinc-800 dark:border-white/18 dark:bg-white/[0.07] dark:text-white"
          aria-hidden
        >
          {skillMonogram(tech.name)}
        </span>
      )}
      <span className="sr-only">{tech.name}</span>
    </li>
  );
};
