import type { SkillIconId } from "@/lib/skillset-icons";

export interface SkillItem {
  name: string;
  /** When `null`, a compact monogram is shown instead of a `developer-icons` logo */
  icon: SkillIconId | null;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: SkillItem[];
}

/** Grouped skills — labels match your CV wording; icons use developer-icons where available */
export const SKILLSET_CATEGORIES: SkillCategory[] = [
  {
    id: "languages",
    title: "Programming Languages",
    skills: [
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Swift", icon: "swift" },
      { name: "Dart", icon: "dart" },
      { name: "C", icon: "c" },
      { name: "Java", icon: "java" },
      { name: "Python", icon: "python" },
    ],
  },
  {
    id: "frontend",
    title: "Frontend Frameworks & Libraries",
    skills: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "React Native", icon: "react" },
      { name: "Expo", icon: null },
      { name: "Svelte", icon: "svelte" },
      { name: "SwiftUI", icon: "apple" },
    ],
  },
  {
    id: "ui",
    title: "UI & Styling",
    skills: [
      { name: "TailwindCSS", icon: "tailwind" },
      { name: "Bootstrap", icon: "bootstrap" },
      { name: "Material UI", icon: "materialUi" },
      { name: "Tailwind UI", icon: "tailwind" },
      { name: "Ant Design", icon: null },
      { name: "Styled Components", icon: null },
      { name: "Storybook", icon: "storybook" },
      { name: "Framer Motion", icon: "framer" },
      { name: "Formik", icon: null },
    ],
  },
  {
    id: "state-data",
    title: "State Management & Data Handling",
    skills: [
      { name: "Redux", icon: "redux" },
      { name: "Redux Toolkit", icon: "redux" },
      { name: "Redux Thunk", icon: "redux" },
      { name: "Zustand", icon: null },
      { name: "React Query (TanStack)", icon: "reactQuery" },
      { name: "GraphQL", icon: "graphql" },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    skills: [
      { name: "Vitest", icon: "vitest" },
      { name: "Jest", icon: "jest" },
      { name: "React Testing Library", icon: null },
    ],
  },
  {
    id: "databases",
    title: "Databases",
    skills: [
      { name: "SQL (PostgreSQL)", icon: "postgresql" },
      { name: "MongoDB", icon: "mongodb" },
    ],
  },
  {
    id: "devtools",
    title: "Tools & DevOps",
    skills: [
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
      { name: "Bitbucket", icon: "bitbucket" },
      { name: "VSCode", icon: "vscode" },
      { name: "Cursor", icon: null },
      { name: "Xcode", icon: null },
      { name: "Vercel", icon: "vercel" },
    ],
  },
  {
    id: "design",
    title: "Design & Collaboration",
    skills: [
      { name: "Figma", icon: "figma" },
      { name: "Sketch", icon: "sketch" },
      { name: "Miro", icon: "miro" },
      { name: "Confluence", icon: "atlassian" },
      { name: "Jira", icon: "jira" },
      { name: "Slack", icon: "slack" },
      { name: "Microsoft Teams", icon: "microsoft" },
      { name: "Microsoft Office", icon: "microsoft" },
      { name: "Agile Software Development", icon: null },
      { name: "Scrum", icon: null },
    ],
  },
];
