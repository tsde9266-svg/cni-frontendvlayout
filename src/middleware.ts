import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── WordPress legacy URL patterns → new CNI URL patterns ──────────────────
// Add any WP URL patterns you had here.
// This runs at the Edge so it's extremely fast — no DB lookup needed
// for the most common patterns.

const WP_REDIRECTS: Record<string, string> = {
  // Example WordPress URL patterns:
  // '/2024/01/article-slug/': '/article/article-slug',
  // '/?p=123': '/article/article-slug',  (add manually per article)
};

// WordPress category URL pattern: /?cat=N or /category/name
const WP_CATEGORY_PATTERN  = /^\/category\/([^/]+)\/?$/;
// WordPress tag pattern
const WP_TAG_PATTERN        = /^\/tag\/([^/]+)\/?$/;
// WordPress date archive: /2024/01/slug
const WP_DATE_SLUG_PATTERN  = /^\/\d{4}\/\d{2}\/([^/]+)\/?$/;
// WordPress page pattern: /page-slug/
const WP_PAGE_PATTERN       = /^\/([^/]+)\/?$/;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Static redirect table ─────────────────────────────────────────────
  if (WP_REDIRECTS[pathname]) {
    return NextResponse.redirect(
      new URL(WP_REDIRECTS[pathname], request.url), { status: 301 }
    );
  }

  // ── WordPress ?p=ID (single post by ID) ───────────────────────────────
  // We can't resolve by ID at the edge, so redirect to homepage
  // The API's seo_redirects table handles the proper redirect server-side
  if (searchParams.get('p')) {
    return NextResponse.redirect(new URL('/', request.url), { status: 301 });
  }

  // ── WordPress date archive: /2024/01/slug → /article/slug ────────────
  const dateSlugMatch = pathname.match(WP_DATE_SLUG_PATTERN);
  if (dateSlugMatch) {
    return NextResponse.redirect(
      new URL(`/article/${dateSlugMatch[1]}`, request.url),
      { status: 301 }
    );
  }

  // ── WordPress feed ────────────────────────────────────────────────────
  if (pathname === '/feed/' || pathname === '/feed') {
    return NextResponse.redirect(
      new URL('/api/v1/articles?per_page=20', request.url),
      { status: 301 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths EXCEPT Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
