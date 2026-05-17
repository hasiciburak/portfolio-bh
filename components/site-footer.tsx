"use client";

import { usePathname } from "next/navigation";

import { BrandWordmark } from "@/components/brand-wordmark";
import { SocialPill } from "@/components/social-pill";
import { surfaceFromPathname } from "@/lib/site-chrome-variant";

export function SiteFooter() {
  const pathname = usePathname();
  const surface = surfaceFromPathname(pathname);

  const borderMuted = surface === "lightSurface"
    ? "border-t border-zinc-900/[0.08]"
    : "border-t border-white/15";

  const mutedText = surface === "lightSurface" ? "text-zinc-500" : "text-white/65";

  const showSocialPill = pathname !== "/";

  return (
    <footer
      aria-label="Site"
      className={`mt-auto flex flex-col items-center gap-4 px-4 py-10 ${borderMuted}`}
    >
      {showSocialPill ? <SocialPill surface={surface} /> : null}
      <BrandWordmark surface={surface} />
      <p className={`max-w-xl text-center text-xs ${mutedText}`}>
        © {new Date().getFullYear()} Burak Haşıcı. All rights reserved.
      </p>
    </footer>
  );
}
