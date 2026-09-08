"use client";

import type { Activity } from "react-activity-calendar";

import { GithubActivityCalendar } from "@/components/github-activity-calendar";
import { useTranslation } from "@/components/language-provider";

export interface GithubGraphPanelProps {
  contributions: Activity[] | null;
  privateCommits: number;
  privateRepoCount: number;
}

const BCP47_BY_LOCALE: Record<string, string> = {
  en: "en-US",
  tr: "tr-TR",
};

export const GithubGraphPanel = ({
  contributions,
  privateCommits,
  privateRepoCount,
}: GithubGraphPanelProps) => {
  const { dict, lang } = useTranslation();
  const copy = dict.github_graph;
  const locale = BCP47_BY_LOCALE[lang] ?? "en-US";

  // Client work lives in private repositories, so a public-only calendar undercounts
  // the year badly. The split is the point of the section; the repository names are
  // deliberately not here, and never leave the server.
  //
  // Hidden rather than shown as zero when no token is configured: "0 in private
  // repos" would read as a claim about the year rather than about the deployment.
  const summary = privateCommits
    ? (privateRepoCount === 1
        ? copy.private_summary_one_repo
        : copy.private_summary
      )
        .replace("{{count}}", privateCommits.toLocaleString(locale))
        .replace("{{repos}}", privateRepoCount.toLocaleString(locale))
    : null;

  return (
    <section
      id="github-graph"
      /* No `content-visibility: auto` here: while this section is off-screen the
         browser reports it as empty, the document measures short, and ScrollSmoother
         clamps any jump past it well before it gets there. */
      className="isolate w-full scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-white"
      aria-labelledby="github-graph-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
        <h2
          id="github-graph-heading"
          className="mb-10 text-center font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:mb-12 sm:text-5xl lg:mb-16 lg:text-[48px]"
        >
          {copy.title}
        </h2>

        <div className="overflow-hidden rounded-[23px] bg-black px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
          {contributions ? (
            <>
              <GithubActivityCalendar
                contributions={contributions}
                locale={locale}
                labels={{
                  totalCount: copy.total_count,
                  less: copy.legend_less,
                  more: copy.legend_more,
                  dayTooltip: copy.day_tooltip,
                  dayTooltipOne: copy.day_tooltip_one,
                  emptyDayTooltip: copy.empty_day_tooltip,
                  profileLink: copy.profile_link,
                }}
              />
              {summary ? (
                <p className="mt-2 text-xs leading-[1.2] text-zinc-400">
                  {summary}
                </p>
              ) : null}
            </>
          ) : (
            <p className="py-12 text-center text-base text-zinc-400">
              {copy.error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
