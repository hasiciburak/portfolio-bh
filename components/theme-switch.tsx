"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type ThemeSwitchProps = {
  variant: "header" | "drawer";
};

/*
 * Surfaces are light by default and overridden under `dark:`, rather than picked
 * from a JS-resolved theme. next-themes stamps `.dark` on <html> before the body
 * paints, so the control is already the right colour on the very first frame —
 * a resolved-theme prop could not be, and the swap read as a dark → light flash.
 */
const CHROME_HEADER =
  "border-zinc-900/12 bg-white/85 text-zinc-900 shadow-[0_14px_36px_rgb(15_23_42_/_0.06)] dark:border-white/[0.22] dark:bg-[rgb(22_22_26_/_0.52)] dark:text-white dark:shadow-[0_12px_40px_rgb(0_0_0_/_0.35)]";

const CHROME_DRAWER =
  "border-zinc-200/90 bg-zinc-100 text-zinc-900 dark:border-white/[0.15] dark:bg-zinc-900 dark:text-white";

const INACTIVE_LABEL =
  "text-zinc-600 hover:text-zinc-950 dark:text-white/72 dark:hover:text-white";

const INDICATOR_SURFACE =
  "bg-zinc-900 shadow-sm dark:bg-white/18 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]";

const FOCUS_RING_ACTIVE =
  "focus-visible:ring-zinc-900/35 dark:focus-visible:ring-white/40";

const FOCUS_RING_INACTIVE =
  "focus-visible:ring-zinc-950/25 dark:focus-visible:ring-white/30";

type IndicatorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

gsap.registerPlugin(useGSAP);

const usePrefersReducedMotion = (): boolean => {
  const [reduce, setReduce] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduce;
}

const measureRectAtIndex = (
  container: HTMLDivElement,
  buttons: (HTMLButtonElement | null)[],
  index: number,
): IndicatorRect | null => {
  const activeButton = buttons[index];
  if (!activeButton) return null;

  const containerRect = container.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();

  return {
    left: buttonRect.left - containerRect.left,
    top: buttonRect.top - containerRect.top,
    width: buttonRect.width,
    height: buttonRect.height,
  };
}

const applyIndicatorPosition = (
  indicator: HTMLSpanElement,
  rect: IndicatorRect,
  animate: boolean,
  reduceMotion: boolean,
  hasPositioned: boolean,
): boolean => {
  gsap.killTweensOf(indicator);

  const props = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };

  const shouldTween = animate && !reduceMotion && hasPositioned;

  if (shouldTween) {
    gsap.to(indicator, {
      ...props,
      duration: 0.3,
      ease: "power2.inOut",
      overwrite: "auto",
      force3D: true,
    });
  } else {
    gsap.set(indicator, props);
  }

  return true;
}

const DesktopIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth={1.75}
      />
      <path
        d="M8 20h8"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

const SunIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.75} />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

const MoonIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 13.03A8.038 8.038 0 0112.94 4a8 8 0 108 8.93l.06.1z"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}

const THEME_OPTIONS = [
  { id: "system" as const, label: "System", Icon: DesktopIcon },
  { id: "light" as const, label: "Light", Icon: SunIcon },
  { id: "dark" as const, label: "Dark", Icon: MoonIcon },
];

type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

const getThemeId = (theme: string | undefined): ThemeId => {
  return THEME_OPTIONS.some((option) => option.id === theme) ? (theme as ThemeId) : "system";
}

export const ThemeSwitch = ({ variant }: ThemeSwitchProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hasMeasured, setHasMeasured] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("system");
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasPositionedRef = useRef(false);
  const prevActiveIndexRef = useRef(-1);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setSelectedTheme(getThemeId(theme)));
    return () => cancelAnimationFrame(id);
  }, [mounted, theme]);

  // Defer stored theme until after mount so SSR and hydration agree (next-themes).
  const activeId = mounted ? selectedTheme : "system";
  const activeIndex = Math.max(
    0,
    THEME_OPTIONS.findIndex((option) => option.id === activeId),
  );

  useGSAP(
    (_, contextSafe) => {
      const container = containerRef.current;
      const indicator = indicatorRef.current;
      if (!mounted || !container || !indicator) return undefined;

      const safeMeasure = contextSafe ?? (<T extends (index: number, animate: boolean) => void>(fn: T) => fn);
      const safeSnap = contextSafe ?? (<T extends () => void>(fn: T) => fn);

      const measureAtIndex = safeMeasure((index: number, animate: boolean) => {
        const rect = measureRectAtIndex(container, itemRefs.current, index);
        if (!rect) return;

        const positioned = applyIndicatorPosition(
          indicator,
          rect,
          animate,
          reduceMotion,
          hasPositionedRef.current,
        );

        if (positioned) {
          hasPositionedRef.current = true;
          setHasMeasured(true);
        }
      });

      const selectionChanged = prevActiveIndexRef.current !== activeIndex;
      prevActiveIndexRef.current = activeIndex;

      if (selectionChanged) {
        measureAtIndex(activeIndex, hasPositionedRef.current);
      } else if (!hasPositionedRef.current) {
        measureAtIndex(activeIndex, false);
      } else if (!gsap.isTweening(indicator)) {
        measureAtIndex(activeIndex, false);
      }

      const snapMeasure = safeSnap(() => {
        if (gsap.isTweening(indicator)) return;
        measureAtIndex(activeIndex, false);
      });

      const resizeObserver = new ResizeObserver(snapMeasure);
      resizeObserver.observe(container);
      itemRefs.current.forEach((button) => {
        if (button) resizeObserver.observe(button);
      });

      window.addEventListener("resize", snapMeasure);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", snapMeasure);
      };
    },
    {
      scope: containerRef,
      dependencies: [mounted, activeIndex, variant, reduceMotion],
    },
  );

  const isDrawer = variant === "drawer";

  const chrome = isDrawer
    ? `relative w-full rounded-xl border p-1.5 ${CHROME_DRAWER}`
    : `relative inline-flex rounded-full border p-1.5 backdrop-blur-xl backdrop-saturate-150 ${CHROME_HEADER}`;

  const layout = isDrawer
    ? "grid w-full grid-cols-3 gap-1"
    : "inline-flex items-center gap-1";

  const indicatorRadius = isDrawer ? "rounded-lg" : "rounded-full";

  const handleSelect = (id: ThemeId) => {
    setSelectedTheme(id);
    setTheme(id);
  };

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Color theme"
      className={[chrome, layout].join(" ")}
    >
      {mounted ? (
        <span
          ref={indicatorRef}
          aria-hidden
          className={[
            "pointer-events-none absolute left-0 top-0 z-0 box-border will-change-transform",
            indicatorRadius,
            INDICATOR_SURFACE,
            hasMeasured ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      ) : null}

      {THEME_OPTIONS.map(({ id, label, Icon }, index) => {
        const pressed = activeId === id;
        return (
          <button
            key={id}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={pressed}
            onClick={() => handleSelect(id)}
            className={[
              "relative z-[1] min-w-0 outline-none transition-colors duration-200 focus-visible:ring-2",
              isDrawer
                ? "flex h-9 items-center justify-center gap-1.5 rounded-lg px-2"
                : "flex size-9 items-center justify-center rounded-full",
              pressed
                ? `text-white ${FOCUS_RING_ACTIVE}`
                : `${INACTIVE_LABEL} ${FOCUS_RING_INACTIVE}`,
            ].join(" ")}
          >
            <Icon className="size-[18px] shrink-0" />
            {isDrawer ? (
              <span className="truncate text-xs font-medium leading-none">{label}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}