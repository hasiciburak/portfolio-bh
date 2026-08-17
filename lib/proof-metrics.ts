export interface ProofMetric {
  id: string;
  /** The figure itself. Localised — Turkish writes the percent sign first. */
  value: string;
  label: string;
}

/**
 * The four numbers the CV can actually back up, lifted out of the work-experience
 * bullets where they were buried four or five items down. Every entry below cites
 * the bullet it comes from: these are the only claims on the site a reader could
 * check against a reference call, so none of them should be rounded up, combined,
 * or restated more strongly than `WORK_EXPERIENCE_ENTRIES` puts them.
 *
 * Deliberately not a derived figure: 4–7 hours down to 5 minutes is a 48–84×
 * speed-up, and "50× faster" would read as the kind of number nobody can source.
 * The before and after are stated plainly instead.
 */
export const PROOF_METRICS: ProofMetric[] = [
  {
    // hqo — "cutting tasks that previously took 4–7 hours down to 5 minutes"
    id: "automation",
    value: "5 min",
    label: "What a 4–7 hour internal workflow takes after the AI tooling I built",
  },
  {
    // nonpublic — "achieved 100 performance score in Lighthouse"
    id: "lighthouse",
    value: "100",
    label: "Lighthouse performance score on a company site built with Next.js",
  },
  {
    /*
     * hqo — "used by both tenants and landlords across more than 1,500 properties"
     *
     * The one figure here that isn't a speed-up, and the only one that says anything
     * about scale. It renders as written rather than counting up: `splitFigure`
     * takes a single run of digits, and a thousands separator differs per locale.
     */
    id: "properties",
    value: "1,500+",
    label: "Properties running the platform whose events features I ship",
  },
  {
    // fibabanka — "Reduced screen render times by roughly 50%", which is the same
    // claim stated the way a reader can picture: half the time is twice the speed.
    id: "legacy-ui",
    value: "2×",
    label: "UI speed against the Java/XML banking screens it replaced",
  },
];
