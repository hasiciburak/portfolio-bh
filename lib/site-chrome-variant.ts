export type SiteChromeSurface = "lightSurface" | "darkSurface";

export const surfaceFromResolvedTheme = (
  resolvedTheme: string | undefined,
): SiteChromeSurface => {
  // Dark-first default while `resolvedTheme` is undefined (SSR / pre-hydration).
  return resolvedTheme === "light" ? "lightSurface" : "darkSurface";
};
