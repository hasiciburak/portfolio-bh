/**
 * Builds a `mailto:` URL carrying a localized subject and opening line, so a
 * visitor who taps the contact CTA lands in a draft written in the language they
 * were reading — and the subject tells us which locale they came from.
 *
 * Hand-rolled `encodeURIComponent` rather than URLSearchParams: the latter is
 * form encoding, which turns every space into `+`. Mail clients do not decode
 * that back, so the subject arrives as "Let's+talk".
 */
export const buildContactMailto = (
  href: string,
  subject: string,
  greeting: string,
): string => {
  if (!href.startsWith("mailto:")) return href;

  // Two newlines, not one: the first closes the greeting, the second leaves the
  // cursor on an empty line so the visitor can start typing without pressing enter.
  const body = `${greeting}\n\n`;

  return `${href}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/** The bare address, for display next to a CTA that links to the templated URL. */
export const contactAddress = (href: string): string => href.replace(/^mailto:/, "");
