import { Metadata } from 'next';
import { membershipApi } from '@/lib/api';
import type { MembershipPlan } from '@/types';
import MembershipCard from '@/components/membership/MembershipCard';

export const metadata: Metadata = {
  title:       'Membership Plans',
  description: 'Support CNI News and get exclusive benefits. Choose a plan that works for you.',
};

export const revalidate = 300;

async function getPlans(): Promise<MembershipPlan[]> {
  try {
    const res = await membershipApi.plans();
    return res.data.data;
  } catch { return []; }
}

export default async function MembershipPage() {
  const plans = await getPlans();

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold text-gray-900 mb-3">
          Support Independent Journalism
        </h1>
        <p className="text-lg font-body text-gray-600 max-w-xl mx-auto">
          CNI News is funded by readers like you. Choose a plan to support our journalism
          and unlock exclusive benefits.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <MembershipCard key={plan.id} plan={plan} highlighted={i === 1} />
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="font-headline text-2xl font-bold text-gray-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            ['Can I cancel anytime?',          'Yes. Cancel at any time and keep access until the end of your billing period. No questions asked.'],
            ['Do you offer a free trial?',      'We offer a permanent free plan with basic news access. Paid plans can be cancelled before renewal.'],
            ['Can I use a promo code?',         'Yes — enter your promo code at checkout. Codes are available during special campaigns and Ramadan.'],
            ['How does payment work?',          'We use Stripe for secure card payments and PayPal. Your payment details are never stored on our servers.'],
            ['Is this a UK-only membership?',   'No — readers worldwide can subscribe. Prices are in GBP but Stripe handles currency conversion.'],
          ].map(([q, a]) => (
            <details key={q} className="border border-gray-200 group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-ui font-semibold text-gray-900 hover:text-cni-blue">
                {q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-5 pb-4 text-sm font-body text-gray-700 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
