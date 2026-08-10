"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/components/language-provider";
import { RESUME_FILENAME, RESUME_PATH } from "@/lib/resume";

import styles from "./resume-download-button.module.css";

type DownloadStatus = "idle" | "downloading" | "done";

/*
 * A `download` navigation reports nothing back — no start, no finish, no failure.
 * So the two states are timed rather than observed: long enough to register as
 * feedback, short enough that the label is back to being a call to action before
 * anyone looks at it again. A 130KB PDF off the edge is done well inside the first
 * window anyway; this is acknowledgement, not a progress bar.
 */
const DOWNLOADING_MS = 1100;
const DONE_MS = 1900;

const StatusIcon = () => {
  return (
    <svg
      className={styles.icon}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        className={styles.tray}
        d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={styles.arrow}
        d="M12 3v12m0 0l4-4m-4 4l-4-4"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={styles.check}
        d="M6 12.5l4 4 8-8.5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface ResumeDownloadButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"a">, "href" | "download" | "children"> {
  /** Pill chrome from the caller — this component owns behaviour, not appearance. */
  className?: string;
  labelClassName?: string;
}

export const ResumeDownloadButton = ({
  className = "",
  labelClassName = "",
  onClick,
  ...rest
}: ResumeDownloadButtonProps) => {
  const { dict } = useTranslation();
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Restart rather than queue, so a second tap does not leave the button stuck
    // in "Downloaded" from the first one.
    clearTimers();
    setStatus("downloading");
    timers.current.push(
      window.setTimeout(() => setStatus("done"), DOWNLOADING_MS),
      window.setTimeout(() => setStatus("idle"), DOWNLOADING_MS + DONE_MS),
    );

    onClick?.(event);
  };

  return (
    <>
      <a
        href={RESUME_PATH}
        download={RESUME_FILENAME}
        type="application/pdf"
        data-status={status}
        onClick={handleClick}
        className={`${styles.button} ${className}`}
        {...rest}
      >
      {/*
        All three labels live in one grid cell, so the pill is sized by the widest
        of them once and never resizes mid-transition. Both state labels are
        shorter than the idle one in either language, so the resting width is the
        idle width — the animation costs no layout.
      */}
        <span className={styles.labelStack}>
          <span data-label="idle" className={`${styles.label} ${labelClassName}`}>
            {dict.hero.download_resume}
          </span>
          {/*
            The transient labels are hidden from the accessibility tree so the
            link's accessible name stays "Download my resume" throughout — a name
            that changes mid-interaction is worse than no announcement at all.
          */}
          <span aria-hidden data-label="downloading" className={`${styles.label} ${labelClassName}`}>
            {dict.hero.downloading}
          </span>
          <span aria-hidden data-label="done" className={`${styles.label} ${labelClassName}`}>
            {dict.hero.downloaded}
          </span>
        </span>

        <StatusIcon />
      </a>

      {/*
        Outside the anchor on purpose. Nested inside, this text would be appended
        to the link's accessible name every time the status changed — the exact
        thing the aria-hidden labels above are avoiding. `sr-only` is absolutely
        positioned, so it costs no layout as a sibling.
      */}
      <span aria-live="polite" className="sr-only">
        {status === "downloading" ? dict.hero.downloading : null}
        {status === "done" ? dict.hero.downloaded : null}
      </span>
    </>
  );
};

export default ResumeDownloadButton;
