export interface AvailabilityStatus {
  /** The state itself — the part the indicator dot belongs to. */
  status: string;
  /**
   * One qualifier, and only one. Where matters most to a recruiter and costs the
   * badge no height; work model was the other candidate and made the pill read as
   * a sentence rather than a label.
   */
  location: string;
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
  location: "Istanbul",
};
