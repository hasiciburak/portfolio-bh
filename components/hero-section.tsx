"use client";

import Image from "next/image";

import { AvailabilityBadge } from "@/components/availability-badge";
import { HomeFixedSocialDock } from "@/components/home-fixed-social-dock";
import { ResumeDownloadButton } from "@/components/resume-download-button";
import { SiteSocialIcon } from "@/components/social-icons";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { useTranslation } from "@/components/language-provider";

const glassPill =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-zinc-900/18 bg-white/72 px-4 py-2.5 text-base text-zinc-950 shadow-[0_10px_40px_rgb(15_23_42_/_0.08),inset_0_1px_0_rgb(255_255_255_/_0.92),inset_0_-1px_0_rgb(15_23_42_/_0.06)] backdrop-blur-xl backdrop-saturate-150 transition-colors hover:bg-white/90 dark:border-white/35 dark:bg-white/10 dark:text-white dark:shadow-[0_10px_40px_rgb(0_0_0_/_0.18),inset_0_1px_0_rgb(255_255_255_/_0.35),inset_0_-1px_0_rgb(0_0_0_/_0.08)] dark:hover:bg-white/15";

const mobileResumePill =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-zinc-950/[0.065] px-[15px] py-[10px] text-base text-zinc-950 backdrop-blur-[2px] transition-colors hover:bg-zinc-950/[0.1] dark:bg-[rgba(170,170,170,0.1)] dark:text-white dark:hover:bg-[rgba(170,170,170,0.16)]";

const MOBILE_SOCIAL = SITE_SOCIAL_LINKS.slice(0, 4);

export interface HeroSectionProps {
  variant?: "home";
}

const HeroSection = ({ variant = "home" }: HeroSectionProps) => {
  const isHome = variant === "home";
  const { dict } = useTranslation();

  return (
    <section
      id="hero"
      className="flex w-full min-h-[100svh] flex-col overflow-x-clip scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-white"
      aria-labelledby="hero-heading"
    >
      <div className="flex w-full flex-1 flex-col pb-16 sm:pb-24 lg:pb-32">
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

                <ResumeDownloadButton
                  data-intro-rise=""
                  className={`${glassPill} w-fit max-lg:hidden lg:inline-flex`}
                  labelClassName="font-normal leading-tight"
                />

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

                  <ResumeDownloadButton
                    className={`${mobileResumePill} inline-flex w-fit max-w-full`}
                    labelClassName="text-center font-nohemi font-normal leading-[1.2]"
                  />
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

