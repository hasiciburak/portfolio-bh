"use client";

import Image from "next/image";
import Link from "next/link";

import { AvailabilityBadge } from "@/components/availability-badge";
import { HomeFixedSocialDock } from "@/components/home-fixed-social-dock";
import { SiteSocialIcon } from "@/components/social-icons";
import { scrollToSectionId } from "@/lib/scroll-to-section";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useTranslation } from "@/components/language-provider";

const glassPill =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-zinc-900/18 bg-white/72 px-4 py-2.5 text-base text-zinc-950 shadow-[0_10px_40px_rgb(15_23_42_/_0.08),inset_0_1px_0_rgb(255_255_255_/_0.92),inset_0_-1px_0_rgb(15_23_42_/_0.06)] backdrop-blur-xl backdrop-saturate-150 transition-colors hover:bg-white/90 dark:border-white/35 dark:bg-white/10 dark:text-white dark:shadow-[0_10px_40px_rgb(0_0_0_/_0.18),inset_0_1px_0_rgb(255_255_255_/_0.35),inset_0_-1px_0_rgb(0_0_0_/_0.08)] dark:hover:bg-white/15";

/*
 * The secondary CTA. Same shell as `glassPill` — radius, padding, blur, saturate —
 * so the two read as one family, minus the white fill and the drop shadow, which
 * is what makes it the quieter of the pair. An outline alone was too little: next
 * to a blurred, shadowed pill a bare hairline reads as unfinished rather than
 * secondary.
 */
const ghostPill =
  "inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900/20 bg-white/25 px-4 py-2.5 text-base leading-tight text-zinc-800 backdrop-blur-xl backdrop-saturate-150 transition-colors hover:border-zinc-900/35 hover:bg-white/45 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:border-white/25 dark:bg-white/[0.06] dark:text-white/85 dark:hover:border-white/40 dark:hover:bg-white/12 dark:hover:text-white dark:focus-visible:ring-white/35";

const mobileResumePill =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-zinc-950/[0.065] px-[15px] py-[10px] text-base text-zinc-950 backdrop-blur-[2px] transition-colors hover:bg-zinc-950/[0.1] dark:bg-[rgba(170,170,170,0.1)] dark:text-white dark:hover:bg-[rgba(170,170,170,0.16)]";

const MOBILE_SOCIAL = SITE_SOCIAL_LINKS.slice(0, 4);

/*
 * A speech bubble rather than the arrow this started as. The arrow described the
 * mechanism — the link scrolls down — where the bubble describes the destination,
 * which is what the label already says. It also keeps this button's mark distinct
 * from the sheet of paper on the CV link beside it.
 */
const TalkIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width={17}
    height={17}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <path
      d="M17.5 4.5h-11A2.5 2.5 0 0 0 4 7v6.5A2.5 2.5 0 0 0 6.5 16H8v3.5L12.5 16h5a2.5 2.5 0 0 0 2.5-2.5V7a2.5 2.5 0 0 0-2.5-2.5Z"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CvIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <path
      d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinejoin="round"
    />
    <path
      d="M14 3v5h5M9 13.5h6M9 17h4"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface HeroSectionProps {
  variant?: "home";
}

const HeroSection = ({ variant = "home" }: HeroSectionProps) => {
  const isHome = variant === "home";
  const reduceMotion = usePrefersReducedMotion();
  const { dict, lang } = useTranslation();

  const cvHref = lang === "tr" ? "/tr/cv" : "/cv";

  return (
    <section
      id="hero"
      /*
       * Full-viewport from `lg` only. The desktop hero earns its height from the
       * full-bleed portrait column; on mobile that portrait is a fixed 304px
       * square and the copy packs to the top, so forcing 100svh just parked ~300px
       * of dead space under the CTA. Sized to its content, the section now ends
       * with the next one showing — which reads as "keep going" rather than "the
       * page stopped".
       */
      className="flex w-full flex-col overflow-x-clip scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 lg:min-h-[100svh] dark:bg-zinc-950 dark:text-white"
      aria-labelledby="hero-heading"
    >
      {/*
        Bottom padding stays modest because the column above already centres its
        content in a full-viewport grid: whatever is set here lands on top of that
        centring slack rather than instead of it, and the two together are what
        opened a 568px hole between the CTA and the section below.
      */}
      <div className="flex w-full flex-1 flex-col pb-12 sm:pb-16 lg:pb-16">
        <div className="relative flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-6 sm:gap-8 lg:grid lg:min-h-[min(935px,100svh)] lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-20">
            <div
              className={[
                "relative flex w-full justify-center max-lg:px-4 lg:col-start-2 lg:h-full lg:min-h-0 lg:items-stretch",
              ].join(" ")}
            >
              <div
                data-intro-portrait=""
                className={[
                  "relative mx-auto aspect-square w-full max-w-[min(100%,304px)] overflow-hidden rounded-br-[148px] rounded-tl-[28px] rounded-tr-[28px] rounded-bl-[28px]",
                  "sm:max-w-[371px] sm:rounded-br-[185.5px] sm:rounded-tl-[32px] sm:rounded-tr-[32px] sm:rounded-bl-[32px]",
                  "lg:mx-0 lg:aspect-auto lg:h-full lg:min-h-[100svh] lg:w-full lg:max-w-none lg:shrink-0 lg:rounded-none",
                ].join(" ")}
              >
                <Image
                  src="/images/hero-portrait.png"
                  alt="Burak Haşıcı portrait"
                  fill
                  priority
                  sizes="(max-width: 640px) 304px, (max-width: 1024px) 371px, 50vw"
                  className="object-cover object-top max-lg:object-[50%_18%]"
                />
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-none flex-col px-4 lg:col-start-1 lg:row-start-1 lg:h-full lg:flex-1">
              <div className="flex w-full flex-col justify-start gap-5 sm:gap-6 lg:flex-1 lg:justify-center lg:gap-7">
                {/*
                  First `[data-intro-rise]` in the DOM, so the intro's staggered
                  rise starts here and cascades down through the bio and the CTA.
                */}
                <AvailabilityBadge data-intro-rise="" className="w-fit" />

                <h1
                  id="hero-heading"
                  className="max-w-xl font-nohemi font-extralight leading-[normal] tracking-tight text-zinc-950 text-[44px] sm:text-[48px] lg:text-7xl xl:text-8xl dark:text-[#fffffe]"
                >
                  {/*
                    One block span per line — replaces the previous `<br>` — so the
                    entrance intro can curtain-wipe each line independently. Block
                    spans produce the same line boxes as the <br> did, so the h1's
                    measured height is unchanged (ScrollSmoother reads it for pin
                    distances).
                  */}
                  <span data-intro-line="" className="block">
                    {dict.hero.title_part1}
                  </span>
                  <span data-intro-line="" className="block">
                    {dict.hero.title_part2}
                  </span>
                </h1>

                {/* Figma [Mobile] Home (8:69) — copy lives in dictionaries/*.json under hero.bio_mobile */}
                <p
                  data-intro-rise=""
                  className="max-w-xl text-sm leading-snug text-zinc-600 dark:text-white/80 sm:text-base sm:leading-relaxed lg:hidden"
                >
                  {dict.hero.bio_mobile}
                </p>
                <p
                  data-intro-rise=""
                  className="hidden max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-white/80 md:text-xl lg:block"
                >
                  {dict.hero.bio_desktop}
                </p>

                {/*
                  Two CTAs, deliberately unequal. The CV keeps the glass pill;
                  talking is a quieter outline link, because a reader who is ready
                  to write does not need persuading and one loud button beside
                  another leaves neither looking like the next step.

                  It sends the reader to the CV page rather than handing over the
                  PDF. A download asks for the largest commitment at the moment of
                  least interest — before anything on the page has been read — and
                  the file is still one click away once they are there.
                */}
                <div
                  data-intro-rise=""
                  className="flex w-fit items-center gap-3 max-lg:hidden"
                >
                  <Link
                    href={cvHref}
                    className={`group/cv ${glassPill} w-fit leading-tight lg:inline-flex`}
                  >
                    {dict.hero.view_cv}
                    <CvIcon className="shrink-0 text-zinc-500 transition-colors group-hover/cv:text-zinc-800 dark:text-white/55 dark:group-hover/cv:text-white" />
                  </Link>
                  {/*
                    The `href` stays real so the link survives without JS and can
                    be opened in a new tab; the handler only takes over when it can
                    do better, which on this page means handing the target to
                    ScrollSmoother rather than letting the browser jump.
                  */}
                  <a
                    href="#contact"
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSectionId("contact", reduceMotion);
                    }}
                    className={`group/talk ${ghostPill}`}
                  >
                    {dict.navigation.contact}
                    <TalkIcon className="shrink-0 text-zinc-500 transition-colors group-hover/talk:text-zinc-800 dark:text-white/55 dark:group-hover/talk:text-white" />
                  </a>
                </div>

                <div data-intro-rise="" className="flex flex-col gap-4 sm:gap-5 lg:hidden">
                  <nav aria-label="Social profiles">
                    <ul className="flex flex-wrap items-center gap-4">
                      {MOBILE_SOCIAL.map(({ id, label, href }) => (
                        <li key={id}>
                          <a
                            href={href}
                            aria-label={label}
                            className="block text-zinc-700 transition-opacity hover:opacity-100 dark:text-white/90"
                            target="_blank"
                          >
                            <SiteSocialIcon id={id} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <Link
                    href={cvHref}
                    className={`${mobileResumePill} inline-flex w-fit max-w-full text-center font-nohemi leading-[1.2]`}
                  >
                    {dict.hero.view_cv}
                    <CvIcon className="shrink-0 text-zinc-500 dark:text-white/70" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {isHome ? <HomeFixedSocialDock /> : null}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

