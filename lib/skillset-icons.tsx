import type { ComponentType, SVGProps } from "react";
import {
  AnthropicBasicDark,
  AnthropicBasicLight,
  AppleDark,
  AppleLight,
  Atlassian,
  Bitbucket,
  Bootstrap5,
  C,
  Dart,
  Figma,
  FramerDark,
  FramerLight,
  Git,
  GitHubDark,
  GitHubLight,
  GraphQL,
  Java,
  JavaScript,
  Jest,
  Jira,
  MaterialUI,
  Microsoft,
  MongoDB,
  Miro,
  NextJs,
  PostgreSQL,
  Python,
  React as ReactLogo,
  ReactQuery,
  Redux,
  Sketch,
  Slack,
  Storybook,
  SvelteJS,
  Swift,
  TailwindCSS,
  TypeScript,
  VisualStudioCode,
  VercelDark,
  VercelLight,
  Vitest,
} from "developer-icons";

export type SkillIconComponent = ComponentType<
  Partial<SVGProps<SVGSVGElement>> & { size?: number }
>;

/**
 * `developer-icons` names each pair by glyph colour, not by the theme it belongs to:
 * `*Light` is the near-white glyph (for dark backgrounds) and `*Dark` is the near-black
 * one (for light backgrounds). Pairing them the other way round hides the icon in both.
 */
const themedIcon = (
  darkGlyph: SkillIconComponent,
  lightGlyph: SkillIconComponent,
): SkillIconComponent => {
  const DarkGlyph = darkGlyph;
  const LightGlyph = lightGlyph;

  return ({ className = "", ...props }) => (
    <>
      <LightGlyph {...props} className={`${className} hidden dark:block`} />
      <DarkGlyph {...props} className={`${className} block dark:hidden`} />
    </>
  );
}

const AppleIcon = themedIcon(AppleDark, AppleLight);
const ClaudeIcon = themedIcon(AnthropicBasicDark, AnthropicBasicLight);
const FramerIcon = themedIcon(FramerDark, FramerLight);
const GitHubIcon = themedIcon(GitHubDark, GitHubLight);
const VercelIcon = themedIcon(VercelDark, VercelLight);

export const SKILL_ICON_COMPONENTS = {
  apple: AppleIcon,
  atlassian: Atlassian,
  bitbucket: Bitbucket,
  bootstrap: Bootstrap5,
  c: C,
  claude: ClaudeIcon,
  dart: Dart,
  figma: Figma,
  framer: FramerIcon,
  git: Git,
  github: GitHubIcon,
  graphql: GraphQL,
  java: Java,
  javascript: JavaScript,
  jest: Jest,
  jira: Jira,
  materialUi: MaterialUI,
  microsoft: Microsoft,
  mongodb: MongoDB,
  miro: Miro,
  nextjs: NextJs,
  postgresql: PostgreSQL,
  python: Python,
  react: ReactLogo,
  reactQuery: ReactQuery,
  redux: Redux,
  sketch: Sketch,
  slack: Slack,
  storybook: Storybook,
  svelte: SvelteJS,
  swift: Swift,
  tailwind: TailwindCSS,
  typescript: TypeScript,
  vscode: VisualStudioCode,
  vercel: VercelIcon,
  vitest: Vitest,
} as const satisfies Record<string, SkillIconComponent>;

export type SkillIconId = keyof typeof SKILL_ICON_COMPONENTS;

/** 2–3 letter monogram when no brand icon exists in developer-icons */
export const skillMonogram = (name: string): string => {
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
};

