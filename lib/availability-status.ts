export interface AvailabilityStatus {
  /** The state itself — the only part that carries the indicator dot. */
  status: string;
  /** Qualifiers, joined with a separator. Hidden below `sm` to keep the pill on one line. */
  meta: string[];
}

/**
 * The availability signal, sized to sit above the hero headline.
 *
 * Deliberately not "open to work": that phrase is visible to a current employer
 * and overstates someone who is employed and not searching. "Open to the right
 * opportunity" is both true and the more useful signal to a recruiter.
 *
 * Notice period and work-permit status are left out. Both matter on a first
 * screen, but they are worth saying directly rather than publishing — and a stale
 * notice period is worse than none.
 */
export const AVAILABILITY_STATUS: AvailabilityStatus = {
  status: "Open to the right opportunity",
  meta: ["Istanbul", "Remote or hybrid"],
};
