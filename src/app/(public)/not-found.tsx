import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="border-t-4 border-cni-red pt-2 mb-6 inline-block">
          <span className="font-headline text-8xl font-bold text-cni-blue">404</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6 max-w-md" style={{ fontFamily: 'var(--font-source-serif)' }}>
          The article or page you are looking for may have been moved, deleted, or never existed.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="btn-primary text-sm no-underline">
            Back to Home
          </Link>
          <Link href="/search" className="text-sm text-cni-blue hover:text-cni-red no-underline"
            style={{ fontFamily: 'var(--font-inter)' }}>
            Search CNI News →
          </Link>
        </div>
      </div>
    </div>
  );
}
