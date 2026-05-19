import Image from "next/image";

import { NonpublicLogo } from "@/components/nonpublic-logo";
import { WORK_EXPERIENCE_ENTRIES } from "@/lib/work-experience";

export default function WorkExperienceSection() {
  return (
    <section
      id="work-experience"
      className="isolate w-full scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-white"
      aria-labelledby="work-experience-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
        <h2
          id="work-experience-heading"
          className="mb-10 text-center font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:mb-12 sm:text-5xl lg:mb-16 lg:text-[48px]"
        >
          Work Experience
        </h2>

        <div className="flex flex-col gap-14 sm:gap-16 lg:gap-[68px]">
          {WORK_EXPERIENCE_ENTRIES.map((entry) => (
            <article key={entry.id} aria-labelledby={`work-${entry.id}-title`}>
              <div className="mb-4 flex min-h-12 items-end sm:mb-5 sm:min-h-[52px]">
                {entry.id === "nonpublic" ? (
                  <NonpublicLogo
                    width={entry.logo.width}
                    height={entry.logo.height}
                    className="text-zinc-950 dark:text-white h-auto max-w-full"
                  />
                ) : (
                  <Image
                    src={entry.logo.src}
                    alt={entry.logo.alt}
                    width={entry.logo.width}
                    height={entry.logo.height}
                    sizes={`${entry.logo.width}px`}
                    className="h-auto max-w-full object-contain"
                  />
                )}
              </div>


              <div className="mb-5 flex flex-col gap-2 sm:mb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                <h3
                  id={`work-${entry.id}-title`}
                  className="order-2 font-nohemi text-base font-light leading-[1.2] text-zinc-700 dark:text-white/80 lg:order-1"
                >
                  {entry.title}
                </h3>
                <p className="order-1 whitespace-pre font-nohemi text-2xl font-black leading-[1.2] text-zinc-950 dark:text-white sm:text-[28px] lg:order-2 lg:text-[32px]">
                  {entry.date}
                </p>
              </div>

              <ul className="list-disc space-y-0 pl-5 text-base leading-[1.55] text-zinc-700 marker:text-zinc-700 dark:text-white/80 dark:marker:text-white/80 sm:text-lg lg:text-xl lg:leading-[1.5]">
                {entry.bullets.map((bullet) => (
                  <li key={bullet} className="pl-1 sm:pl-2">
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
