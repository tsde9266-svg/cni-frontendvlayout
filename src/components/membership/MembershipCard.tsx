'use client';
import Link from 'next/link';
import type { MembershipPlan } from '@/types';

interface Props { plan: MembershipPlan; highlighted?: boolean; }

const FEATURE_LABELS: Record<string, string> = {
  ad_free:            'Ad-free experience',
  exclusive_content:  'Exclusive member articles',
  download_articles:  'Download articles as PDF',
  early_access:       'Early access to content',
  live_stream_hd:     'HD live streams',
  member_badge:       'Member badge on profile',
};

export default function MembershipCard({ plan, highlighted }: Props) {
  return (
    <div
      id={plan.slug}
      className={`flex flex-col border-2 transition-shadow ${
        highlighted
          ? 'border-cni-blue shadow-xl scale-105'
          : 'border-gray-200 hover:border-cni-blue hover:shadow-md'
      }`}
    >
      {/* Badge header */}
      <div
        className="px-6 py-4 text-center"
        style={{ backgroundColor: plan.badge_color ?? '#003087' }}
      >
        {highlighted && (
          <span className="text-xs font-ui font-bold uppercase tracking-widest text-white/80 block mb-1">
            Most Popular
          </span>
        )}
        <h3 className="font-headline text-xl font-bold text-white">{plan.name}</h3>
        <div className="mt-2">
          {plan.is_free_tier ? (
            <span className="text-3xl font-headline font-bold text-white">Free</span>
          ) : (
            <>
              <span className="text-3xl font-headline font-bold text-white">
                £{Number(plan.price_amount).toFixed(2)}
              </span>
              <span className="text-white/70 font-ui text-sm"> / {plan.billing_cycle}</span>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 py-5 bg-white">
        {plan.description && (
          <p className="text-sm font-body text-gray-600 mb-4">{plan.description}</p>
        )}

        <ul className="space-y-2">
          {Object.entries(FEATURE_LABELS).map(([key, label]) => {
            const enabled = plan.features?.[key] === true;
            return (
              <li key={key} className={`flex items-center gap-2 text-sm font-ui ${enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                {enabled ? (
                  <span className="text-green-500 font-bold">✓</span>
                ) : (
                  <span className="text-gray-300">✗</span>
                )}
                {label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 bg-white">
        <Link
          href={plan.is_free_tier ? '/register' : `/checkout/${plan.slug}`}
          className={`block text-center font-ui font-semibold text-sm py-3 no-underline transition-colors ${
            highlighted
              ? 'bg-cni-blue text-white hover:bg-cni-blue-dark'
              : plan.is_free_tier
                ? 'border border-gray-300 text-gray-700 hover:border-cni-blue hover:text-cni-blue'
                : 'bg-cni-red text-white hover:bg-cni-red-dark'
          }`}
        >
          {plan.is_free_tier ? 'Get Started Free' : `Subscribe — ${plan.formatted_price}`}
        </Link>
      </div>
    </div>
  );
}
