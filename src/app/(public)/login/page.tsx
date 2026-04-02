'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const login  = useAuthStore(s => s.login);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.errors?.email?.[0]
        ?? err.response?.data?.errors?.account?.[0]
        ?? 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 font-body mt-2">Welcome back to CNI News Network</p>
        </div>

        <div className="bg-white p-8 border border-gray-200">
          {/* Error */}
          {error && (
            <div className="bg-cni-red-light border border-cni-red text-cni-red-dark text-sm font-ui p-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-ui font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm font-ui
                           focus:outline-none focus:border-cni-blue"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-ui font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-ui text-cni-blue hover:text-cni-red no-underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm font-ui
                           focus:outline-none focus:border-cni-blue"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm py-3 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-500 font-ui">or continue with</span>
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/api/v1/auth/social/google/redirect"
              className="flex items-center justify-center gap-2 border border-gray-300
                         px-4 py-2.5 text-sm font-ui font-semibold text-gray-700
                         hover:bg-gray-50 transition-colors no-underline"
            >
              <GoogleIcon />
              Google
            </a>
            <a
              href="/api/v1/auth/social/facebook/redirect"
              className="flex items-center justify-center gap-2 border border-gray-300
                         px-4 py-2.5 text-sm font-ui font-semibold text-gray-700
                         hover:bg-gray-50 transition-colors no-underline"
            >
              <FacebookIcon />
              Facebook
            </a>
          </div>

          <p className="text-center text-sm font-ui text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-cni-blue font-semibold hover:text-cni-red no-underline">
              Join CNI News
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
