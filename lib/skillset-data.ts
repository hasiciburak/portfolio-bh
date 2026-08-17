import type { SkillIconId } from "@/lib/skillset-icons";

export interface SkillItem {
  name: string;
  /** When `null`, a compact monogram is shown instead of a `developer-icons` logo */
  icon: SkillIconId | null;
}

/** Marquee entries always carry a real mark — a text monogram drifting past logos looks broken. */
export interface SkillRowItem extends SkillItem {
  icon: SkillIconId;
}

export interface SkillRow {
  id: string;
  title: string;
  skills: SkillRowItem[];
}

/**
 * One row per marquee lane. Rows are ordered by how much they say about the work —
 * the reader sees the top two before scrolling — and each holds enough entries to fill
 * a wide lane without the loop repeating inside a single screen.
 */
export const SKILLSET_ROWS: SkillRow[] = [
  {
    id: "ai",
    title: "AI & Agentic",
    skills: [
      { name: "Claude Code", icon: "claude" },
      { name: "Cursor", icon: "cursor" },
      { name: "Codex", icon: "codex" },
      { name: "Antigravity", icon: "antigravity" },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    skills: [
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "C#", icon: "csharp" },
      { name: "Swift", icon: "swift" },
      { name: "Dart", icon: "dart" },
      { name: "Python", icon: "python" },
      { name: "Java", icon: "java" },
      { name: "C", icon: "c" },
    ],
  },
  {
    id: "frontend",
    title: "Web & Mobile",
    skills: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "React Native", icon: "react" },
      { name: "Expo", icon: "expo" },
      { name: "SwiftUI", icon: "apple" },
      { name: "Svelte", icon: "svelte" },
    ],
  },
  {
    /*
     * High up on purpose: the CV opens by calling the work full-stack, and a stack
     * list that stopped at the browser was quietly arguing the opposite.
     *
     * ".NET" wears the Microsoft mark because no icon set ships a .NET glyph — its
     * own platform's logo reads as the right family, where the C# icon next to it
     * would claim the language twice.
     */
    id: "backend",
    title: "Backend & Cloud",
    skills: [
      { name: "Node.js", icon: "nodejs" },
      { name: "NestJS", icon: "nestjs" },
      { name: "Express", icon: "express" },
      { name: ".NET", icon: "microsoft" },
      { name: "AWS", icon: "aws" },
      { name: "Docker", icon: "docker" },
    ],
  },
  {
    id: "ui",
    title: "UI & Styling",
    skills: [
      { name: "TailwindCSS", icon: "tailwind" },
      { name: "Tailwind UI", icon: "tailwind" },
      { name: "Sass", icon: "sass" },
      { name: "Material UI", icon: "materialUi" },
      { name: "Ant Design", icon: "antDesign" },
      { name: "Bootstrap", icon: "bootstrap" },
      { name: "Styled Components", icon: "styledComponents" },
      { name: "Storybook", icon: "storybook" },
      { name: "Framer Motion", icon: "framer" },
      { name: "Formik", icon: "formik" },
    ],
  },
  {
    id: "state-data",
    title: "State & Data",
    skills: [
      { name: "Redux", icon: "redux" },
      { name: "Redux Toolkit", icon: "redux" },
      { name: "Redux Thunk", icon: "redux" },
      { name: "Zustand", icon: "zustand" },
      { name: "React Query", icon: "reactQuery" },
      { name: "GraphQL", icon: "graphql" },
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "SQL Server", icon: "sqlServer" },
      { name: "MongoDB", icon: "mongodb" },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    skills: [
      { name: "Vitest", icon: "vitest" },
      { name: "Jest", icon: "jest" },
      { name: "React Testing Library", icon: "testingLibrary" },
      { name: "Cypress", icon: "cypress" },
    ],
  },
  {
    id: "tooling",
    title: "Tooling & Design",
    skills: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Bitbucket", icon: "bitbucket" },
      { name: "VS Code", icon: "vscode" },
      { name: "Xcode", icon: "xcode" },
      { name: "Vercel", icon: "vercel" },
      { name: "Figma", icon: "figma" },
      { name: "Sketch", icon: "sketch" },
    ],
  },
];

/**
 * Ways of working rather than things built with — kept as a single line under the rows
 * so the keywords stay on the page without costing a lane apiece.
 */
export const SKILLSET_COLLABORATION = [
  "Jira",
  "Linear",
  "Confluence",
  "Miro",
  "Slack",
  "Microsoft Teams",
  "Agile",
  "Scrum",
];
