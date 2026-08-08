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

/** `developer-icons` has no Linear glyph — brand mark drawn in Linear's purple */
const LinearIcon: SkillIconComponent = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="#5E6AD2"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" />
  </svg>
);

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
  linear: LinearIcon,
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

