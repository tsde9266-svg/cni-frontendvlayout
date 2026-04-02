// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/ui/LanguageSwitcher.tsx
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English',  dir: 'ltr' },
  { code: 'ur', label: 'اردو', name: 'Urdu',  dir: 'rtl' },
  { code: 'pa', label: 'پنجابی', name: 'Punjabi', dir: 'rtl' },
  { code: 'mi', label: 'MI', name: 'Mirpuri', dir: 'rtl' },
];

export default function LanguageSwitcher() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const current      = searchParams.get('lang') ?? 'en';

  const switchLang = (code: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', code);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => switchLang(lang.code)}
          title={lang.name}
          className={`text-xs font-ui px-1.5 py-0.5 transition-colors ${
            current === lang.code
              ? 'text-white font-bold'
              : 'text-blue-300 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
