"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi, articlesApi } from "@/lib/api";
import type { Category, Article } from "@/types";
import AuthButton from "@/components/auth/AuthButton";
import { usePathname } from "next/navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data.data as Category[]),
    staleTime: 5 * 60 * 1000,
  });

  const { data: breakingArticles } = useQuery({
    queryKey: ["breaking-ticker"],
    queryFn: () =>
      articlesApi
        .list({ breaking: true, per_page: 6 })
        .then((r) => r.data.data as Article[]),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim())
      window.location.href = `/search?q=${encodeURIComponent(searchQ.trim())}`;
  };

  const navCategories = categories?.slice(0, 9) ?? [];

  // Active category — match /category/[slug]
  const activeCategorySlug = pathname.startsWith("/category/")
    ? pathname.split("/")[2]
    : null;

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? "shadow-lg" : ""}`}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo — CNI in red, NEWS in UK flag blue */}
          <Link
            href="/"
            className="no-underline flex items-center gap-1.5 shrink-0"
          >
            <span
              className="bg-cni-red text-white font-black text-base px-2 py-0.5 leading-none tracking-tight"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              CNI
            </span>
            <span
              className="font-headline font-bold text-xl leading-none tracking-tight"
              style={{ color: "#012169" }}
            >
              NEWS
            </span>
          </Link>

          {/* Breaking pulse — desktop centre */}
          {breakingArticles && breakingArticles.length > 0 && (
            <div className="hidden md:flex items-center gap-2 mx-6 flex-1 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cni-red animate-pulse shrink-0" />
              <span
                className="font-bold text-cni-red text-xs uppercase tracking-wider shrink-0"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Breaking News
              </span>
              <span className="text-gray-300 mx-1 shrink-0">|</span>
              <span
                className="text-gray-600 text-xs truncate"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {breakingArticles[0]?.title}
              </span>
            </div>
          )}

          {/* Right: Auth + Search */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
                href="/advertise"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 text-sm font-ui font-semibold text-cni-blue no-underline"
              >
                Advertise
              </Link>
            <AuthButton />
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  type="search"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="border border-gray-300 px-3 py-1.5 text-sm w-44 focus:outline-none focus:border-cni-blue"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
                <button
                  type="submit"
                  className="p-2 text-cni-blue"
                  aria-label="Search"
                >
                  <SearchIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-gray-500"
                >
                  <XIcon />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-cni-blue transition-colors"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
            )}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category nav ────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 relative">
          <div className="hidden md:flex items-center h-10 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {navCategories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  // className="px-3 py-1 text-[13px] font-medium whitespace-nowrap no-underline transition-colors"
                  className={`
  px-3 py-1 text-[13px] font-medium whitespace-nowrap no-underline transition-colors
  ${isActive ? "bg-[#012169] text-white" : "text-gray-700 hover:text-red-600"}
`}
                  // onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#DC2626'; }}
                  // onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                >
                  {cat.name}
                </Link>
              );
            })}

            {/* Social Feeds link */}
            <Link
              href="/social-feeds"
              className={`flex items-center gap-1.5 px-3 py-1 text-[13px] font-medium whitespace-nowrap no-underline transition-colors ml-auto
    ${
      pathname === "/social-feeds"
        ? "bg-[#1877F2] text-white"
        : "text-gray-700 hover:text-[#1877F2]"
    }
  `}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {/* Facebook + YouTube icons inline */}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Social
            </Link>

            {/* Live button */}
            <Link
              href="/live"
              className="flex items-center gap-1.5 px-3 py-1 text-[13px] font-bold text-white bg-cni-red
                         hover:bg-cni-red-dark transition-colors whitespace-nowrap no-underline"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </Link>

            
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden py-3 grid grid-cols-3 gap-1 border-t border-gray-100">
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-2 py-2 text-sm font-medium no-underline transition-colors"
                  style={{
                    fontFamily: "var(--font-inter)",
                    backgroundColor:
                      activeCategorySlug === cat.slug
                        ? "#012169"
                        : "transparent",
                    color:
                      activeCategorySlug === cat.slug ? "#ffffff" : "#374151",
                  }}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/social-feeds"
                onClick={() => setMenuOpen(false)}
                className="px-2 py-2 text-sm font-medium no-underline flex items-center gap-1"
                style={{ fontFamily: "var(--font-inter)", color: "#1877F2" }}
              >
                Social
              </Link>
              <Link
                href="/live"
                onClick={() => setMenuOpen(false)}
                className="px-2 py-2 text-sm font-bold text-cni-red no-underline flex items-center gap-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                <span className="w-2 h-2 rounded-full bg-cni-red" /> Live
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Breaking ticker — UK flag blue background ────────────────────── */}
      {breakingArticles && breakingArticles.length > 0 && (
        <div
          className="text-white h-8 flex items-center overflow-hidden"
          style={{ backgroundColor: "#012169" }}
        >
          {/* Red label */}
          <div
            className="bg-cni-red text-white font-bold text-[11px] uppercase tracking-widest px-3 h-full flex items-center shrink-0 gap-1.5"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Breaking News
          </div>
          {/* Divider */}
          <span
            className="w-px h-full shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          />
          {/* Scrolling headlines */}
          <div className="overflow-hidden flex-1 h-full flex items-center">
            <div
              className="ticker-content text-[12px] font-medium whitespace-nowrap"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {[...breakingArticles, ...breakingArticles].map((a, i) => (
                <Link
                  key={`${a.id}-${i}`}
                  href={`/article/${a.slug}`}
                  className="no-underline mx-10 text-white/80 hover:text-white transition-colors"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const SearchIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
    />
  </svg>
);
const XIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const MenuIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
































// 'use client';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { categoriesApi } from '@/lib/api';
// import type { Category } from '@/types';
// import BreakingTicker from '@/components/home/BreakingTicker';
// import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
// import AuthButton from '@/components/auth/AuthButton';

// export default function Header() {
//   const [menuOpen, setMenuOpen]   = useState(false);
//   const [scrolled, setScrolled]   = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searchQ, setSearchQ]     = useState('');

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 60);
//     window.addEventListener('scroll', onScroll, { passive: true });
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   const { data: categories } = useQuery({
//     queryKey: ['categories'],
//     queryFn:  () => categoriesApi.list().then(r => r.data.data as Category[]),
//     staleTime: 5 * 60 * 1000,
//   });

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQ.trim()) {
//       window.location.href = `/search?q=${encodeURIComponent(searchQ.trim())}`;
//     }
//   };

//   return (
//     <>
//       {/* ── Breaking news ticker ───────────────────────────────────────── */}
//       <BreakingTicker />

//       <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>

//         {/* ── Top bar: brand + utilities ─────────────────────────────── */}
//         <div className="bg-cni-blue text-white">
//           <div className="max-w-site mx-auto px-4 flex items-center justify-between h-10">
//             {/* Brand */}
//             <Link href="/" className="text-white hover:text-gray-200 font-headline font-bold text-lg tracking-tight no-underline">
//               CNI News Network
//             </Link>

//             {/* Utilities */}
//             <div className="flex items-center gap-4 text-sm font-ui">
//               <LanguageSwitcher />
//               <Link
//                 href="/advertise"
//                 className="hidden sm:inline-block text-blue-200 hover:text-white no-underline font-ui text-xs font-semibold uppercase tracking-wide"
//               >
//                 Advertise
//               </Link>
//               <AuthButton />
//             </div>
//           </div>
//         </div>

//         {/* ── Main nav ───────────────────────────────────────────────── */}
//         <nav className="max-w-site mx-auto px-4">
//           <div className="flex items-center justify-between h-12">

//             {/* Category links — desktop */}
//             <div className="hidden md:flex items-center gap-1 overflow-x-auto">
//               {categories?.slice(0, 8).map((cat) => (
//                 <Link
//                   key={cat.id}
//                   href={`/category/${cat.slug}`}
//                   className="px-3 py-1.5 text-sm font-ui font-medium text-gray-700
//                              hover:text-cni-red hover:bg-cni-red-light transition-colors
//                              duration-150 whitespace-nowrap no-underline"
//                 >
//                   {cat.name}
//                 </Link>
//               ))}
//               <Link
//                 href="/live"
//                 className="px-3 py-1.5 text-sm font-ui font-bold text-cni-red
//                            hover:bg-cni-red hover:text-white transition-colors
//                            duration-150 whitespace-nowrap no-underline flex items-center gap-1"
//               >
//                 <span className="inline-block w-2 h-2 rounded-full bg-cni-red animate-pulse-red" />
//                 Live
//               </Link>
//             </div>

//             {/* Search */}
//             <div className="flex items-center gap-2 ml-auto">
//               {searchOpen ? (
//                 <form onSubmit={handleSearch} className="flex items-center gap-2 animate-slide-in">
//                   <input
//                     type="search"
//                     value={searchQ}
//                     onChange={e => setSearchQ(e.target.value)}
//                     placeholder="Search CNI News…"
//                     autoFocus
//                     className="border border-gray-300 px-3 py-1 text-sm font-ui w-52
//                                focus:outline-none focus:border-cni-blue"
//                   />
//                   <button type="submit" className="text-cni-blue hover:text-cni-red" aria-label="Search">
//                     <SearchIcon />
//                   </button>
//                   <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-500 hover:text-gray-900">
//                     <XIcon />
//                   </button>
//                 </form>
//               ) : (
//                 <button
//                   onClick={() => setSearchOpen(true)}
//                   className="p-2 text-gray-600 hover:text-cni-blue transition-colors"
//                   aria-label="Open search"
//                 >
//                   <SearchIcon />
//                 </button>
//               )}

//               {/* Mobile menu toggle */}
//               <button
//                 className="md:hidden p-2 text-gray-700"
//                 onClick={() => setMenuOpen(!menuOpen)}
//                 aria-label="Toggle menu"
//               >
//                 {menuOpen ? <XIcon /> : <MenuIcon />}
//               </button>
//             </div>
//           </div>

//           {/* ── Mobile menu ─────────────────────────────────────────── */}
//           {menuOpen && (
//             <div className="md:hidden border-t border-gray-100 py-3 grid grid-cols-2 gap-1">
//               {categories?.map((cat) => (
//                 <Link
//                   key={cat.id}
//                   href={`/category/${cat.slug}`}
//                   onClick={() => setMenuOpen(false)}
//                   className="px-3 py-2 text-sm font-ui font-medium text-gray-700
//                              hover:text-cni-red no-underline"
//                 >
//                   {cat.name}
//                 </Link>
//               ))}
//               <Link
//                 href="/live"
//                 onClick={() => setMenuOpen(false)}
//                 className="px-3 py-2 text-sm font-ui font-bold text-cni-red no-underline flex items-center gap-1"
//               >
//                 <span className="w-2 h-2 rounded-full bg-cni-red" />
//                 Live
//               </Link>
//               <Link
//                 href="/advertise"
//                 onClick={() => setMenuOpen(false)}
//                 className="px-3 py-2 text-sm font-ui font-semibold text-cni-blue no-underline"
//               >
//                 Advertise with us
//               </Link>
//             </div>
//           )}
//         </nav>

//         {/* ── Red accent line under nav (UK flag) ──────────────────── */}
//         <div className="h-0.5 bg-cni-red" />
//       </header>
//     </>
//   );
// }

// // ── Inline SVG icons (no extra package needed) ─────────────────────────────
// const SearchIcon = () => (
//   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
//   </svg>
// );
// const XIcon = () => (
//   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//   </svg>
// );
// const MenuIcon = () => (
//   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
//   </svg>
// );

