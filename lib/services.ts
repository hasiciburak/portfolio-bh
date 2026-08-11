export interface ServiceOffering {
  id: string;
  title: string;
  body: string;
  /**
   * The tools that make the claim above concrete. Untranslated on purpose — these are
   * product names, and the same reasoning keeps `SKILLSET_COLLABORATION` out of the
   * dictionaries.
   */
  keywords: string[];
}

/**
 * What a visitor can actually hire me for, ordered by how much of the work I take on:
 * the browser first, then the server behind it, then the phone, then the craft
 * disciplines that cut across all three. The deck in `services-section.tsx` numbers them
 * in this order, so reordering here renumbers the cards.
 */
export const SERVICE_OFFERINGS: ServiceOffering[] = [
  {
    id: "frontend",
    title: "Frontend Development",
    body: "Production React interfaces that stay fast and accessible as the product grows.",
    keywords: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    id: "fullstack",
    title: "Full-Stack Development",
    body: "APIs, data models and the screens on top of them, shipped as one coherent piece.",
    keywords: ["Node.js", "NestJS", "GraphQL", "PostgreSQL"],
  },
  {
    id: "mobile",
    title: "Mobile Apps",
    body: "Cross-platform apps that feel native, from the onboarding flow to the store release.",
    keywords: ["React Native", "Expo", "SwiftUI"],
  },
  {
    id: "design",
    title: "UI/UX Design",
    body: "Figma work that survives contact with code — design systems, not one-off screens.",
    keywords: ["Figma", "Design systems", "Storybook"],
  },
  {
    id: "ai",
    title: "AI-Native Engineering",
    body: "Internal tooling and agentic workflows that cut hours of manual work down to minutes.",
    keywords: ["Claude Code", "Cursor", "Agentic workflows"],
  },
  {
    id: "performance",
    title: "Performance & Accessibility",
    body: "Audits and refactors that move Core Web Vitals and open the product up to everyone.",
    keywords: ["Lighthouse", "Core Web Vitals", "WCAG"],
  },
];
