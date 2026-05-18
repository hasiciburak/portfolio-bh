export const HOME_SECTION_INDEX_ENTRIES = [
  { id: "hero", label: "Hero" },
  { id: "why-hire", label: "Why Hire Me?" },
  { id: "skillset", label: "My Skillset" },
  { id: "work-experience", label: "Work Experience" },
  { id: "github-graph", label: "My Github Graph" },
] as const;

export type HomeSectionIndexId = (typeof HOME_SECTION_INDEX_ENTRIES)[number]["id"];
