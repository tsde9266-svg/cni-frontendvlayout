/**
 * TopAdBanner — CNN-style leaderboard advertisement strip
 * Sits between the sticky header and page content.
 * Desktop: 970×90 leaderboard | Mobile: 320×50 banner
 * Swap the placeholder divs with real ad network code (Google AdSense, etc.)
 */
export default function TopAdBanner() {
  return (
    <div
      className="w-full border-b border-gray-200"
      style={{ backgroundColor: '#f8f8f8' }}
      aria-label="Advertisement"
    >
      <div className="max-w-[1280px] mx-auto px-4 py-2 flex flex-col items-center gap-1">
        {/* "Advertisement" label — tiny, grey, like CNN */}
        <span
          className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 select-none"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Advertisement
        </span>

        {/* ── Desktop leaderboard 970 × 90 ─────────────────────────────── */}
        <div
          className="hidden md:flex items-center justify-center overflow-hidden rounded-sm"
          style={{ width: '100%', maxWidth: 970, height: 90, backgroundColor: '#e2e8f0' }}
        >
          {/* Replace inner content with your ad tag, e.g. Google AdSense ins tag */}
          <div className="flex flex-col items-center gap-1 pointer-events-none select-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            <span className="text-gray-400 text-[11px]" style={{ fontFamily: 'var(--font-inter)' }}>
              970 × 90 — Your Ad Here
            </span>
          </div>
        </div>

        {/* ── Mobile banner 320 × 50 ────────────────────────────────────── */}
        <div
          className="flex md:hidden items-center justify-center overflow-hidden rounded-sm"
          style={{ width: 320, height: 50, backgroundColor: '#e2e8f0' }}
        >
          <span className="text-gray-400 text-[10px]" style={{ fontFamily: 'var(--font-inter)' }}>
            320 × 50 — Your Ad Here
          </span>
        </div>
      </div>
    </div>
  );
}
