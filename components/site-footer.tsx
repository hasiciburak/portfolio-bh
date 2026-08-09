"use client";

import { BrandWordmark } from "@/components/brand-wordmark";
import { SocialPill } from "@/components/social-pill";
import { useAppPathname } from "@/lib/use-app-pathname";
import { useTranslation } from "@/components/language-provider";

export const SiteFooter = () => {
  const pathname = useAppPathname();
  const { dict } = useTranslation();

  const showSocialPill = pathname !== "/" && pathname !== "/tr";

  return (
    <footer
      aria-label="Site"
      className="mt-auto flex flex-col items-center gap-4 border-t border-zinc-900/[0.08] bg-zinc-50 px-4 py-10 dark:border-white/15 dark:bg-zinc-950"
    >
      {showSocialPill ? <SocialPill /> : null}
      <BrandWordmark />
      <p className="max-w-xl text-center text-xs text-zinc-500 dark:text-white/65">
        {dict.footer.copyright.replace("2026", new Date().getFullYear().toString())}
      </p>
    </footer>
  );
}
