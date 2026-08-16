"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { TAB_AWAY_TITLE } from "@/lib/site-tab-title";

/**
 * Swaps the tab's title while the tab is in the background, and puts the page's
 * own title back on return.
 *
 * "Its own" is the point: this used to restore one hard-coded site title, so
 * tabbing away from the CV or the projects page and back renamed it to the home
 * page's title and left it that way. What the page rendered is read once on
 * arrival and kept, which also means each route's title survives the trip.
 */
export const TabAwayTitle = () => {
  const pathname = usePathname();

  useEffect(() => {
    /*
     * Read after the effect has run, so it picks up the title this route rendered
     * rather than the one still on screen from the route before it. Re-read per
     * pathname for the same reason: a client-side navigation swaps the title
     * without remounting this component.
     */
    const pageTitle = document.title;

    const syncTitle = () => {
      document.title = document.hidden ? TAB_AWAY_TITLE : pageTitle;
    };

    document.addEventListener("visibilitychange", syncTitle);
    return () => {
      document.removeEventListener("visibilitychange", syncTitle);
      // Leaving the page mid-swap should not strand the away-title on the tab.
      document.title = pageTitle;
    };
  }, [pathname]);

  return null;
};
