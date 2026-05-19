import { GithubActivityCalendar } from "@/components/github-activity-calendar";
import { fetchGitHubContributions } from "@/lib/github-contributions";

const GithubGraphSection = async () => {
  const data = await fetchGitHubContributions();

  return (
    <section
      id="github-graph"
      className="isolate w-full scroll-mt-24 bg-zinc-50 font-sans text-zinc-950 [content-visibility:auto] dark:bg-zinc-950 dark:text-white"
      aria-labelledby="github-graph-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
        <h2
          id="github-graph-heading"
          className="mb-10 text-center font-nohemi text-[40px] font-bold leading-[1.2] tracking-tight text-zinc-950 dark:text-white sm:mb-12 sm:text-5xl lg:mb-16 lg:text-[48px]"
        >
          My Github Graph
        </h2>

        <div className="overflow-hidden rounded-[23px] bg-black px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
          {data ? (
            <GithubActivityCalendar contributions={data.contributions} />
          ) : (
            <p className="py-12 text-center text-base text-zinc-400">
              Unable to load GitHub activity. Please try again later.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default GithubGraphSection;

