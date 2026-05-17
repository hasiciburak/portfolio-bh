import Image from "next/image";
import Link from "next/link";

import { HomeFixedSocialDock } from "@/components/home-fixed-social-dock";
import { SOCIAL_LINK_ITEMS } from "@/components/social-pill";

const PLACEHOLDER = "#";

/** Figma [Mobile] Home (8:69) — exact copy */
const BIO_MOBILE =
  "Burak Haşıcı - Frontend Developer, Industrial Engineer & Self Paced UI/UX Designer based in Istanbul Turkey";

const glassPill =
  "inline-flex items-center justify-center gap-2.5 rounded-full border border-white/35 bg-white/10 px-4 py-2.5 text-base text-white shadow-[0_10px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150 transition-colors hover:bg-white/15";

const mobileResumePill =
  "inline-flex items-center justify-center gap-2.5 rounded-full bg-[rgba(170,170,170,0.1)] px-[15px] py-[10px] text-base text-white backdrop-blur-[2px] transition-colors hover:bg-[rgba(170,170,170,0.16)]";

const MOBILE_SOCIAL = SOCIAL_LINK_ITEMS.slice(0, 4);

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
      className="flex w-full min-h-[100svh] flex-col overflow-x-clip bg-zinc-950 font-sans text-white"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-24 pt-2 sm:pb-28 sm:pt-3 lg:pb-32 lg:pt-0">
        <div className="relative flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-8 sm:gap-10 lg:grid lg:min-h-[min(935px,100svh)] lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-20">
            <div
              className={[
                "relative flex w-full justify-center lg:col-start-2 lg:mr-[calc(50%-50vw)] lg:h-full lg:min-h-0 lg:justify-end lg:items-stretch",
              ].join(" ")}
            >
              <div
                className={[
                  "relative mx-auto aspect-square w-full max-w-[371px] overflow-hidden rounded-br-[185.5px] rounded-tl-[32px] rounded-tr-[32px] rounded-bl-[32px]",
                  "lg:mx-0 lg:aspect-auto lg:h-full lg:min-h-[100svh] lg:max-w-none lg:w-[min(100%,708px)] lg:shrink-0 lg:rounded-none",
                ].join(" ")}
              >
                <Image
                  src="/images/hero-portrait.png"
                  alt="Burak Haşıcı portrait"
                  fill
                  priority
                  sizes="(max-width: 1024px) 371px, 708px"
                  className="object-cover object-top max-lg:object-[50%_18%]"
                />
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col lg:col-start-1 lg:row-start-1 lg:h-full">
              <div className="flex flex-1 flex-col justify-center gap-6 lg:gap-7">
                <h1
                  id="hero-heading"
                  className="max-w-xl font-nohemi font-extralight leading-[normal] tracking-tight text-[#fffffe] text-[48px] lg:text-7xl xl:text-8xl"
                >
                  Hi! You&apos;re in
                  <br />
                  BH&apos;s Page
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-white/80 lg:hidden">{BIO_MOBILE}</p>
                <p className="hidden max-w-xl text-lg leading-relaxed text-white/80 md:text-xl lg:block">
                  Burak Haşıcı — Software Developer, self-taught UI/UX designer based in Istanbul,
                  Turkey.
                </p>

                <Link href={PLACEHOLDER} className={`${glassPill} w-fit max-lg:hidden lg:inline-flex`}>
                  <span className="font-normal leading-tight">Download my resume</span>
                  <DownloadIcon className="size-4 shrink-0 opacity-90" />
                </Link>

                <nav
                  aria-label="Social profiles"
                  className="lg:hidden"
                >
                  <ul className="flex flex-wrap items-center gap-4">
                    {MOBILE_SOCIAL.map(({ label, href, icon }) => (
                      <li key={label}>
                        <a
                          href={href}
                          aria-label={label}
                          className="block text-white/90 transition-opacity hover:opacity-100"
                        >
                          {icon}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-10 flex justify-center lg:hidden">
                  <Link href={PLACEHOLDER} className={`${mobileResumePill}`}>
                    <span className="text-center font-nohemi font-normal leading-[1.2]">
                      Downlaod my resume
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
