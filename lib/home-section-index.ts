export const HOME_SECTION_INDEX_ENTRIES = [
  { id: "hero", label: "Hero" },
  { id: "why-hire", label: "Why Work With Me?" },
  { id: "services", label: "What I Do" },
  { id: "projects", label: "Projects" },
  { id: "skillset", label: "My Skillset" },
  { id: "work-experience", label: "Work Experience" },
  { id: "contact", label: "Contact" },
] as const;

export type HomeSectionIndexId = (typeof HOME_SECTION_INDEX_ENTRIES)[number]["id"];
