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

export interface GithubActivityCalendarProps {
  contributions: Activity[];
}

const MIN_BLOCK_SIZE = 8;
const MAX_BLOCK_SIZE = 18;

function GraphSkeleton() {
  return (
    <div
      className="h-[200px] w-full animate-pulse rounded-xl bg-[#1b1b1b]"
      aria-hidden
    />
  );
}

function useResponsiveBlockSize(
  containerRef: RefObject<HTMLDivElement | null>,
  contributions: Activity[],
): number {
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

function ActivityCalendarInner({ contributions }: GithubActivityCalendarProps) {
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
      aria-label="View GitHub profile and contribution history"
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
          totalCount: "{{count}} activities in the last year",
          legend: { less: "Less", more: "More" },
        }}
        showWeekdayLabels={false}
        renderBlock={(block, activity) => {
          const label =
            activity.count === 0
              ? `No contributions on ${formatTooltipDate(activity.date)}`
              : `${activity.count} contribution${activity.count === 1 ? "" : "s"} on ${formatTooltipDate(activity.date)}`;

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

export function GithubActivityCalendar({ contributions }: GithubActivityCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldMount(true);
      return;
    }

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
      {shouldMount ? <MemoizedCalendar contributions={contributions} /> : <GraphSkeleton />}
    </div>
  );
}

function formatTooltipDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
