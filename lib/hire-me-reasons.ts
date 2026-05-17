export interface HireMeReason {
  id: string;
  title: string;
  body: string;
}

/** Narrative bullets for the “Why hire me” scroll sequence — edit placeholders freely */
export const HIRE_ME_REASONS: HireMeReason[] = [
  {
    id: "interfaces",
    title: "I build interfaces that users “get” on the first tap",
    body:
      "Shipping React/TypeScript experiences for nearly 4 years—fast, accessible, and production-ready.",
  },
  {
    id: "performance",
    title: "Performance and UX aren’t trade-offs—I chase both",
    body:
      "From Lighthouse-focused builds to trimming legacy UI cost in regulated stacks; measurable gains beat vibes.",
  },
  {
    id: "design-collab",
    title: "I bridge design intent with resilient frontend architecture",
    body:
      "Comfortable in Figma, fluent in component APIs—fewer hand-off surprises and cleaner iteration loops.",
  },
  {
    id: "ownership",
    title: "I ship like someone responsible for the next refactor too",
    body:
      "Documentation (Storybook, Confluence), testing-minded workflows, and clear tickets—not silent shortcuts.",
  },
];
