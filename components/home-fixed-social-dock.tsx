"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { SocialPill } from "@/components/social-pill";

/**
 * ScrollSmoother transforms #smooth-content, which breaks descendant `position: fixed`.
 * Mounting here keeps the social dock viewport-fixed while smooth scrolling.
 */
export function HomeFixedSocialDock() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-10 left-1/2 z-20 hidden -translate-x-1/2 justify-center px-2 lg:flex">
      <div className="pointer-events-auto">
        <SocialPill surface="darkSurface" />
      </div>
    </div>,
    document.body,
  );
}
