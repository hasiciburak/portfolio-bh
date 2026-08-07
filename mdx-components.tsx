import type { MDXComponents } from "mdx/types";

/**
 * Global MDX element styles. Required at the project root for `@next/mdx` to work
 * with the App Router. Maps markdown output onto the site's own type scale — the
 * same treatment used by `work-experience-section.tsx` — instead of pulling in
 * `@tailwindcss/typography`.
 */
const components: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-12 font-nohemi text-2xl font-bold leading-[1.2] tracking-tight text-zinc-950 first:mt-0 dark:text-white sm:mt-14 sm:text-[28px]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-nohemi text-lg font-bold leading-[1.25] text-zinc-950 dark:text-white sm:text-xl">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-[1.6] text-zinc-700 dark:text-white/80 sm:text-lg sm:leading-[1.6]">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-[1.6] text-zinc-700 marker:text-zinc-400 dark:text-white/80 dark:marker:text-white/40 sm:text-lg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-[1.6] text-zinc-700 marker:text-zinc-400 dark:text-white/80 dark:marker:text-white/40 sm:text-lg">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-950 dark:text-white">
      {children}
    </strong>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className="rounded-sm underline decoration-zinc-300 underline-offset-4 outline-none transition-colors hover:decoration-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/25 dark:decoration-white/30 dark:hover:decoration-white dark:focus-visible:ring-white/35"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-md border border-zinc-200/95 bg-zinc-50 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800 dark:border-white/12 dark:bg-white/[0.06] dark:text-white/90">
      {children}
    </code>
  ),
  hr: () => (
    <hr className="mt-10 border-t border-zinc-200/95 dark:border-white/12" />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
