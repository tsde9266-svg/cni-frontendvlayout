'use client';

import { useEffect, useState, useCallback } from 'react';

interface Ad {
  id: number;
  title: string;
  image_url: string;
  click_url: string;
  alt_text: string | null;
}

type Placement = 'leaderboard' | 'sidebar' | 'in-feed';

interface Props {
  placement: Placement;
  className?: string;
}

// Height constraints per placement so the ad fits its slot
const HEIGHTS: Record<Placement, string> = {
  leaderboard: 'max-h-[120px] md:max-h-[90px]',
  sidebar:     'max-h-[250px]',
  'in-feed':   'max-h-[160px]',
};

export default function AdBanner({ placement, className = '' }: Props) {
  const [ads, setAds]               = useState<Ad[]>([]);
  const [index, setIndex]           = useState(0);
  const [visible, setVisible]       = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    fetch(`${base}/api/v1/display-ads?placement=${placement}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => setAds(json.data ?? []))
      .catch(() => {});
  }, [placement]);

  // Rotate every 10 seconds when there are multiple ads, with a brief fade
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % ads.length);
        setVisible(true);
      }, 300);
    }, 10000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (!ads.length) return null;

  const ad = ads[index];

  return (
    <div className={`w-full ${className}`}>
      {/* "Advertisement" label — standard on all news sites */}
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 text-center select-none mb-0.5"
         style={{ fontFamily: 'var(--font-inter)' }}>
        Advertisement
      </p>

      <a
        href={ad.click_url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label={ad.alt_text ?? ad.title}
        className="block overflow-hidden"
        style={{
          opacity:    visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt={ad.alt_text ?? ad.title}
          className={`w-full object-cover object-center ${HEIGHTS[placement]}`}
        />
      </a>

      {/* Dot indicators when there are multiple ads */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1 mt-1">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setIndex(i); setVisible(true); }, 300); }}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ backgroundColor: i === index ? '#012169' : '#D1D5DB' }}
              aria-label={`Ad ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
