import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | CNI Admin', default: 'Admin Panel | CNI News Network' },
  robots: 'noindex, nofollow',
};

/**
 * Admin layout — no Header, no Footer, no wrapping div.
 * AdminShell (sidebar + topbar) is added per-page.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
