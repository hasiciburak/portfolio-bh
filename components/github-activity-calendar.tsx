"use client";

import {
  cloneElement,
  memo,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";

import { GITHUB_PROFILE_URL } from "@/lib/github-contributions";
import {
  GITHUB_GRAPH_BLOCK_MARGIN,
  GITHUB_GRAPH_BLOCK_RADIUS,
  GITHUB_GRAPH_FONT_SIZE,
  GITHUB_GRAPH_THEME,
} from "@/lib/github-graph-theme";

export interface GithubActivityCalendarLabels {
  /** Supports the `{{count}}` placeholder the calendar fills in. */
  totalCount: string;
  less: string;
  more: string;
  /** Both support `{{count}}` and `{{date}}`. */
  dayTooltip: string;
  dayTooltipOne: string;
  emptyDayTooltip: string;
  profileLink: string;
}

export interface GithubActivityCalendarProps {
  contributions: Activity[];
  labels: GithubActivityCalendarLabels;
  /** BCP 47 tag for month names and tooltip dates. */
  locale: string;
}

const MIN_BLOCK_SIZE = 8;
const MAX_BLOCK_SIZE = 18;

const GraphSkeleton = () => {
  return (
    <div
      className="h-[200px] w-full animate-pulse rounded-xl bg-[#1b1b1b]"
      aria-hidden
    />
  );
}

const useResponsiveBlockSize = (
  containerRef: RefObject<HTMLDivElement | null>,
  contributions: Activity[],
): number => {
  const [blockSize, setBlockSize] = useState(12);
  const weekCount = Math.max(1, Math.ceil(contributions.length / 7));

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      const width = node.clientWidth;
      if (width <= 0) return;

      const size = Math.floor(
        (width - (weekCount - 1) * GITHUB_GRAPH_BLOCK_MARGIN) / weekCount,
      );
      setBlockSize(Math.max(MIN_BLOCK_SIZE, Math.min(size, MAX_BLOCK_SIZE)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef, weekCount]);

  return blockSize;
}

const ActivityCalendarInner = ({
  contributions,
  labels,
  locale,
}: GithubActivityCalendarProps) => {
  const sizeRef = useRef<HTMLDivElement>(null);
  const blockSize = useResponsiveBlockSize(sizeRef, contributions);

  const openProfile = () => {
    window.open(GITHUB_PROFILE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={sizeRef}
      role="link"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProfile();
        }
      }}
      className="github-graph-calendar w-full cursor-pointer text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
      aria-label={labels.profileLink}
    >
      <ActivityCalendar
        data={contributions}
        theme={GITHUB_GRAPH_THEME}
        colorScheme="dark"
        blockSize={blockSize}
        blockMargin={GITHUB_GRAPH_BLOCK_MARGIN}
        blockRadius={GITHUB_GRAPH_BLOCK_RADIUS}
        fontSize={GITHUB_GRAPH_FONT_SIZE}
        labels={{
          months: monthLabels(locale),
          totalCount: labels.totalCount,
          legend: { less: labels.less, more: labels.more },
        }}
        showWeekdayLabels={false}
        renderBlock={(block, activity) => {
          const template =
            activity.count === 0
              ? labels.emptyDayTooltip
              : activity.count === 1
                ? labels.dayTooltipOne
                : labels.dayTooltip;
          const label = template
            .replace("{{count}}", String(activity.count))
            .replace("{{date}}", formatTooltipDate(activity.date, locale));

          return cloneElement(block, {
            title: label,
            style: {
              ...block.props.style,
              transition: "none",
              stroke: "transparent",
            },
          });
        }}
      />
    </div>
  );
}

const MemoizedCalendar = memo(ActivityCalendarInner);

export const GithubActivityCalendar = (props: GithubActivityCalendarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="min-h-[200px] w-full">
      {shouldMount ? <MemoizedCalendar {...props} /> : <GraphSkeleton />}
    </div>
  );
}

/** The calendar ships English month names; these are the reader's own. */
const monthLabels = (locale: string): string[] => {
  const format = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  });

  return Array.from({ length: 12 }, (_, month) =>
    format.format(new Date(Date.UTC(2024, month, 1))),
  );
}

const formatTooltipDate = (isoDate: string, locale: string): string => {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
