'use client';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="h-1 bg-cni-red" />

      {/* Footer links — single row, simple */}
      <div className="max-w-[1280px] mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-cni-red text-white font-ui font-black text-sm px-1.5 py-0.5 leading-none">CNI</span>
          <span className="font-headline font-bold text-base text-white">NEWS</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-ui text-gray-400">
          {[
            ['Home', '/'],
            ['Pakistan', '/category/pakistan'],
            ['World', '/category/world'],
            ['Contact', '/contact'],
            ['Membership', '/membership'],
            ['Privacy', '/privacy'],
            ['Terms', '/terms'],
            ['Advertise','/advertise'],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-white transition-colors no-underline">
              {label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs font-ui text-gray-500 shrink-0">
          © {year} CNI News Network
        </p>
      </div>
    </footer>
  );
}







// // ─────────────────────────────────────────────────────────────────────────────
// // FILE: src/components/layout/Footer.tsx
// // ─────────────────────────────────────────────────────────────────────────────
// 'use client';
// import Link from 'next/link';

// export default function Footer() {
//   const year = new Date().getFullYear();
//   return (
//     <footer className="bg-cni-blue text-white mt-16">
//       <div className="h-1 bg-cni-red" />
//       <div className="max-w-site mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
//         <div>
//           <h3 className="font-headline text-xl font-bold text-white mb-3">CNI News Network</h3>
//           <p className="text-blue-200 text-sm font-ui leading-relaxed">
//             Your Voice, Your News. Covering Pakistan, Kashmir, UK and World news in Urdu, Punjabi, Mirpuri and English.
//           </p>
//         </div>
//         <div>
//           <h4 className="font-ui font-semibold text-sm uppercase tracking-wider text-blue-300 mb-3">News</h4>
//           <ul className="space-y-2 text-sm font-ui">
//             {['Pakistan','Kashmir','World','Overseas','Sports'].map(s => (
//               <li key={s}><Link href={`/category/${s.toLowerCase()}`} className="text-blue-200 hover:text-white no-underline">{s}</Link></li>
//             ))}
//           </ul>
//         </div>
//         <div>
//           <h4 className="font-ui font-semibold text-sm uppercase tracking-wider text-blue-300 mb-3">CNI</h4>
//           <ul className="space-y-2 text-sm font-ui">
//             {[['About','about'],['Contact','contact'],['Membership','/membership'],['Events','/events'],['Live','/live'],['Advertise','/advertise']].map(([label, href]) => (
//               <li key={label}><Link href={`/${href}`} className="text-blue-200 hover:text-white no-underline">{label}</Link></li>
//             ))}
//           </ul>
//         </div>
//         <div>
//           <h4 className="font-ui font-semibold text-sm uppercase tracking-wider text-blue-300 mb-3">Follow Us</h4>
//           <div className="flex gap-3">
//             {['Facebook','Twitter','YouTube','Instagram'].map(s => (
//               <a key={s} href="#" className="text-blue-300 hover:text-white text-xs font-ui no-underline">{s}</a>
//             ))}
//           </div>
//         </div>
//       </div>
//       <div className="border-t border-blue-800 py-4 text-center text-xs font-ui text-blue-400">
//         © {year} CNI News Network Ltd. All rights reserved.
//         <span className="mx-2">·</span>
//         <Link href="/privacy" className="hover:text-white no-underline text-blue-400">Privacy</Link>
//         <span className="mx-2">·</span>
//         <Link href="/terms" className="hover:text-white no-underline text-blue-400">Terms</Link>
//       </div>
//     </footer>
//   );
// }
