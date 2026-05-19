import type { ComponentType, SVGProps } from "react";
import {
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

const AppleIcon: SkillIconComponent = (props) => (
  <>
    <AppleDark {...props} className={`${props.className || ""} hidden dark:block`} />
    <AppleLight {...props} className={`${props.className || ""} block dark:hidden`} />
  </>
);

const FramerIcon: SkillIconComponent = (props) => (
  <>
    <FramerDark {...props} className={`${props.className || ""} hidden dark:block`} />
    <FramerLight {...props} className={`${props.className || ""} block dark:hidden`} />
  </>
);

const GitHubIcon: SkillIconComponent = (props) => (
  <>
    <GitHubDark {...props} className={`${props.className || ""} hidden dark:block`} />
    <GitHubLight {...props} className={`${props.className || ""} block dark:hidden`} />
  </>
);

const VercelIcon: SkillIconComponent = (props) => (
  <>
    <VercelDark {...props} className={`${props.className || ""} hidden dark:block`} />
    <VercelLight {...props} className={`${props.className || ""} block dark:hidden`} />
  </>
);

export const SKILL_ICON_COMPONENTS = {
  apple: AppleIcon,
  atlassian: Atlassian,
  bitbucket: Bitbucket,
  bootstrap: Bootstrap5,
  c: C,
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

