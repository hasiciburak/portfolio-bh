"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { BrandWordmark } from "@/components/brand-wordmark";
import { ThemeSwitch } from "@/components/theme-switch";
import { LanguageSwitch } from "@/components/language-switch";
import { SiteSocialIcon } from "@/components/social-icons";
import { useTranslation } from "@/components/language-provider";
import { buildContactMailto, contactAddress } from "@/lib/contact-mailto";
import { SITE_SOCIAL_LINKS } from "@/lib/social-links";
import { useAppPathname } from "@/lib/use-app-pathname";

import styles from "./site-navigation.module.css";

gsap.registerPlugin(ScrollSmoother);

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

const MENU_TAIL_LINK =
  "rounded-lg text-zinc-600 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:text-white/72 dark:hover:text-white dark:focus-visible:ring-white/30";

/*
 * The menu repeats the mobile hero's social set minus email, which gets its own
 * tappable line above the row — two mailto affordances a thumb apart is noise.
 */
const MENU_SOCIALS = SITE_SOCIAL_LINKS.slice(0, 4).filter(({ id }) => id !== "email");

const MENU_EMAIL = SITE_SOCIAL_LINKS.find(({ id }) => id === "email");

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

const ArrowIcon = ({ className }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h13m0 0l-5.5-5.5M18 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
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
  // `menuOpen` is intent; `menuMounted` is presence. They diverge while the
  // curtain animates back up — the overlay has to stay in the tree until the
  // close timeline finishes, or it would vanish instead of retracting.
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  const openMenu = () => {
    setMenuMounted(true);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!menuMounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // `overflow: hidden` alone does not stop ScrollSmoother — it drives the page
    // with its own transform on #smooth-content, so the page would keep gliding
    // behind an opaque curtain. Focus can leak the same way, hence `inert`.
    const wrapper = document.getElementById("smooth-wrapper");
    wrapper?.setAttribute("inert", "");
    ScrollSmoother.get()?.paused(true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      wrapper?.removeAttribute("inert");
      window.removeEventListener("keydown", onKeyDown);

      // The entrance intro owns the smoother while it plays; resuming here would
      // let the page scroll behind its curtain.
      const introMode = document.documentElement.dataset.intro;
      if (introMode !== "play" && introMode !== "reduced") {
        ScrollSmoother.get()?.paused(false);
      }
    };
  }, [menuMounted]);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!menuMounted || !overlay) return undefined;

    const rows = gsap.utils.toArray<HTMLElement>("[data-menu-row]", overlay);
    const tail = gsap.utils.toArray<HTMLElement>("[data-menu-tail]", overlay);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tl = gsap.timeline();

    if (menuOpen) {
      if (reduce) {
        tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "none" });
      } else {
        // Rows start their rise while the curtain is still ~40% out, so the
        // reveal is already under way when the surface lands rather than reading
        // as a second, separate animation once it stops.
        tl.fromTo(overlay, { yPercent: -100 }, { yPercent: 0, duration: 0.58, ease: "power4.inOut" })
          .fromTo(
            rows,
            { yPercent: 115 },
            { yPercent: 0, duration: 0.56, ease: "power3.out", stagger: 0.08 },
            0.26,
          )
          .fromTo(
            tail,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.06 },
            0.46,
          );
      }
    } else if (reduce) {
      tl.to(overlay, {
        autoAlpha: 0,
        duration: 0.15,
        ease: "none",
        onComplete: () => setMenuMounted(false),
      });
    } else {
      // Plain `to` tweens, not `fromTo`: an interrupted open leaves the rows part
      // way up, and the exit should pick them up wherever they are.
      tl.to(tail, { opacity: 0, duration: 0.18, ease: "power1.in" })
        .to(rows, { yPercent: -115, duration: 0.32, ease: "power2.in", stagger: 0.05 }, 0)
        .to(
          overlay,
          {
            yPercent: -100,
            duration: 0.48,
            ease: "power4.inOut",
            onComplete: () => setMenuMounted(false),
          },
          0.14,
        );
    }

    return () => {
      tl.kill();
    };
  }, [menuOpen, menuMounted]);

  const pillNavClassName = [
    "grid w-full max-w-[24rem] shrink-0 gap-1 rounded-full p-1 sm:w-auto",
    styles.navShell,
    "font-sans text-zinc-950 dark:text-white",
  ].join(" ");

  const pillNavGridStyle = {
    gridTemplateColumns: `repeat(${NAV_ITEMS.length}, minmax(0, 1fr))`,
  } as const;

  const mobileMenu = menuMounted ? (
    <div
      ref={overlayRef}
      id="mobile-main-nav"
      role="dialog"
      aria-modal="true"
      aria-label={dict.navigation.menu}
      className={`${styles.menuOverlay} lg:hidden`}
    >
      {/* Clears the fixed header, so the first row starts below the wordmark. */}
      <div aria-hidden className="h-[5.5rem] shrink-0" />

      <nav aria-label="Main mobile" className="min-h-0 flex-1 px-4">
        <ul className="font-nohemi font-light">
          {NAV_ITEMS.map(({ href, label }) => {
            const isHomeLink = href === "/" || href === "/tr";
            const active = isHomeLink
              ? pathname === "/" || pathname === "/tr"
              : pathname === href || (pathname.startsWith(href) && href !== "/" && href !== "/tr");
            return (
              <li key={href} className={styles.linkClip}>
                <Link
                  href={href}
                  data-menu-row
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    styles.linkRow,
                    active ? "" : styles.linkInactive,
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:focus-visible:ring-white/30",
                  ].join(" ")}
                >
                  <span className={styles.linkLabel}>{label}</span>
                  <ArrowIcon className={styles.linkArrow} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6">
        {/*
          One tap target, two jobs: the label commits to the action, the address
          under it is the specific detail a recruiter wants to copy or recognise
          before they tap. Splitting them would put two mailto links a thumb apart.
        */}
        {MENU_EMAIL ? (
          <a
            data-menu-tail
            href={buildContactMailto(
              MENU_EMAIL.href,
              dict.navigation.contact_subject,
              dict.navigation.contact_greeting,
            )}
            className={`${styles.contactRow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:focus-visible:ring-white/30`}
          >
            {/* One tap target: the label commits to the action, the address under
                it is the detail a recruiter wants to read or copy before tapping.
                The address shown is the bare one — the template lives in the href. */}
            <span className="min-w-0">
              <span className="block text-lg leading-tight">{dict.navigation.contact}</span>
              <span className="mt-1 block truncate text-xs leading-tight text-zinc-600 dark:text-white/60">
                {contactAddress(MENU_EMAIL.href)}
              </span>
            </span>
            <ArrowIcon className={styles.contactArrow} />
          </a>
        ) : null}

        {/*
          The switches use their compact `header` chrome rather than the labelled
          full-width `drawer` form — EN/TR and three theme glyphs are self-evident,
          and dropping the two uppercase captions gives the menu back ~90px.
        */}
        <ul data-menu-tail className="mt-5 flex items-center gap-4">
          {MENU_SOCIALS.map(({ id, label, href }) => (
            <li key={id}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className={`${MENU_TAIL_LINK} block p-1`}
              >
                <SiteSocialIcon id={id} className="h-6 w-6 shrink-0" />
              </a>
            </li>
          ))}
        </ul>

        {/* Own row, not beside the socials: the two pills are ~224px on their
            own, which overflows a 375px viewport once the icons are in front. */}
        <div data-menu-tail className="mt-4 flex items-center gap-2">
          <LanguageSwitch variant="header" />
          <ThemeSwitch variant="header" />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <header data-intro-chrome="" className="fixed inset-x-0 top-0 z-[65]">
      {/* Inner wrapper carries centering + horizontal padding so the outer fixed shell can span the full viewport. */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-6 lg:pb-4">
        <div className="flex min-h-11 items-center justify-between lg:hidden">
          <BrandWordmark />
          <button
            ref={triggerRef}
            type="button"
            className={MENU_BUTTON}
            aria-expanded={menuOpen}
            aria-controls="mobile-main-nav"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
          >
            <span className="sr-only">
              {menuOpen ? dict.navigation.close : dict.navigation.menu}
            </span>
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
