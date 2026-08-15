/**
 * The parts of the CV that live nowhere else on the site.
 *
 * Everything the home page already states — the work history, the stack, the
 * ways of working — is read straight from `WORK_EXPERIENCE_ENTRIES`,
 * `SKILLSET_ROWS` and `SKILLSET_COLLABORATION` by the CV page. Duplicating any of
 * it here is how the two would drift, and the numbers on this site are meant to
 * trace back to one source.
 *
 * The shape follows the work-experience convention: ids and dates here, prose in
 * the dictionaries, merged at render.
 */

export interface CvEducationEntry {
  id: string;
  school: string;
  degree: string;
  /** Same `Mon YY’` shorthand the work history uses, so the two columns line up. */
  date: string;
}

export const CV_EDUCATION: CvEducationEntry[] = [
  {
    id: "bahcesehir",
    school: "Bahçeşehir University",
    degree: "Marketing, Master’s Degree",
    date: "Feb 24’ - Jun 25’",
  },
  {
    id: "kultur",
    school: "Istanbul Kültür University",
    degree: "Industrial Engineering, Bachelor’s Degree",
    date: "Sep 16’ - Mar 22’",
  },
];

/**
 * Order only. Both the name and the level are prose — "Native" has a Turkish
 * equivalent even though C1 and A2 do not — so they live in the dictionaries with
 * everything else that gets translated.
 */
export const CV_LANGUAGE_IDS = ["turkish", "english", "german"] as const;

/**
 * Already public: the same number backs the WhatsApp entry in `SITE_SOCIAL_LINKS`
 * and is printed on the PDF this page mirrors. Written in the international form
 * so it dials from anywhere, with a `tel:` twin for the phone that reads it.
 */
export const CV_PHONE = "+90 535 368 55 17";
export const CV_PHONE_HREF = "tel:+905353685517";
