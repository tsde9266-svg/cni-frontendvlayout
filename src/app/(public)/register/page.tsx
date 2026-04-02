'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { User } from '@/types';

export default function RegisterPage() {
  const router   = useRouter();
  const setToken = useAuthStore(s => s.setToken);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', password_confirmation: '',
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res   = await authApi.register(form);
      const token = res.data.token  as string;
      const user  = res.data.data   as User;
      setToken(token, user);
      router.push('/');
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors ?? {};
      const flat: Record<string, string> = {};
      Object.entries(apiErrors).forEach(([k, v]: [string, any]) => {
        flat[k] = Array.isArray(v) ? v[0] : v;
      });
      if (!Object.keys(flat).length) {
        flat['general'] = 'Registration failed. Please try again.';
      }
      setErrors(flat);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="block text-sm font-ui font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        required
        className={`w-full border px-3 py-2.5 text-sm font-ui focus:outline-none focus:border-cni-blue ${
          errors[key] ? 'border-cni-red bg-cni-red-light' : 'border-gray-300'
        }`}
      />
      {errors[key] && <p className="text-xs text-cni-red font-ui mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-bold text-gray-900">Join CNI News</h1>
          <p className="text-gray-600 font-body mt-2">Create your free account today</p>
        </div>

        <div className="bg-white p-8 border border-gray-200">
          {errors.general && (
            <div className="bg-cni-red-light border border-cni-red text-cni-red-dark text-sm font-ui p-3 mb-5">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {field('first_name', 'First Name')}
              {field('last_name',  'Last Name')}
            </div>
            {field('email',                 'Email Address',    'email')}
            {field('password',              'Password',         'password')}
            {field('password_confirmation', 'Confirm Password', 'password')}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm py-3 mt-2"
            >
              {loading ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>

          {/* Free plan notice */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 text-xs font-ui text-gray-600 text-center">
            Free account includes basic news access.{' '}
            <Link href="/membership" className="text-cni-blue font-semibold no-underline">Upgrade</Link>
            {' '}for ad-free reading and exclusive content.
          </div>

          <p className="text-center text-sm font-ui text-gray-600 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-cni-blue font-semibold hover:text-cni-red no-underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
