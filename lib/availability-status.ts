export interface AvailabilityRow {
  id: string;
  label: string;
  value: string;
}

/**
 * The three facts a recruiter screens on before they read anything else, laid out
 * the way a service status page lays out its components.
 *
 * Only `availability` carries an indicator dot: it is the one row describing a
 * state that can change. Location and work model are facts, and a health dot next
 * to "Istanbul" would be borrowing the metaphor past the point where it means
 * anything.
 *
 * Deliberately not listed: notice period and work-permit status. Both are useful
 * to a recruiter, but they are also details worth telling someone directly rather
 * than publishing — and an out-of-date notice period is worse than none.
 */
export const AVAILABILITY_ROWS: AvailabilityRow[] = [
  {
    id: "availability",
    label: "Availability",
    value: "Open to the right opportunity",
  },
  {
    id: "location",
    label: "Location",
    value: "Istanbul, Turkey · GMT+3",
  },
  {
    id: "work-model",
    label: "Work model",
    value: "Remote or hybrid",
  },
];

/** The row whose value gets the live indicator. */
export const AVAILABILITY_STATUS_ROW_ID = "availability";
