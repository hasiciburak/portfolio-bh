"use client";

import type { SkillItem } from "@/lib/skillset-data";
import { SKILL_ICON_COMPONENTS, type SkillIconId } from "@/lib/skillset-icons";

/** 2–3 letter monogram when no brand icon exists in developer-icons */
const monogramLabel = (name: string): string => {
  const cleaned = name
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\w\s]/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const a = words[0]?.[0] ?? "";
    const b = words[1]?.[0] ?? "";
    return (a + b).toUpperCase().slice(0, 3);
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase() || "?";
}

const SkillIconOrMonogram = ({
  name,
  icon,
  size,
}: {
  name: string;
  icon: SkillIconId | null;
  size: number;
}) => {
  if (icon) {
    const Icon = SKILL_ICON_COMPONENTS[icon];
    return (
      <Icon size={size} className="shrink-0 [&_*]:origin-center" aria-hidden />
    );
  }
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-300/95 bg-white font-mono text-[10px] font-semibold uppercase leading-none tracking-tight text-zinc-800 shadow-sm dark:border-white/18 dark:bg-white/[0.07] dark:text-white dark:shadow-none"
      aria-hidden
    >
      {monogramLabel(name)}
    </span>
  );
}

export const SkillsetChip = ({ skill }: { skill: SkillItem }) => {
  return (
    <div className="flex min-h-[52px] transform-gpu items-center gap-3 rounded-2xl border border-zinc-200/95 bg-white/75 px-3.5 py-2.5 shadow-sm transition-[transform,background-color,border-color] duration-[350ms] ease-[cubic-bezier(0.33,1,0.68,1)] hover:scale-[1.015] hover:border-zinc-300 hover:bg-white motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:scale-100 dark:border-white/12 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-white/22 dark:hover:bg-white/[0.07]">
      <SkillIconOrMonogram name={skill.name} icon={skill.icon} size={28} />
      <span className="min-w-0 text-sm font-medium leading-snug text-zinc-800 dark:text-white/90 sm:text-[15px]">
        {skill.name}
      </span>
    </div>
  );
}
