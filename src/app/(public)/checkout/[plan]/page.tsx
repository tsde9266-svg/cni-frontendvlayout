'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { membershipApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { MembershipPlan } from '@/types';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import Link from 'next/link';

export default function CheckoutPage() {
  const router    = useRouter();
  const params    = useParams();
  const { user }  = useAuthStore();
  const planSlug  = params.plan as string;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null && typeof window !== 'undefined') {
      router.push(`/login?redirect=/checkout/${planSlug}`);
    }
  }, [user, router, planSlug]);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['membership-plans'],
    queryFn:  () => membershipApi.plans().then(r => r.data.data as MembershipPlan[]),
  });

  const plan = plans?.find(p => p.slug === planSlug);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="h-8 w-48 bg-gray-200 animate-pulse mx-auto mb-4" />
        <div className="h-64 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="font-ui text-gray-600 mb-4">Plan not found.</p>
        <Link href="/membership" className="btn-primary text-sm no-underline">View Plans</Link>
      </div>
    );
  }

  if (plan.is_free_tier) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="font-headline text-2xl font-bold mb-3">This plan is free!</h1>
        <p className="font-ui text-gray-600 mb-6">Just create an account to get started.</p>
        <Link href="/register" className="btn-primary text-sm no-underline">Create Free Account</Link>
      </div>
    );
  }

  return (
    <div className="max-w-site mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-10 max-w-4xl mx-auto">

        {/* Left: checkout form */}
        <div>
          <h1 className="font-headline text-2xl font-bold text-gray-900 mb-6">
            Complete Your Subscription
          </h1>
          <CheckoutForm plan={plan} />
        </div>

        {/* Right: order summary */}
        <div className="bg-gray-50 border border-gray-200 p-6 h-fit">
          <h2 className="font-ui font-bold text-sm uppercase tracking-wide text-gray-500 mb-4">
            Order Summary
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-ui font-bold px-2 py-1"
              style={{ backgroundColor: plan.badge_color ?? '#003087', color: 'white' }}
            >
              {plan.badge_label}
            </span>
            <div>
              <p className="font-ui font-bold text-gray-900">{plan.name} Plan</p>
              <p className="text-xs font-ui text-gray-500 capitalize">{plan.billing_cycle} subscription</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            {Object.entries(plan.features ?? {})
              .filter(([, v]) => v === true)
              .map(([k]) => (
                <div key={k} className="flex items-center gap-2 text-sm font-ui text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex items-center justify-between font-ui">
              <span className="font-semibold text-gray-700">Total today</span>
              <span className="font-bold text-lg text-gray-900">{plan.formatted_price}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {plan.billing_cycle === 'monthly' ? 'Billed monthly. Cancel anytime.' :
               plan.billing_cycle === 'yearly'  ? 'Billed annually. Cancel anytime.' :
               'One-time payment. Lifetime access.'}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-ui flex items-center gap-1">
              🔒 Secure payment via Stripe. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
