// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/article/ArticleShareBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import type { Article } from '@/types';

export default function ArticleShareBar({ article }: { article: Article }) {
  const url   = typeof window !== 'undefined' ? window.location.href : '';
  const title = article.title ?? '';

  return (
    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
      <span className="text-xs font-ui text-gray-500 uppercase tracking-wide">Share</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        className="text-xs font-ui font-semibold px-3 py-1.5 bg-[#1877F2] text-white hover:opacity-90 no-underline transition-opacity"
      >
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        className="text-xs font-ui font-semibold px-3 py-1.5 bg-black text-white hover:opacity-90 no-underline transition-opacity"
      >
        X / Twitter
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`}
        target="_blank" rel="noopener noreferrer"
        className="text-xs font-ui font-semibold px-3 py-1.5 bg-[#25D366] text-white hover:opacity-90 no-underline transition-opacity"
      >
        WhatsApp
      </a>
    </div>
  );
}
