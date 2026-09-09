import { GlassSurface } from "@/components/glass-surface";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { SiteSocialIcon } from "@/components/social-icons";

export interface SocialPillProps {
  className?: string;
}

/*
 * The same liquid-glass capsule as the header pill — see `glass-surface.tsx`. On
 * the home page this dock floats over the scrolling page, which is exactly what
 * the lens wants behind it; in the footer it sits on a near-flat surface and
 * simply reads as the quieter, tinted version of the same material.
 *
 * The capsule owns the fill, rim, shadow and padding; the <nav> inside is type
 * colour and layout only.
 */
const LINK_TONE =
  "opacity-85 hover:opacity-100 dark:opacity-88 dark:hover:opacity-100";

export const SocialPill = ({ className = "" }: SocialPillProps) => {
  return (
    <GlassSurface className={`max-w-full rounded-full px-4 py-2.5 ${className}`}>
      <nav aria-label="Social profiles" className="inline-flex text-zinc-900 dark:text-white">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {SITE_SOCIAL_LINKS.map(({ id, label, href }) => (
            <li key={id}>
              <a href={href} aria-label={label} className={`block transition-opacity ${LINK_TONE}`} target="_blank">
                <SiteSocialIcon id={id} />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </GlassSurface>
  );
}
