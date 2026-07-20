import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The dashboard has been redirected to a new location. Every request is sent
// to the "we've moved" landing page, which links to the new address.
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/moved";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except the moved page itself, Next.js internals, and
  // static assets — otherwise we'd loop or block the landing page's styling.
  matcher: [
    "/((?!moved|_next/static|_next/image|favicon.ico|icon.png|storesight-logo.svg).*)",
  ],
};
