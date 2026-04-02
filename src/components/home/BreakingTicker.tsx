// // ─────────────────────────────────────────────────────────────────────────────
// // FILE: src/components/home/BreakingTicker.tsx
// // Scrolling red ticker showing latest breaking news headlines
// // ─────────────────────────────────────────────────────────────────────────────
// 'use client';
// import { useQuery } from '@tanstack/react-query';
// import Link from 'next/link';
// import { articlesApi } from '@/lib/api';
// import type { Article } from '@/types';

// export default function BreakingTicker() {
//   const { data } = useQuery({
//     queryKey: ['breaking'],
//     queryFn: () => articlesApi.list({ breaking: true, per_page: 5 }).then(r => r.data.data as Article[]),
//     staleTime: 60 * 1000,
//     refetchInterval: 60 * 1000,
//   });

//   if (!data?.length) return null;

//   return (
//     <div className="ticker-wrap h-8 flex items-center">
//       <span className="bg-white text-cni-red font-ui font-bold text-xs uppercase tracking-widest px-3 py-1 shrink-0 z-10">
//         Breaking
//       </span>
//       <div className="overflow-hidden flex-1 relative">
//         <div className="ticker-content font-ui text-sm font-medium">
//           {data.map(a => (
//             <Link
//               key={a.id}
//               href={`/article/${a.slug}`}
//               className="text-white hover:text-yellow-300 no-underline mx-8"
//             >
//               {a.title}
//             </Link>
//           ))}
//           {/* Duplicate for seamless loop */}
//           {data.map(a => (
//             <Link
//               key={`dup-${a.id}`}
//               href={`/article/${a.slug}`}
//               className="text-white hover:text-yellow-300 no-underline mx-8"
//             >
//               {a.title}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }










'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { articlesApi } from '@/lib/api';
import type { Article } from '@/types';
import { useEffect, useState } from 'react';

export default function BreakingTicker() {
  const [mounted, setMounted] = useState(false);
  
  // Mount client only
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data } = useQuery({
    queryKey: ['breaking'],
    queryFn: () => articlesApi.list({ breaking: true, per_page: 5 }).then(r => r.data.data as Article[]),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  // Server renders nothing, client waits for mount + data
  if (!mounted || !data?.length) {
    return (
      <div className="ticker-wrap h-8 flex items-center">
        <span className="bg-white text-cni-red font-ui font-bold text-xs uppercase tracking-widest px-3 py-1 shrink-0 z-10">
          Breaking
        </span>
        <div className="flex-1 animate-pulse bg-gray-800 h-full" />
      </div>
    );
  }

  return (
    <div className="ticker-wrap h-8 flex items-center" suppressHydrationWarning>
      <span className="bg-white text-cni-red font-ui font-bold text-xs uppercase tracking-widest px-3 py-1 shrink-0 z-10">
        Breaking
      </span>
      <div className="overflow-hidden flex-1 relative">
        <div className="ticker-content font-ui text-sm font-medium">
          {data.map(a => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="text-white hover:text-yellow-300 no-underline mx-8"
            >
              {a.title}
            </Link>
          ))}
          {/* Duplicate for seamless loop */}
          {data.map(a => (
            <Link
              key={`dup-${a.id}`}
              href={`/article/${a.slug}`}
              className="text-white hover:text-yellow-300 no-underline mx-8"
            >
              {a.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
