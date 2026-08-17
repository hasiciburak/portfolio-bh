"use client";

import { CompanyLogoRow } from "@/components/company-logo";
import { localizedWorkExperience } from "@/lib/work-experience";
import { useTranslation } from "@/components/language-provider";

const WorkExperienceSection = () => {
  const { dict } = useTranslation();

  const entries = localizedWorkExperience(dict);

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
          {dict.work_experience.title}
        </h2>

        <div className="flex flex-col gap-14 sm:gap-16 lg:gap-[68px]">
          {entries.map((entry) => (
            <article key={entry.id} aria-labelledby={`work-${entry.id}-title`}>
              <CompanyLogoRow
                logos={entry.logos}
                className="mb-4 flex min-h-12 items-end gap-4 sm:mb-5 sm:min-h-[52px] sm:gap-5"
                logoClassName="h-auto max-w-full"
              />

              {/*
                The company names the card and the roles sit under it, so a return
                to the same product reads as one engagement with two stints rather
                than two cards wearing the same logo. Single-role entries keep the
                original two-line rhythm: role left, dates right in the large type.
              */}
              {/* Where the team sat rides along on the company's line rather than
                  taking one of its own: it is the answer to a single question a
                  reader has about a remote role, not a claim worth a whole row. */}
              <div className="mb-2 flex flex-col gap-x-6 gap-y-1 sm:mb-2.5 lg:flex-row lg:items-baseline lg:justify-between">
                <h3
                  id={`work-${entry.id}-title`}
                  className="font-nohemi text-base font-light leading-[1.2] text-zinc-700 dark:text-white/80"
                >
                  {entry.company}
                </h3>
                <p className="text-sm leading-[1.3] text-zinc-500 dark:text-white/50">
                  {entry.location}
                </p>
              </div>

              {/* Roomier between roles than inside one, so a stacked pair reads as
                  two stints and not four loose lines — on wide screens each role is
                  a single row already and the list can close back up. */}
              <div className="mb-5 flex flex-col gap-3 sm:mb-6 lg:gap-1.5">
                {entry.roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-8"
                  >
                    <p className="order-2 font-nohemi text-base font-light leading-[1.2] text-zinc-500 dark:text-white/55 lg:order-1">
                      {role.title}
                    </p>
                    <p className="order-1 whitespace-pre font-nohemi text-2xl font-black leading-[1.2] text-zinc-950 dark:text-white sm:text-[28px] lg:order-2 lg:text-[32px]">
                      {role.date}
                    </p>
                  </div>
                ))}
              </div>

              {/* One line on what the company does, held a step below the bullets in
                  size and colour — four of these five names mean nothing outside
                  their own market, and the bullets read differently once you know. */}
              <p className="mb-4 max-w-[68ch] text-sm leading-[1.5] text-zinc-500 dark:text-white/50 sm:mb-5 sm:text-base">
                {entry.context}
              </p>

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
};

export default WorkExperienceSection;

