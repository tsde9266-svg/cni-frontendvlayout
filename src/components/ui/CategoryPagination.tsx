// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/ui/CategoryPagination.tsx
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import Link from 'next/link';
import type { ApiPagination } from '@/types';

interface Props { meta: ApiPagination; slug: string; lang: string; }

export default function CategoryPagination({ meta, slug, lang }: Props) {
  if (meta.last_page <= 1) return null;

  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-2 mt-10">
      {pages.map(p => (
        <Link
          key={p}
          href={`/category/${slug}?lang=${lang}&page=${p}`}
          className={`w-9 h-9 flex items-center justify-center text-sm font-ui no-underline transition-colors ${
            p === meta.current_page
              ? 'bg-cni-blue text-white font-bold'
              : 'border border-gray-300 text-gray-600 hover:border-cni-blue hover:text-cni-blue'
          }`}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
