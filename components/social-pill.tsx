import type { SiteChromeSurface } from "@/lib/site-chrome-variant";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { SiteSocialIcon } from "@/components/social-icons";

export interface SocialPillProps {
  surface: SiteChromeSurface;
  className?: string;
}

export const SocialPill = ({ surface, className = "" }: SocialPillProps) => {
  const isLight = surface === "lightSurface";

  const shell = isLight
    ? "rounded-full border border-zinc-900/12 bg-white/85 px-4 py-2.5 shadow-[0_14px_36px_rgb(15_23_42_/_0.06)] backdrop-blur-xl backdrop-saturate-150 text-zinc-900"
    : "rounded-full border border-[rgb(255_255_255_/_0.3)] bg-[rgb(22_22_26_/_0.52)] px-4 py-2.5 shadow-[0_12px_40px_rgb(0_0_0_/_0.35)] backdrop-blur-xl backdrop-saturate-[135%] text-white";

  const linkHover = isLight ? "hover:opacity-100 opacity-85" : "hover:opacity-100 opacity-88";

  return (
    <nav aria-label="Social profiles" className={`inline-flex max-w-full ${shell} ${className}`}>
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {SITE_SOCIAL_LINKS.map(({ id, label, href }) => (
          <li key={id}>
            <a href={href} aria-label={label} className={`block transition-opacity ${linkHover}`} target="_blank">
              <SiteSocialIcon id={id} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
