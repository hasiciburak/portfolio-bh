"use client";

import Image from "next/image";

import { useTranslation } from "@/components/language-provider";
import { NonpublicLogo } from "@/components/nonpublic-logo";
import { ResumeDownloadButton } from "@/components/resume-download-button";
import { CV_EDUCATION, CV_LANGUAGE_IDS, CV_PHONE, CV_PHONE_HREF } from "@/lib/cv";
import { contactAddress } from "@/lib/contact-mailto";
import { SECTION_EYEBROW } from "@/lib/section-eyebrow";
import { SKILLSET_COLLABORATION, SKILLSET_ROWS } from "@/lib/skillset-data";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { WORK_EXPERIENCE_ENTRIES } from "@/lib/work-experience";

const EMAIL_LINK = SITE_SOCIAL_LINKS.find(({ id }) => id === "email");

/** Profiles, not contact methods — the same split the Person JSON-LD makes. */
const PROFILE_LINKS = SITE_SOCIAL_LINKS.filter(
  ({ id }) => id === "linkedIn" || id === "github",
);

const SECTION_HEADING =
  "font-nohemi text-[13px] font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-white/45";

/**
 * The CV as a page rather than a download.
 *
 * A PDF is a dead end in a browser tab: it cannot be linked into at a section,
 * it is invisible to search, and on a phone it arrives as a pinch-to-zoom
 * document. This carries the same content in the site's own type, keeps the PDF
 * one click away for anyone who needs a file to attach, and prints to something
 * close to that file.
 *
 * Nothing here is a second copy of the home page's facts: the roles come from
 * `WORK_EXPERIENCE_ENTRIES` and the stack from `SKILLSET_ROWS`, both merged with
 * their translations exactly the way their own sections do it. Only what the site
 * never said — education, languages, the phone number — is new, and it lives in
 * `lib/cv.ts`.
 */
export const CvDocument = () => {
  const { dict } = useTranslation();
  const copy = dict.cv;

  const roles = WORK_EXPERIENCE_ENTRIES.map((entry) => {
    const key = entry.id as keyof typeof dict.work_experience.entries;
    const localized = dict.work_experience.entries[key];
    return {
      ...entry,
      title: localized?.title || entry.title,
      date: localized?.date || entry.date,
      bullets: localized?.bullets || entry.bullets,
    };
  });

  const skillRows = SKILLSET_ROWS.map((row) => {
    const key = row.id as keyof typeof dict.skillset.categories;
    return { ...row, title: dict.skillset.categories[key] || row.title };
  });

  const education = CV_EDUCATION.map((entry) => {
    const key = entry.id as keyof typeof copy.education_entries;
    const localized = copy.education_entries[key];
    return {
      ...entry,
      school: localized?.school || entry.school,
      degree: localized?.degree || entry.degree,
      date: localized?.date || entry.date,
    };
  });

  const languages = CV_LANGUAGE_IDS.map((id) => ({
    id,
    ...copy.languages_spoken[id],
  }));

  return (
    <article className="cv-document mx-auto w-full max-w-5xl px-4 pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-28 lg:pt-36">
      <header>
        <p className={SECTION_EYEBROW}>{copy.eyebrow}</p>

        <h1 className="mt-3 font-nohemi text-[40px] font-bold leading-[1.1] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-[56px]">
          {dict.meta.title.split(" — ")[0]}
        </h1>

        <p className="mt-2 font-nohemi text-lg font-medium text-zinc-600 dark:text-white/70 sm:text-xl">
          {copy.role}
        </p>

        {/*
          Contact before anything else, in text a recruiter can copy without
          opening a mail client — the same reasoning as the contact section's
          plain-text address.
        */}
        <dl className="mt-6 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-zinc-500 dark:text-white/45">{copy.email_label}</dt>
            <dd className="mt-1">
              {EMAIL_LINK ? (
                <a
                  href={EMAIL_LINK.href}
                  className="rounded text-zinc-900 underline decoration-zinc-950/20 underline-offset-4 outline-none transition-colors hover:decoration-zinc-950/60 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white dark:decoration-white/25 dark:hover:decoration-white/70 dark:focus-visible:ring-white/35"
                >
                  {contactAddress(EMAIL_LINK.href)}
                </a>
              ) : null}
            </dd>
          </div>

          <div>
            <dt className="text-zinc-500 dark:text-white/45">{copy.phone_label}</dt>
            <dd className="mt-1">
              <a
                href={CV_PHONE_HREF}
                className="rounded text-zinc-900 underline decoration-zinc-950/20 underline-offset-4 outline-none transition-colors hover:decoration-zinc-950/60 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white dark:decoration-white/25 dark:hover:decoration-white/70 dark:focus-visible:ring-white/35"
              >
                {CV_PHONE}
              </a>
            </dd>
          </div>

          <div>
            <dt className="text-zinc-500 dark:text-white/45">{copy.location_label}</dt>
            <dd className="mt-1 text-zinc-900 dark:text-white">{copy.location}</dd>
          </div>

          <div>
            <dt className="text-zinc-500 dark:text-white/45">{copy.profiles_label}</dt>
            <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {PROFILE_LINKS.map(({ id, label, href }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded text-zinc-900 underline decoration-zinc-950/20 underline-offset-4 outline-none transition-colors hover:decoration-zinc-950/60 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white dark:decoration-white/25 dark:hover:decoration-white/70 dark:focus-visible:ring-white/35"
                >
                  {label}
                </a>
              ))}
            </dd>
          </div>
        </dl>

        {/* Hidden from print: paper cannot download, and the hint describes the
            very action the reader is already taking. */}
        <div className="cv-no-print mt-8 flex flex-wrap items-center gap-4">
          {/*
            The button owns behaviour, not appearance, so the chrome comes from
            here. It takes the solid pill the contact form's submit uses rather
            than the hero's glass one: that pill is built to sit on the hero's
            portrait, and on this plain ground its blur has nothing to blur.
          */}
          <ResumeDownloadButton
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-zinc-950 px-5 py-2.5 text-[15px] leading-tight text-white outline-none transition-colors hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-950/30 dark:bg-white dark:text-zinc-950 dark:hover:bg-white/90 dark:focus-visible:ring-white/40"
            labelClassName="font-medium leading-tight"
          />
          <p className="text-sm text-zinc-500 dark:text-white/45">{copy.print_hint}</p>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="cv-summary">
        <h2 id="cv-summary" className={SECTION_HEADING}>
          {copy.summary_heading}
        </h2>
        <p className="mt-4 max-w-[70ch] text-base leading-relaxed text-zinc-700 dark:text-white/75">
          {copy.summary}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="cv-experience">
        <h2 id="cv-experience" className={SECTION_HEADING}>
          {copy.experience_heading}
        </h2>

        <div className="mt-6 flex flex-col gap-10">
          {roles.map((role) => (
            <article
              key={role.id}
              // Keeps a role from being split across two sheets of paper.
              className="cv-block"
              aria-labelledby={`cv-role-${role.id}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3
                  id={`cv-role-${role.id}`}
                  className="font-nohemi text-lg font-bold leading-snug text-zinc-950 dark:text-white"
                >
                  {role.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-white/45">{role.date}</p>
              </div>

              {/* The mark is decoration next to a title that already names the
                  company, so it stays out of the accessibility tree. */}
              <div aria-hidden className="mt-3 flex h-7 items-center">
                {role.id === "nonpublic" ? (
                  <NonpublicLogo
                    width={role.logo.width}
                    height={role.logo.height}
                    className="h-auto max-h-7 w-auto text-zinc-950 dark:text-white"
                  />
                ) : (
                  <Image
                    src={role.logo.src}
                    alt=""
                    width={role.logo.width}
                    height={role.logo.height}
                    className="h-auto max-h-7 w-auto"
                  />
                )}
              </div>

              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-zinc-700 marker:text-zinc-400 dark:text-white/75 dark:marker:text-white/30">
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="cv-skills">
        <h2 id="cv-skills" className={SECTION_HEADING}>
          {copy.skills_heading}
        </h2>

        {/* Names only. The marquee's logos are the home page's job; here the point
            is a list an ATS and a reader can both scan. */}
        <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {skillRows.map((row) => (
            <div key={row.id} className="cv-block">
              <dt className="text-sm font-medium text-zinc-950 dark:text-white">
                {row.title}
              </dt>
              <dd className="mt-1 text-[15px] leading-relaxed text-zinc-600 dark:text-white/70">
                {row.skills.map(({ name }) => name).join(", ")}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-[15px] leading-relaxed text-zinc-600 dark:text-white/70">
          <span className="font-medium text-zinc-950 dark:text-white">
            {dict.skillset.collaboration_label}
          </span>{" "}
          {SKILLSET_COLLABORATION.join(", ")}
        </p>
      </section>

      <div className="mt-12 grid gap-12 sm:grid-cols-2">
        <section aria-labelledby="cv-education">
          <h2 id="cv-education" className={SECTION_HEADING}>
            {copy.education_heading}
          </h2>

          <ul className="mt-6 flex flex-col gap-5">
            {education.map((entry) => (
              <li key={entry.id} className="cv-block">
                <p className="font-nohemi text-base font-bold text-zinc-950 dark:text-white">
                  {entry.school}
                </p>
                <p className="mt-1 text-[15px] text-zinc-700 dark:text-white/75">
                  {entry.degree}
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-white/45">
                  {entry.date}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cv-languages">
          <h2 id="cv-languages" className={SECTION_HEADING}>
            {copy.languages_heading}
          </h2>

          <dl className="mt-6 flex flex-col gap-3">
            {languages.map(({ id, name, level }) => (
              <div key={id} className="flex items-baseline justify-between gap-6">
                <dt className="text-[15px] text-zinc-950 dark:text-white">{name}</dt>
                <dd className="text-sm text-zinc-500 dark:text-white/45">{level}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </article>
  );
};

export default CvDocument;
