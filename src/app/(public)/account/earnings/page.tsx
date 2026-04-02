'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/hooks/useAuthStore';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Earning {
  id:           number;
  article_id:   number;
  earning_type: string;
  amount:       number;
  currency:     string;
  description:  string;
  status:       'pending' | 'approved' | 'paid';
  earned_at:    string;
}

interface EarningsSummary {
  total_pending:  number;
  total_approved: number;
  total_paid:     number;
  currency:       string;
  earnings:       Earning[];
}

export default function EarningsPage() {
  const router    = useRouter();
  const { user }  = useAuthStore();

  useEffect(() => {
    if (!user) router.push('/login?redirect=/account/earnings');
  }, [user, router]);

  const { data, isLoading } = useQuery<EarningsSummary>({
    queryKey: ['my-earnings'],
    queryFn:  () => api.get('/api/v1/my/earnings').then(r => r.data.data),
    enabled:  !!user,
  });

  if (!user || isLoading) {
    return (
      <div className="max-w-site mx-auto px-4 py-12">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === 'paid' ? 'text-green-700 bg-green-50' :
    s === 'approved' ? 'text-blue-700 bg-blue-50' :
    'text-yellow-700 bg-yellow-50';

  return (
    <div className="max-w-site mx-auto px-4 py-8">

      <div className="section-divider mb-8">
        <h1 className="font-headline text-2xl font-bold text-gray-900">Author Earnings</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending',  value: data?.total_pending  ?? 0, color: 'border-yellow-400' },
          { label: 'Approved', value: data?.total_approved ?? 0, color: 'border-blue-400' },
          { label: 'Paid Out', value: data?.total_paid     ?? 0, color: 'border-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`border-l-4 ${color} bg-white border border-gray-200 p-5`}>
            <p className="text-xs font-ui text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="font-headline text-2xl font-bold text-gray-900 mt-1">
              £{Number(value).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Earnings table */}
      {!data?.earnings?.length ? (
        <div className="text-center py-16 text-gray-500 font-ui">
          <p className="text-3xl mb-3">💷</p>
          <p className="font-semibold mb-1">No earnings yet</p>
          <p className="text-sm">Earnings are recorded when your articles are published.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-ui border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Article','Type','Description','Amount','Status','Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide border-b border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.earnings.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">#{e.article_id}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 px-2 py-0.5">
                      {e.earning_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    £{Number(e.amount).toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${statusColor(e.status)}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {format(new Date(e.earned_at), 'd MMM yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 text-sm font-ui text-gray-600">
        <p className="font-semibold mb-1">Payout schedule</p>
        <p>Approved earnings are paid monthly by your chosen method (bank transfer, PayPal, or Stripe Connect).
        Contact <a href="mailto:finance@cni.co.uk" className="text-cni-blue underline">finance@cni.co.uk</a> to update your payout details.</p>
      </div>
    </div>
  );
}
