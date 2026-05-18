import { SiteSocialIcon } from "@/components/social-icons";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";

const skeletonPulse =
  "animate-pulse motion-reduce:animate-none motion-reduce:opacity-80";

function ProjectSkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-zinc-200/95 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/[0.12] dark:bg-[rgb(22_22_26_/_0.45)] dark:shadow-[0_12px_40px_rgb(0_0_0_/_0.25)] dark:backdrop-saturate-[135%] ${className}`}
    >
      <div
        className={`aspect-[16/10] rounded-xl bg-zinc-200/85 dark:bg-white/[0.08] ${skeletonPulse}`}
      />
      <div className="mt-4 space-y-2.5">
        <div
          className={`h-4 w-[72%] rounded-md bg-zinc-300/95 dark:bg-white/[0.1] ${skeletonPulse}`}
        />
        <div
          className={`h-3 w-full rounded-md bg-zinc-200/90 dark:bg-white/[0.06] ${skeletonPulse}`}
        />
        <div
          className={`h-3 w-[88%] rounded-md bg-zinc-200/90 dark:bg-white/[0.06] ${skeletonPulse}`}
        />
      </div>
    </div>
  );
}

export function ProjectsComingSoon() {
  return (
    <div className="flex flex-col gap-12 lg:gap-14">
      <header className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-zinc-500 dark:text-white/45">
          Case studies
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
          Projects
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-white/70">
          Selected shipped work and deeper write-ups are on the way. I&apos;m polishing narratives,
          metrics, and visuals so each piece reads clearly end to end.
        </p>
      </header>

      <section aria-labelledby="projects-preview-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="projects-preview-heading"
            className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-white/45"
          >
            Preview
          </h2>
          <p className="text-xs text-zinc-400 dark:text-white/35">
            Placeholders — not active projects
          </p>
        </div>
        <div
          aria-hidden
          className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <ProjectSkeletonCard />
          <ProjectSkeletonCard />
          <ProjectSkeletonCard className="sm:col-span-2 xl:col-span-1" />
        </div>
      </section>

      <section
        aria-labelledby="projects-connect-heading"
        className="rounded-2xl border border-zinc-200/95 bg-white/80 px-5 py-6 shadow-sm backdrop-blur-xl dark:border-[rgb(255_255_255_/_0.22)] dark:bg-[rgb(22_22_26_/_0.52)] dark:shadow-[0_12px_40px_rgb(0_0_0_/_0.35)] dark:backdrop-saturate-[135%] sm:px-7 sm:py-8"
      >
        <h2
          id="projects-connect-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-white"
        >
          Meanwhile
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-white/65">
          Reach out on any channel below — same links as in the footer.
        </p>
        <nav aria-label="Social profiles" className="mt-6">
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-4">
            {SITE_SOCIAL_LINKS.map(({ id, label, href }) => (
              <li key={id}>
                <a
                  href={href}
                  aria-label={label}
                  className="group flex items-center gap-2.5 rounded-lg text-zinc-800 outline-none ring-offset-2 ring-offset-zinc-50 transition-colors hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white/88 dark:ring-offset-zinc-950 dark:hover:text-white dark:focus-visible:ring-white/35"
                >
                  <span className="rounded-lg border border-zinc-200/95 bg-white p-2 transition-colors group-hover:border-zinc-300 group-hover:bg-zinc-50 dark:border-white/15 dark:bg-white/[0.06] dark:group-hover:border-white/25 dark:group-hover:bg-white/[0.1]">
                    <SiteSocialIcon id={id} className="h-6 w-6 shrink-0" />
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white/90">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </div>
  );
}
