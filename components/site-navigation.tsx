"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandWordmark } from "@/components/brand-wordmark";
import { ThemeSwitch } from "@/components/theme-switch";
import { useSiteChromeSurface } from "@/lib/use-site-chrome-surface";

import styles from "./site-navigation.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
] as const;

function MenuIcon({ className }: { className?: string }) {
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

function CloseIcon({ className }: { className?: string }) {
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

export function SiteNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const surface = useSiteChromeSurface();
  const isLightSurface = surface === "lightSurface";

  const shellClassName = isLightSurface ? styles.navShellLight : styles.navShellDark;

  const navTone = isLightSurface ? "font-sans text-zinc-950" : "font-sans text-white";

  const segmentTone = isLightSurface ? styles.segmentLight : styles.segmentDark;

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

  const menuBtnClasses = isLightSurface
    ? "rounded-lg p-2 text-zinc-950 hover:bg-zinc-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
    : "rounded-lg p-2 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/70";

  const drawerPanel =
    isLightSurface
      ? "border-l border-zinc-200/90 bg-white text-zinc-950 shadow-[0_0_48px_rgb(0_0_0_/_.12)]"
      : "border-l border-white/[0.15] bg-zinc-950 text-white shadow-[0_0_48px_rgb(0_0_0_/_.45)]";

  const drawerLinkActive = isLightSurface ? "bg-zinc-100" : "bg-white/10";

  const drawerLinkBase =
    isLightSurface
      ? "rounded-xl px-3 py-3 text-base font-medium text-zinc-900 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35"
      : "rounded-xl px-3 py-3 text-base font-medium text-white hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35";

  const pillNavClassName = [
    "grid w-full max-w-[24rem] shrink-0 gap-1 rounded-full p-1 sm:w-auto",
    shellClassName,
    navTone,
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
          className={`fixed inset-0 z-[80] lg:hidden ${isLightSurface ? "bg-zinc-950/25" : "bg-black/55"}`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          id="mobile-main-nav"
          className={`fixed inset-y-0 right-0 z-[90] flex w-[min(100%,18rem)] flex-col lg:hidden ${drawerPanel}`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b px-4 py-4 ${isLightSurface ? "border-zinc-200/80" : "border-white/15"}`}
          >
            <span className="text-sm font-medium opacity-90">Menu</span>
            <button
              type="button"
              className={menuBtnClasses}
              onClick={() => setMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Main mobile" className="flex flex-1 flex-col gap-1 p-4">
            {NAV_ITEMS.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`${drawerLinkBase} ${active ? drawerLinkActive : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div
            className={`mt-auto border-t px-4 py-4 ${
              isLightSurface ? "border-zinc-200/80" : "border-white/15"
            }`}
          >
            <span
              className={`mb-2 block text-xs font-medium uppercase tracking-wide ${
                isLightSurface ? "text-zinc-500" : "text-white/55"
              }`}
            >
              Appearance
            </span>
            <ThemeSwitch variant="drawer" isLightChrome={isLightSurface} />
          </div>
        </div>
      </>
    ) : null;

  return (
    <header className="fixed inset-x-0 top-0 z-[65]">
      {/* Inner wrapper carries centering + horizontal padding so the outer fixed shell can span the full viewport. */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-6 lg:pb-4">
        <div className="flex min-h-11 items-center justify-between lg:hidden">
          <BrandWordmark surface={surface} />
          <button
            type="button"
            className={menuBtnClasses}
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
              <BrandWordmark surface={surface} />
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 top-1/2 z-[2] flex -translate-y-1/2 items-center">
            <div className="pointer-events-auto">
              <ThemeSwitch variant="header" isLightChrome={isLightSurface} />
            </div>
          </div>
          <nav
            aria-label="Main"
            style={pillNavGridStyle}
            className={`relative z-[1] ${pillNavClassName}`}
          >
            {NAV_ITEMS.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);

              const textTone = isLightSurface
                ? active
                  ? "font-bold text-zinc-950"
                  : "font-normal text-zinc-950/88"
                : active
                  ? "font-bold text-white"
                  : "font-normal text-white/88";

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    styles.segment,
                    segmentTone,
                    active ? styles.segmentActive : "",
                    "flex min-h-[42px] min-w-0 items-center justify-center whitespace-nowrap rounded-full border border-transparent px-2 text-center text-base leading-normal",
                    textTone,
                    "focus-visible:z-[2] focus-visible:outline-none focus-visible:ring-2",
                    isLightSurface
                      ? "focus-visible:ring-teal-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50"
                      : "focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
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
