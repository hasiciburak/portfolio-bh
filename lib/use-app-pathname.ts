"use client";

import { usePathname } from "next/navigation";

/**
 * `usePathname()` disagrees across the hydration boundary for the default locale.
 *
 * proxy.ts rewrites `/…` to `/en/…` under the hood, so the server renders the
 * English home as `/en` while the browser reports `/`. Branching on the raw value
 * therefore produces markup the client cannot reproduce, and a *structural*
 * difference (an element present on one side only) is not a warning: React throws
 * away the server tree and re-renders from the root. Re-acquiring `<html>` strips
 * every attribute it did not render itself — the theme class and `data-intro`
 * included — which silently killed the entrance intro in production.
 *
 * Returns the browser-visible path on both sides. `/tr` needs no unwrapping: it is
 * a real path segment, not a rewrite.
 */
export const useAppPathname = (): string => {
  const pathname = usePathname();

  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice("/en".length);

  return pathname;
};
