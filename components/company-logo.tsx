import { Fragment } from "react";
import Image from "next/image";

import { NonpublicLogo } from "@/components/nonpublic-logo";
import type { WorkExperienceLogo } from "@/lib/work-experience";

/**
 * One company mark, wherever a role is shown.
 *
 * NonPublic's is drawn inline rather than fetched: its wordmark is a single flat
 * ink, so as a file it would vanish against one of the site's two grounds. Every
 * other mark carries its own colour and is served as an image.
 *
 * The home page names each logo for assistive tech; the CV page repeats the
 * company in text right beside it, so there it passes `decorative`.
 */
export const CompanyLogo = ({
  logo,
  className = "",
  decorative = false,
}: {
  logo: WorkExperienceLogo;
  className?: string;
  decorative?: boolean;
}) => {
  if (logo.id === "nonpublic") {
    return (
      <NonpublicLogo
        width={logo.width}
        height={logo.height}
        className={`text-zinc-950 dark:text-white ${className}`}
      />
    );
  }

  return (
    <Image
      src={logo.src}
      alt={decorative ? "" : logo.alt}
      width={logo.width}
      height={logo.height}
      sizes={`${logo.width}px`}
      className={`object-contain ${className}`}
    />
  );
};

/**
 * The marks an engagement is worn under, side by side. The rule between them is
 * what keeps two logos from reading as one: HqO's and ElephantApps' are both a
 * near-identical red, and butted together they look like a single lockup.
 */
export const CompanyLogoRow = ({
  logos,
  className = "",
  logoClassName = "",
  decorative = false,
}: {
  logos: WorkExperienceLogo[];
  className?: string;
  logoClassName?: string;
  decorative?: boolean;
}) => (
  <div className={className}>
    {logos.map((logo, index) => (
      <Fragment key={logo.id}>
        {index > 0 ? (
          <span
            aria-hidden
            // Short enough to read as a separator on both surfaces: the home page's
            // row is 48px tall, the CV's 28px, and a rule sized to either would
            // dominate the other.
            className="h-5 w-px shrink-0 self-center bg-zinc-900/15 dark:bg-white/20"
          />
        ) : null}
        <CompanyLogo
          logo={logo}
          className={logoClassName}
          decorative={decorative}
        />
      </Fragment>
    ))}
  </div>
);

export default CompanyLogo;
