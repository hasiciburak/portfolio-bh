import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { SiteSocialIcon } from "@/components/social-icons";

export interface SocialPillProps {
  className?: string;
}

const SHELL =
  "rounded-full border border-zinc-900/12 bg-white/85 px-4 py-2.5 text-zinc-900 shadow-[0_14px_36px_rgb(15_23_42_/_0.06)] backdrop-blur-xl backdrop-saturate-150 dark:border-[rgb(255_255_255_/_0.3)] dark:bg-[rgb(22_22_26_/_0.52)] dark:text-white dark:shadow-[0_12px_40px_rgb(0_0_0_/_0.35)] dark:backdrop-saturate-[135%]";

const LINK_TONE =
  "opacity-85 hover:opacity-100 dark:opacity-88 dark:hover:opacity-100";

export const SocialPill = ({ className = "" }: SocialPillProps) => {
  return (
    <nav aria-label="Social profiles" className={`inline-flex max-w-full ${SHELL} ${className}`}>
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
  );
}
