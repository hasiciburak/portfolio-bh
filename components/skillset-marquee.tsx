"use client";

import { useEffect, useRef, useState } from "react";

import type { SkillRowItem } from "@/lib/skillset-data";
import { SKILL_BRAND_COLORS, SKILL_ICON_COMPONENTS } from "@/lib/skillset-icons";

/**
 * Every lane on the page is driven by this one ticker rather than a timer apiece: the
 * frame does nothing but write a transform per lane, so the rows stay on the compositor
 * and cost nothing while the section is off-screen (lanes unregister via IntersectionObserver).
 */
interface Lane {
  track: HTMLElement;
  /** Width of a single copy of the item list, trailing gap included. */
  copyWidth: number;
  /** Distance the track has travelled, always normalised into `[0, copyWidth)`. */
  offset: number;
  /** Idle drift in px/s; negative drifts right. */
  speed: number;
  paused: boolean;
  /** Fling carry-over from a drag, decays back into the idle drift. */
  velocity: number;
}

const lanes = new Set<Lane>();
let frame = 0;
let lastFrameTime = 0;

const tick = (now: number) => {
  // Clamped so a backgrounded tab resuming doesn't jump the rows a full second forward.
  const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;

  for (const lane of lanes) {
    if (lane.copyWidth <= 0) continue;

    if (Math.abs(lane.velocity) > 2) {
      lane.offset -= lane.velocity * delta;
      lane.velocity *= Math.pow(0.0015, delta);
    } else {
      lane.velocity = 0;
      if (!lane.paused) lane.offset += lane.speed * delta;
    }

    lane.offset =
      ((lane.offset % lane.copyWidth) + lane.copyWidth) % lane.copyWidth;
    lane.track.style.transform = `translate3d(${-lane.offset}px, 0, 0)`;
  }

  frame = requestAnimationFrame(tick);
};

const registerLane = (lane: Lane) => {
  lanes.add(lane);
  if (!frame) {
    lastFrameTime = performance.now();
    frame = requestAnimationFrame(tick);
  }
};

const unregisterLane = (lane: Lane) => {
  lanes.delete(lane);
  if (lanes.size === 0 && frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
};

/** Same pill recipe as `TechChip` and the hero buttons, so the site keeps one chip. */
const SkillChip = ({ skill }: { skill: SkillRowItem }) => {
  const Icon = SKILL_ICON_COMPONENTS[skill.icon];
  const brand = SKILL_BRAND_COLORS[skill.icon];

  return (
    <div className="skill-chip group/chip flex shrink-0 items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/80 py-2 pl-3 pr-4 shadow-[0_1px_2px_rgba(9,9,11,0.04)] transition-colors hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/[0.08] sm:py-2.5 sm:pl-3.5 sm:pr-5">
      <span
        className="skill-chip-logo flex h-[22px] w-[22px] shrink-0 items-center justify-center sm:h-[26px] sm:w-[26px]"
        style={brand ? ({ "--brand": brand } as React.CSSProperties) : undefined}
      >
        <Icon size={22} className="h-full w-full" aria-hidden />
      </span>
      <span className="whitespace-nowrap text-[13px] font-medium leading-none text-zinc-700 transition-colors group-hover/chip:text-zinc-950 dark:text-white/70 dark:group-hover/chip:text-white sm:text-[15px]">
        {skill.name}
      </span>
    </div>
  );
};

export const SkillsetMarqueeRow = ({
  title,
  skills,
  reverse,
  reduceMotion,
}: {
  title: string;
  skills: SkillRowItem[];
  reverse: boolean;
  reduceMotion: boolean;
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLUListElement>(null);
  const laneRef = useRef<Lane | null>(null);
  /** Enough repeats to cover the widest viewport; measured, so a 4-item lane still fills. */
  const [copies, setCopies] = useState(2);
  /**
   * A row that already fits doesn't scroll. Looping four chips across a 1200px lane
   * shows the same logos twice on one screen, which reads as a bug rather than a marquee.
   */
  const [overflows, setOverflows] = useState(true);

  useEffect(() => {
    if (reduceMotion) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    const copy = copyRef.current;
    if (!viewport || !track || !copy) return;

    const lane: Lane = {
      track,
      copyWidth: 0,
      offset: 0,
      // Uniform perceived speed across lanes regardless of how much they hold.
      speed: reverse ? -34 : 34,
      paused: true,
      velocity: 0,
    };
    laneRef.current = lane;

    let visible = false;

    const measure = () => {
      const laneWidth = viewport.getBoundingClientRect().width;
      lane.copyWidth = copy.getBoundingClientRect().width;
      if (lane.copyWidth <= 0) return;

      const fits = lane.copyWidth <= laneWidth;
      setOverflows(!fits);

      if (fits) {
        lane.offset = 0;
        track.style.transform = "";
        setCopies(1);
        unregisterLane(lane);
        return;
      }

      setCopies(Math.max(2, Math.ceil(laneWidth / lane.copyWidth) + 1));
      if (visible) registerLane(lane);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(copy);
    resizeObserver.observe(viewport);

    // Off-screen lanes are unregistered outright — no frame cost when nobody's looking.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && lane.copyWidth > viewport.getBoundingClientRect().width) {
          registerLane(lane);
          lane.paused = false;
        } else {
          unregisterLane(lane);
        }
      },
      { rootMargin: "120px 0px" },
    );
    intersectionObserver.observe(viewport);

    const onVisibility = () => {
      lane.paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unregisterLane(lane);
      laneRef.current = null;
    };
  }, [reduceMotion, reverse, skills.length]);

  const setPaused = (paused: boolean) => {
    // Never resume into a backgrounded tab just because the cursor left the row.
    if (laneRef.current) laneRef.current.paused = paused || document.hidden;
  };

  const isHovering = useRef(false);

  const drag = useRef<{
    pointerId: number;
    startX: number;
    startOffset: number;
    lastX: number;
    lastTime: number;
    velocity: number;
  } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const lane = laneRef.current;
    if (!lane) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: lane.offset,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
    lane.velocity = 0;
    lane.paused = true;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const lane = laneRef.current;
    if (!state || !lane || state.pointerId !== event.pointerId) return;

    // Only claim the gesture once it's clearly horizontal, so a thumb swiping up the
    // page never gets stuck scrubbing a row. `touch-action: pan-y` handles the rest.
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      if (Math.abs(event.clientX - state.startX) < 6) return;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer already gone (fast flick, cancelled touch) — scrubbing still works.
      }
    }

    const elapsed = Math.max(event.timeStamp - state.lastTime, 1);
    state.velocity = ((event.clientX - state.lastX) / elapsed) * 1000;
    state.lastX = event.clientX;
    state.lastTime = event.timeStamp;

    lane.offset = state.startOffset - (event.clientX - state.startX);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const lane = laneRef.current;
    drag.current = null;
    if (!state || !lane) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    // Stale flings (finger held still before lifting) shouldn't launch the row.
    const fresh = event.timeStamp - state.lastTime < 120;
    lane.velocity = fresh ? Math.max(-2600, Math.min(2600, state.velocity)) : 0;
    lane.paused = event.pointerType === "mouse" && isHovering.current;
  };

  const label = (
    <div className="w-[76px] shrink-0 pr-1 font-nohemi text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-zinc-500 dark:text-white/45 sm:w-[124px] sm:text-xs lg:w-[148px]">
      {title}
    </div>
  );

  const items = skills.map((skill) => (
    <li key={skill.name}>
      <SkillChip skill={skill} />
    </li>
  ));

  if (reduceMotion) {
    return (
      <div className={ROW_SHELL}>
        {label}
        <ul className="flex min-w-0 flex-1 flex-wrap gap-2" role="list">
          {items}
        </ul>
      </div>
    );
  }

  return (
    <div className={ROW_SHELL}>
      {label}
      <div
        ref={viewportRef}
        data-static={overflows ? undefined : ""}
        className={`skillset-lane relative min-w-0 flex-1 touch-pan-y select-none overflow-hidden ${
          overflows ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onPointerEnter={() => {
          isHovering.current = true;
          setPaused(true);
        }}
        onPointerLeave={() => {
          isHovering.current = false;
          if (!drag.current) setPaused(false);
        }}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {Array.from({ length: copies }, (_, index) => (
            <ul
              key={index}
              ref={index === 0 ? copyRef : undefined}
              className="flex shrink-0 items-center gap-2 pr-2 sm:gap-3 sm:pr-3"
              role={index === 0 ? "list" : "presentation"}
              aria-hidden={index === 0 ? undefined : true}
            >
              {items}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dividers live on the container (`divide-y`) so they can't be confused by the
// per-row wrapper the entrance stagger needs.
const ROW_SHELL = "flex items-center gap-3 py-3 sm:gap-5 sm:py-3.5";
