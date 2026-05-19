import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["tr", "en"];
const defaultLocale = "en";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore internal/static files and directories
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // If it's the default locale (en) explicitly requested (e.g. /en or /en/projects),
    // redirect to the prefix-less version to keep it clean.
    const pathLocale = pathname.split("/")[1];
    if (pathLocale === defaultLocale) {
      const cleanPathname = pathname.replace(`/${defaultLocale}`, "") || "/";
      const url = new URL(cleanPathname, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Rewrite default locale prefix under the hood so the routing functions correctly
  const rewriteUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
  rewriteUrl.search = request.nextUrl.search;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    // Skip all static assets, api, and internal paths
    "/((?!api|_next/static|_next/image|images|companies|fonts|favicon.ico|manifest.webmanifest|apple-icon.png|icon.svg).*)",
  ],
};
