"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

import { BrandWordmark } from "@/components/brand-wordmark";
import { ThemeSwitch } from "@/components/theme-switch";
import { LanguageSwitch } from "@/components/language-switch";
import { useTranslation } from "@/components/language-provider";
import { useAppPathname } from "@/lib/use-app-pathname";

import styles from "./site-navigation.module.css";

/*
 * Every surface below is light by default with a `dark:` override, so the header
 * paints in the right theme on the very first frame. It used to read a resolved
 * theme from next-themes behind a mounted gate, which forced a dark-first SSR
 * render that then swapped a frame after hydration — visible as a dark → light
 * flash on refresh and on every EN ↔ TR switch (the `[lang]` segment remounts
 * this subtree, so the gate reopened each time).
 */
const MENU_BUTTON =
  "rounded-lg p-2 text-zinc-950 hover:bg-zinc-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/50 dark:focus-visible:ring-offset-black/70";

const DRAWER_PANEL =
  "border-l border-zinc-200/90 bg-white text-zinc-950 shadow-[0_0_48px_rgb(0_0_0_/_.12)] dark:border-white/[0.15] dark:bg-zinc-950 dark:text-white dark:shadow-[0_0_48px_rgb(0_0_0_/_.45)]";

const DRAWER_LINK =
  "rounded-xl px-3 py-3 text-base font-medium text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35 dark:text-white dark:hover:bg-white/[0.08] dark:focus-visible:ring-white/35";

const DRAWER_LINK_ACTIVE = "bg-zinc-100 dark:bg-white/10";

const DRAWER_DIVIDER = "border-zinc-200/80 dark:border-white/15";

const DRAWER_LABEL =
  "mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-white/55";

const SEGMENT_FOCUS =
  "focus-visible:z-[2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-white/35 dark:focus-visible:ring-offset-zinc-950";

const MenuIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

const CloseIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

export const SiteNavigation = () => {
  const pathname = useAppPathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const { lang, dict } = useTranslation();

  const NAV_ITEMS = [
    { href: lang === "tr" ? "/tr" : "/", label: dict.navigation.home },
    { href: lang === "tr" ? "/tr/projects" : "/projects", label: dict.navigation.projects },
  ];

  useEffect(() => {
    const id = requestAnimationFrame(() => setPortalReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const pillNavClassName = [
    "grid w-full max-w-[24rem] shrink-0 gap-1 rounded-full p-1 sm:w-auto",
    styles.navShell,
    "font-sans text-zinc-950 dark:text-white",
  ].join(" ");

  const pillNavGridStyle = {
    gridTemplateColumns: `repeat(${NAV_ITEMS.length}, minmax(0, 1fr))`,
  } as const;

  const mobileMenu =
    menuOpen && portalReady ? (
      <>
        <button
          type="button"
          aria-label="Dismiss navigation menu"
          className="fixed inset-0 z-[80] bg-zinc-950/25 lg:hidden dark:bg-black/55"
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="mobile-main-nav"
          className={`fixed inset-y-0 right-0 z-[90] flex w-[min(100%,18rem)] flex-col lg:hidden ${DRAWER_PANEL}`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b px-4 py-4 ${DRAWER_DIVIDER}`}
          >
            <span className="text-sm font-medium opacity-90">Menu</span>
            <button
              type="button"
              className={MENU_BUTTON}
              onClick={() => setMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Main mobile" className="flex flex-1 flex-col gap-1 p-4">
            {NAV_ITEMS.map(({ href, label }) => {
              const isHomeLink = href === "/" || href === "/tr";
              const active = isHomeLink
                ? pathname === "/" || pathname === "/tr"
                : pathname === href || (pathname.startsWith(href) && href !== "/" && href !== "/tr");
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`${DRAWER_LINK} ${active ? DRAWER_LINK_ACTIVE : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className={`mt-auto border-t px-4 py-4 ${DRAWER_DIVIDER}`}>
            <div className="mb-4">
              <span className={DRAWER_LABEL}>
                {dict.navigation.appearance.toLowerCase() === "görünüm" ? "Dil" : "Language"}
              </span>
              <LanguageSwitch variant="drawer" />
            </div>
            <div>
              <span className={DRAWER_LABEL}>{dict.navigation.appearance}</span>
              <ThemeSwitch variant="drawer" />
            </div>
          </div>
        </div>
      </>
    ) : null;

  return (
    <header data-intro-chrome="" className="fixed inset-x-0 top-0 z-[65]">
      {/* Inner wrapper carries centering + horizontal padding so the outer fixed shell can span the full viewport. */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-6 lg:pb-4">
        <div className="flex min-h-11 items-center justify-between lg:hidden">
          <BrandWordmark />
          <button
            type="button"
            className={MENU_BUTTON}
            aria-expanded={menuOpen}
            aria-controls="mobile-main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Logo left + theme controls right — pill stays geometrically centered. */}
        <div className="relative hidden w-full lg:flex lg:min-h-[52px] lg:items-center lg:justify-center">
          <div className="pointer-events-none absolute left-0 top-1/2 z-[2] flex -translate-y-1/2 items-center">
            <div className="pointer-events-auto">
              <BrandWordmark />
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 top-1/2 z-[2] flex -translate-y-1/2 items-center gap-3">
            <div className="pointer-events-auto flex items-center gap-3">
              <LanguageSwitch variant="header" />
              <ThemeSwitch variant="header" />
            </div>
          </div>
          <nav
            aria-label="Main"
            style={pillNavGridStyle}
            className={`relative z-[1] ${pillNavClassName}`}
          >
            {NAV_ITEMS.map(({ href, label }) => {
              const isHomeLink = href === "/" || href === "/tr";
              const active = isHomeLink
                ? pathname === "/" || pathname === "/tr"
                : pathname === href || (pathname.startsWith(href) && href !== "/" && href !== "/tr");

              const textTone = active
                ? "font-bold text-zinc-950 dark:text-white"
                : "font-normal text-zinc-950/88 dark:text-white/88";

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    styles.segment,
                    active ? styles.segmentActive : "",
                    "flex min-h-[42px] min-w-0 items-center justify-center whitespace-nowrap rounded-full border border-transparent px-2 text-center text-base leading-normal",
                    textTone,
                    SEGMENT_FOCUS,
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {portalReady && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
