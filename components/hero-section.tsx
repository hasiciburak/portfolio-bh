import Image from "next/image";
import Link from "next/link";

import { HomeFixedSocialDock } from "@/components/home-fixed-social-dock";
import { SiteSocialIcon } from "@/components/social-icons";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";

const PLACEHOLDER = "#";

/** Figma [Mobile] Home (8:69) — exact copy */
const BIO_MOBILE =
  "Burak Haşıcı - Frontend Developer, Industrial Engineer & Self Paced UI/UX Designer based in Istanbul Turkey";

const glassPill =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-white/35 bg-white/10 px-4 py-2.5 text-base text-white shadow-[0_10px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150 transition-colors hover:bg-white/15";

const mobileResumePill =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-[rgba(170,170,170,0.1)] px-[15px] py-[10px] text-base text-white backdrop-blur-[2px] transition-colors hover:bg-[rgba(170,170,170,0.16)]";

const MOBILE_SOCIAL = SITE_SOCIAL_LINKS.slice(0, 4);

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 3v12m0 0l4-4m-4 4l-4-4M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface HeroSectionProps {
  variant?: "home";
}

export default function HeroSection({ variant = "home" }: HeroSectionProps) {
  const isHome = variant === "home";

  return (
    <section
      id="hero"
      className="flex w-full min-h-[100svh] flex-col overflow-x-clip scroll-mt-24 bg-zinc-950 font-sans text-white"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-16 pt-2 sm:pb-24 sm:pt-3 lg:pb-32 lg:pt-0">
        <div className="relative flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-6 sm:gap-8 lg:grid lg:min-h-[min(935px,100svh)] lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-20">
            <div
              className={[
                "relative flex w-full justify-center lg:col-start-2 lg:mr-[calc(50%-50vw)] lg:h-full lg:min-h-0 lg:justify-end lg:items-stretch",
              ].join(" ")}
            >
              <div
                className={[
                  "relative mx-auto aspect-square w-full max-w-[min(100%,304px)] overflow-hidden rounded-br-[148px] rounded-tl-[28px] rounded-tr-[28px] rounded-bl-[28px]",
                  "sm:max-w-[371px] sm:rounded-br-[185.5px] sm:rounded-tl-[32px] sm:rounded-tr-[32px] sm:rounded-bl-[32px]",
                  "lg:mx-0 lg:aspect-auto lg:h-full lg:min-h-[100svh] lg:max-w-none lg:w-[min(100%,708px)] lg:shrink-0 lg:rounded-none",
                ].join(" ")}
              >
                <Image
                  src="/images/hero-portrait.png"
                  alt="Burak Haşıcı portrait"
                  fill
                  priority
                  sizes="(max-width: 640px) 304px, (max-width: 1024px) 371px, 708px"
                  className="object-cover object-top max-lg:object-[50%_18%]"
                />
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-none flex-col lg:col-start-1 lg:row-start-1 lg:h-full lg:flex-1">
              <div className="flex w-full flex-col justify-start gap-5 sm:gap-6 lg:flex-1 lg:justify-center lg:gap-7">
                <h1
                  id="hero-heading"
                  className="max-w-xl font-nohemi font-extralight leading-[normal] tracking-tight text-[#fffffe] text-[44px] sm:text-[48px] lg:text-7xl xl:text-8xl"
                >
                  Hi! You&apos;re in
                  <br />
                  BH&apos;s Page
                </h1>

                <p className="max-w-xl text-sm leading-snug text-white/80 sm:text-base sm:leading-relaxed lg:hidden">
                  {BIO_MOBILE}
                </p>
                <p className="hidden max-w-xl text-lg leading-relaxed text-white/80 md:text-xl lg:block">
                  Burak Haşıcı — Software Developer, self-taught UI/UX designer based in Istanbul,
                  Turkey.
                </p>

                <Link href={PLACEHOLDER} className={`${glassPill} w-fit max-lg:hidden lg:inline-flex`}>
                  <span className="font-normal leading-tight">Download my resume</span>
                  <DownloadIcon className="size-4 shrink-0 opacity-90" />
                </Link>

                <div className="flex flex-col gap-4 sm:gap-5 lg:hidden">
                  <nav aria-label="Social profiles">
                    <ul className="flex flex-wrap items-center gap-4">
                      {MOBILE_SOCIAL.map(({ id, label, href }) => (
                        <li key={id}>
                          <a
                            href={href}
                            aria-label={label}
                            className="block text-white/90 transition-opacity hover:opacity-100"
                          >
                            <SiteSocialIcon id={id} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <Link href={PLACEHOLDER} className={`${mobileResumePill} inline-flex w-fit max-w-full`}>
                    <span className="text-center font-nohemi font-normal leading-[1.2]">
                      Download my resume
                    </span>
                    <DownloadIcon className="size-4 shrink-0 opacity-90" />
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
}
