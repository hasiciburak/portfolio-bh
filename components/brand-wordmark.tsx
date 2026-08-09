import Link from "next/link";

import styles from "./brand-wordmark.module.css";

export const BrandWordmark = () => {
  return (
    <Link
      href="/"
      aria-label="Burak Haşıcı — home"
      className={`${styles.wordmarkLink} no-underline focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900`}
    >
      <span className={styles.wordmarkText}>#HSC</span>
    </Link>
  );
}
