"use client";

import { useEffect } from "react";
import { SITE_TAB_TITLE, TAB_AWAY_TITLE } from "@/lib/site-tab-title";

export function TabAwayTitle() {
  useEffect(() => {
    const syncTitle = () => {
      document.title = document.hidden ? TAB_AWAY_TITLE : SITE_TAB_TITLE;
    };

    syncTitle();
    document.addEventListener("visibilitychange", syncTitle);
    return () => document.removeEventListener("visibilitychange", syncTitle);
  }, []);

  return null;
}
