"use client";

import { usePathname } from "next/navigation";

import { BrandWordmark } from "@/components/brand-wordmark";
import { SocialPill } from "@/components/social-pill";
import { useSiteChromeSurface } from "@/lib/use-site-chrome-surface";
import { useTranslation } from "@/components/language-provider";

export const SiteFooter = () => {
  const pathname = usePathname();
  const surface = useSiteChromeSurface();
  const { dict } = useTranslation();

  const surfaceBg =
    surface === "lightSurface" ? "bg-zinc-50" : "bg-zinc-950";

  const borderMuted = surface === "lightSurface"
    ? "border-t border-zinc-900/[0.08]"
    : "border-t border-white/15";

  const mutedText = surface === "lightSurface" ? "text-zinc-500" : "text-white/65";

  const showSocialPill = pathname !== "/" && pathname !== "/tr";

  return (
    <footer
      aria-label="Site"
      className={`mt-auto flex flex-col items-center gap-4 px-4 py-10 ${surfaceBg} ${borderMuted}`}
    >
      {showSocialPill ? <SocialPill surface={surface} /> : null}
      <BrandWordmark surface={surface} />
      <p className={`max-w-xl text-center text-xs ${mutedText}`}>
        {dict.footer.copyright.replace("2026", new Date().getFullYear().toString())}
      </p>
    </footer>
  );
}
