'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { membershipApi } from '@/lib/api';
import type { MembershipPlan } from '@/types';

interface Props { plan: MembershipPlan; }

interface PromoResult {
  valid:          boolean;
  message:        string;
  promo_code_id?: number;
  discount_amount?: number;
  final_price?:   number;
}

export default function CheckoutForm({ plan }: Props) {
  const router = useRouter();

  const [promoCode,   setPromoCode]   = useState('');
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const finalPrice = promoResult?.final_price ?? Number(plan.price_amount);
  const discount   = promoResult?.discount_amount ?? 0;

  // ── Apply promo code ────────────────────────────────────────────────────
  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await membershipApi.validatePromo({
        code:    promoCode.trim().toUpperCase(),
        plan_id: plan.id,
      });
      setPromoResult(res.data);
    } catch {
      setPromoResult({ valid: false, message: 'Could not validate code. Please try again.' });
    } finally {
      setPromoLoading(false);
    }
  };

  // ── Subscribe ────────────────────────────────────────────────────────────
  // For Stripe integration: in production this would create a Stripe
  // PaymentIntent or Checkout Session. Here we handle the free/promo case
  // directly and show instructions for Stripe setup.
  const handleSubscribe = async () => {
    setSubmitting(true);
    setError('');

    try {
      await membershipApi.subscribe({
        plan_id:       plan.id,
        promo_code_id: promoResult?.promo_code_id ?? null,
      });
      router.push('/account?subscribed=1');
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
        'Subscription failed. Please try again or contact support.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Promo code */}
      <div>
        <label className="block text-sm font-ui font-semibold text-gray-700 mb-2">
          Promo Code (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
            placeholder="e.g. RAMADAN25"
            className="flex-1 border border-gray-300 px-3 py-2.5 text-sm font-ui uppercase
                       focus:outline-none focus:border-cni-blue tracking-widest"
          />
          <button
            type="button"
            onClick={applyPromo}
            disabled={promoLoading || !promoCode.trim()}
            className="btn-primary text-sm px-4 disabled:opacity-50"
          >
            {promoLoading ? '…' : 'Apply'}
          </button>
        </div>

        {promoResult && (
          <div className={`mt-2 text-sm font-ui px-3 py-2 ${
            promoResult.valid
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-cni-red-light border border-cni-red text-cni-red-dark'
          }`}>
            {promoResult.valid ? '✓ ' : '✗ '}
            {promoResult.message}
          </div>
        )}
      </div>

      {/* Price summary */}
      <div className="bg-gray-50 border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm font-ui text-gray-700">
          <span>{plan.name} ({plan.billing_cycle})</span>
          <span>£{Number(plan.price_amount).toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm font-ui text-green-700">
            <span>Promo discount</span>
            <span>−£{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 flex justify-between font-ui font-bold text-gray-900">
          <span>Total</span>
          <span>£{finalPrice.toFixed(2)} / {plan.billing_cycle}</span>
        </div>
      </div>

      {/* Stripe payment notice */}
      <div className="bg-cni-blue-light border border-cni-blue p-4 text-sm font-ui text-cni-blue">
        <p className="font-bold mb-1">💳 Stripe Payment Integration</p>
        <p className="text-xs text-gray-600">
          To enable card payments: add your{' '}
          <code className="bg-white px-1 py-0.5 border text-xs">STRIPE_KEY</code> and{' '}
          <code className="bg-white px-1 py-0.5 border text-xs">STRIPE_SECRET</code>{' '}
          to Laravel&apos;s <code className="bg-white px-1 py-0.5 border text-xs">.env</code>,
          then set the <code className="bg-white px-1 py-0.5 border text-xs">stripe_price_id</code>{' '}
          on each plan in the admin panel. The backend MembershipController will
          create a Stripe subscription automatically.
        </p>
      </div>

      {error && (
        <div className="bg-cni-red-light border border-cni-red text-cni-red-dark text-sm font-ui p-3">
          {error}
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={submitting}
        className="btn-primary w-full text-sm py-3"
      >
        {submitting
          ? 'Processing…'
          : finalPrice === 0
            ? 'Activate Free'
            : `Subscribe — £${finalPrice.toFixed(2)} / ${plan.billing_cycle}`}
      </button>

      <p className="text-xs text-gray-500 font-ui text-center">
        By subscribing you agree to our{' '}
        <a href="/terms" className="underline hover:text-cni-blue">Terms of Service</a>.
        Cancel anytime from your account dashboard.
      </p>
    </div>
  );
}
