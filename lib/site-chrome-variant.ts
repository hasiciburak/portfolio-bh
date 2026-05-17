export type SiteChromeSurface = "lightSurface" | "darkSurface";

export function surfaceFromPathname(pathname: string): SiteChromeSurface {
  if (pathname.startsWith("/projects") || pathname.startsWith("/contact")) {
    return "lightSurface";
  }

  return "darkSurface";
}
