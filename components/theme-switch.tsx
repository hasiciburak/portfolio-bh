"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type ThemeSwitchProps = {
  variant: "header" | "drawer";
  /** When true (light chrome), invert control surfaces vs dark header. */
  isLightChrome: boolean;
};

type IndicatorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

gsap.registerPlugin(useGSAP);

function usePrefersReducedMotion(): boolean {
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

function measureRectAtIndex(
  container: HTMLDivElement,
  buttons: (HTMLButtonElement | null)[],
  index: number,
): IndicatorRect | null {
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

function applyIndicatorPosition(
  indicator: HTMLSpanElement,
  rect: IndicatorRect,
  animate: boolean,
  reduceMotion: boolean,
  hasPositioned: boolean,
): boolean {
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

function DesktopIcon({ className }: { className?: string }) {
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

function SunIcon({ className }: { className?: string }) {
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

function MoonIcon({ className }: { className?: string }) {
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

function getThemeId(theme: string | undefined): ThemeId {
  return THEME_OPTIONS.some((option) => option.id === theme) ? (theme as ThemeId) : "system";
}

export function ThemeSwitch({ variant, isLightChrome }: ThemeSwitchProps) {
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
      dependencies: [mounted, activeIndex, variant, reduceMotion, isLightChrome],
    },
  );

  const chromeHeader = isLightChrome
    ? "border-zinc-900/12 bg-white/85 text-zinc-900 shadow-[0_14px_36px_rgb(15_23_42_/_0.06)]"
    : "border-white/[0.22] bg-[rgb(22_22_26_/_0.52)] text-white shadow-[0_12px_40px_rgb(0_0_0_/_0.35)]";

  const chromeDrawerMuted = "border-zinc-200/90 bg-zinc-100 text-zinc-900";
  const chromeDrawerDark = "border-white/[0.15] bg-zinc-900 text-white";

  const inactiveHeader = isLightChrome
    ? "text-zinc-600 hover:text-zinc-950"
    : "text-white/72 hover:text-white";

  const inactiveDrawer = isLightChrome
    ? "text-zinc-600 hover:text-zinc-950"
    : "text-white/72 hover:text-white";

  const isDrawer = variant === "drawer";

  const chrome = isDrawer
    ? `relative w-full rounded-xl border p-1.5 ${isLightChrome ? chromeDrawerMuted : chromeDrawerDark}`
    : `relative inline-flex rounded-full border p-1.5 backdrop-blur-xl backdrop-saturate-150 ${chromeHeader}`;

  const layout = isDrawer
    ? "grid w-full grid-cols-3 gap-1"
    : "inline-flex items-center gap-1";

  const inactive = isDrawer ? inactiveDrawer : inactiveHeader;

  const indicatorSurface = isLightChrome
    ? "bg-zinc-900 shadow-sm"
    : "bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]";

  const indicatorRadius = isDrawer ? "rounded-lg" : "rounded-full";

  const activeLabel = "text-white";
  const focusRing = isLightChrome
    ? "focus-visible:ring-zinc-900/35"
    : "focus-visible:ring-white/40";
  const focusRingInactive = isLightChrome
    ? "focus-visible:ring-zinc-950/25"
    : "focus-visible:ring-white/30";

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
            indicatorSurface,
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
              pressed ? `${activeLabel} ${focusRing}` : `${inactive} ${focusRingInactive}`,
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