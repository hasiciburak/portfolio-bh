export interface WorkExperienceEntry {
  id: string;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  title: string;
  date: string;
  bullets: string[];
}

export const WORK_EXPERIENCE_ENTRIES: WorkExperienceEntry[] = [
  {
    id: "nonpublic",
    logo: {
      src: "/companies/nonpublic.svg",
      alt: "Nonpublic logo",
      width: 189,
      height: 26,
    },
    title: "Nonpublic - Frontend Developer",
    date: "May - Nov  25’ ",
    bullets: [
      "Contributed to the development of customer-facing and back-office applications in collaboration with a globally distributed team (HQ in Sydney, Australia).",
      "Built and maintained web and mobile applications, including onboarding flows, using React, React Native, TypeScript, React Query, and SASS, with Figma for UI design.",
      "Developed an investor-focused mobile application with React Native.",
      "Partnered with the marketing team to deliver a high-performance company website (achieved 100 performance score in Lighthouse) using Next.js, TypeScript, SASS, and Sanity CMS.",
    ],
  },
  {
    id: "fibabanka",
    logo: {
      src: "/companies/fibabanka.png",
      alt: "Fibabanka logo",
      width: 172,
      height: 52,
    },
    title: "Fibabanka (via Veriport) - Frontend Developer",
    date: "Jul 24’ - May  25’",
    bullets: [
      "Transformed core banking applications originally developed in Java/XML, used across all branches for accounting, customer services, and EFT, by implementing React, Redux, and a customized version of Material UI.",
      "Analyzed legacy screens built with XML and Java on the backend and documented findings in Confluence.",
      "Improved UI performance by up to two times in certain areas compared to the XML-based applications.",
      "Developed custom UI components for the company’s UI library, documented them with Storybook, and used JSDoc for component documentation.",
    ],
  },
  {
    id: "elephantapps",
    logo: {
      src: "/companies/elephantapps.svg",
      alt: "ElephantApps logo",
      width: 48,
      height: 48,
    },
    title: "ElephantApps (cotracted to Leesman) - Frontend Developer",
    date: "Jul 24’ - May  25’",
    bullets: [
      "Developed custom web applications using React and Next.js.",
      "Optimized React applications, achieving up to 80% performance improvements. Managed and resolved client requests via Jira.",
      "Built scalable solutions using Redux, Styled Components, Axios, and Redux Thunk.",
      "Collaborated with UK-based international clients, ensuring timely delivery of features.",
      "Documented workflows and applications using Jira and Confluence.",
    ],
  },
];
