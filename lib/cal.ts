/**
 * Public Cal.com booking path. Username plus the 30-minute event slug.
 *
 * Overridable so a renamed event type does not require a code change. The
 * username is not a secret — it is the same path published on cal.com.
 */
export const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "burakhasici/30min";

export const CAL_BOOKING_URL = `https://cal.com/${CAL_LINK}`;

/** Namespace so a second embed on the page would not share this instance. */
export const CAL_NAMESPACE = "book-call";
