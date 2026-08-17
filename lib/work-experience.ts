import type { Dictionary } from "@/app/[lang]/dictionaries";

/**
 * The work history, as the PDF at `RESUME_PATH` states it. Both the home page's
 * section and the CV page read from here, so a role only has to be corrected once
 * and the page a recruiter reads can never contradict the file they downloaded.
 *
 * Two fields are for the CV page alone. `location` and `context` answer the
 * questions a reader outside the industry actually has — where the team sat, and
 * what the company does — and the home page's type is too large to carry them
 * without turning each card into a paragraph.
 */

export interface WorkExperienceRole {
  id: string;
  /** The job title on its own; the company is named once, by the entry above it. */
  title: string;
  date: string;
}

export interface WorkExperienceLogo {
  /** Keys the mark, and picks the inline drawing where a file wouldn't survive both themes. */
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface WorkExperienceEntry {
  id: string;
  /**
   * Every mark the engagement is worn under. Usually one; the HqO entry carries the
   * agency's too, because "via ElephantApps" in the title is the kind of detail a
   * reader skims past and a logo is not.
   */
  logos: WorkExperienceLogo[];
  /** Company and the shape of the engagement, e.g. contracted through whom. */
  company: string;
  /** CV page only. Where the team sat, not where the work was done from. */
  location: string;
  /** CV page only. One line on what the company does, for a reader who doesn't know the name. */
  context: string;
  /**
   * Stints at the same company, newest first — one for most entries, two for
   * HqO/Leesman, which is a single product returned to after the acquisition
   * rather than two unrelated jobs that happen to share a logo.
   */
  roles: WorkExperienceRole[];
  bullets: string[];
}

export const WORK_EXPERIENCE_ENTRIES: WorkExperienceEntry[] = [
  {
    id: "hqo",
    logos: [
      {
        id: "hqo",
        src: "/companies/hqo.svg",
        alt: "HqO logo",
        width: 101,
        height: 48,
      },
      {
        id: "elephantapps",
        src: "/companies/elephantapps.svg",
        alt: "ElephantApps logo",
        // Same 48 units tall as the HqO mark above it, at the ink's own aspect.
        width: 59,
        height: 48,
      },
    ],
    company: "HqO / Leesman (via ElephantApps)",
    location: "Remote — Boston, US & London, UK",
    context:
      "Workplace experience and analytics platform for landlords and enterprise tenants. HqO acquired Leesman in 2024.",
    roles: [
      { id: "software-engineer", title: "Software Engineer", date: "Dec 25’ - Present" },
      { id: "frontend-developer", title: "Frontend Developer", date: "Dec 22’ - Jun 24’" },
    ],
    bullets: [
      "Returned to the product after HqO’s acquisition of Leesman to work on migrating the platform I had previously helped build — nearly three years in the same domain across both engagements.",
      "Built full-stack features across HqO’s and Leesman’s platforms using React, Next.js, Node.js, and NestJS.",
      "Delivered features in the events domain used by both tenants and landlords across more than 1,500 properties.",
      "Built AI-powered internal tooling that automated report generation for the Leesman team, reducing a 4–7 hour manual workflow to under 5 minutes.",
      "Cut load times on the main reporting dashboard by 50% through code splitting, memoisation, and query optimisation.",
      "Worked asynchronously across four time zones with colleagues and customers in the UK, Poland, Slovakia, and the US, owning client requests end to end from clarification through delivery.",
    ],
  },
  {
    id: "nonpublic",
    logos: [
      {
        id: "nonpublic",
        src: "/companies/nonpublic.svg",
        alt: "NonPublic logo",
        width: 189,
        height: 26,
      },
    ],
    company: "NonPublic",
    location: "Remote — Sydney, AU",
    context:
      "Private markets and pre-IPO investment platform, ASIC-regulated (Australian Financial Services Licence). Six-month engagement to deliver the investor mobile application and company web presence.",
    roles: [
      { id: "frontend-developer", title: "Frontend Developer", date: "May - Nov 25’" },
    ],
    bullets: [
      "Built and maintained customer-facing and back-office applications for a regulated investment platform, working with a distributed team across Australia and Germany.",
      "Developed onboarding and KYC-adjacent flows in React, React Native, TypeScript, TanStack Query, and SASS.",
      "Shipped an investor-facing mobile application with React Native.",
      "Delivered the company marketing site with Next.js, TypeScript, SASS, and Sanity CMS, achieving a Lighthouse performance score of 100.",
    ],
  },
  {
    id: "fibabanka",
    logos: [
      {
        id: "fibabanka",
        src: "/companies/fibabanka.png",
        alt: "Fibabanka logo",
        width: 172,
        height: 52,
      },
    ],
    company: "Fibabanka (via Veriport)",
    location: "Istanbul, Türkiye",
    context:
      "Turkish commercial bank; the platform is used daily across all branches.",
    roles: [
      { id: "frontend-developer", title: "Frontend Developer", date: "Jul 24’ - May 25’" },
    ],
    bullets: [
      "Migrated core banking screens (accounting, customer services, EFT) from a legacy Java/XML stack to React, Redux, and a customised Material UI theme, rolled out across all branches.",
      "Reduced screen render times by roughly 50% compared to the legacy XML-based implementation.",
      "Analysed and documented legacy Java/XML screen behaviour in Confluence to de-risk the migration.",
      "Built and documented reusable components for the bank’s internal UI library using Storybook and JSDoc.",
    ],
  },
  {
    id: "digiturk",
    logos: [
      {
        id: "digiturk",
        src: "/companies/digiturk.svg",
        alt: "Digiturk beIN Media Group logo",
        width: 136,
        height: 48,
      },
    ],
    company: "Digiturk (beIN Media Group)",
    location: "Istanbul, Türkiye",
    context: "Pay-TV and sports broadcasting group.",
    roles: [
      { id: "frontend-developer", title: "Frontend Developer", date: "Feb 22’ - Dec 22’" },
    ],
    bullets: [
      "Developed internal web applications for R&D projects using React, Redux, and Redux Saga.",
      "Resolved production issues raised by call center teams through Jira.",
      "Worked with Axios, Bootstrap, Styled Components, and Emotion across the UI layer.",
    ],
  },
];

/**
 * The entries above merged with their translations — one implementation for the two
 * surfaces that render them, so the home page and the CV can't fall out of step over
 * something as small as which field wins when a translation is missing.
 *
 * `roles` is indexed rather than mapped: the JSON gives each entry its own literal
 * shape, so the dictionary's role table has no common index signature to narrow to.
 * English is the fallback for every field, exactly as it is elsewhere on the site.
 */
export const localizedWorkExperience = (dict: Dictionary) =>
  WORK_EXPERIENCE_ENTRIES.map((entry) => {
    const key = entry.id as keyof typeof dict.work_experience.entries;
    const localized = dict.work_experience.entries[key];
    const localizedRoles = localized?.roles as
      | Record<string, { title?: string; date?: string } | undefined>
      | undefined;

    return {
      ...entry,
      company: localized?.company || entry.company,
      location: localized?.location || entry.location,
      context: localized?.context || entry.context,
      roles: entry.roles.map((role) => ({
        ...role,
        title: localizedRoles?.[role.id]?.title || role.title,
        date: localizedRoles?.[role.id]?.date || role.date,
      })),
      bullets: localized?.bullets || entry.bullets,
    };
  });
