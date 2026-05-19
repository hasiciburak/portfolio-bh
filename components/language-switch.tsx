"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "./language-provider";

type LanguageSwitchProps = {
  variant: "header" | "drawer";
  isLightChrome: boolean;
};

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
};

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
};

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
};

const LANG_OPTIONS = [
  { id: "en" as const, label: "EN" },
  { id: "tr" as const, label: "TR" },
];

export const LanguageSwitch = ({ variant, isLightChrome }: LanguageSwitchProps) => {
  const { lang } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [hasMeasured, setHasMeasured] = useState(false);
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

  const activeIndex = Math.max(
    0,
    LANG_OPTIONS.findIndex((option) => option.id === lang),
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
    ? "grid w-full grid-cols-2 gap-1"
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

  const handleSelect = (targetLang: "en" | "tr") => {
    if (targetLang === lang) return;

    let newPathname = pathname;
    if (targetLang === "tr") {
      newPathname = `/tr${pathname}`;
    } else {
      if (pathname.startsWith("/tr/")) {
        newPathname = pathname.slice(3);
      } else if (pathname === "/tr") {
        newPathname = "/";
      }
    }

    router.push(newPathname);
  };

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Language selection"
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

      {LANG_OPTIONS.map(({ id, label }, index) => {
        const pressed = lang === id;
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
                : "flex size-9 items-center justify-center rounded-full text-xs font-semibold tracking-wider",
              pressed ? `${activeLabel} ${focusRing}` : `${inactive} ${focusRingInactive}`,
            ].join(" ")}
          >
            {isDrawer ? (
              <span className="truncate text-xs font-medium leading-none">{label === "EN" ? "English" : "Türkçe"}</span>
            ) : (
              <span>{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
