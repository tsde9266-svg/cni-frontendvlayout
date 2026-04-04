import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — CNI News Network' };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>
      <div className="prose prose-sm text-gray-700 space-y-4">
        <p>CNI News Network respects your privacy and is committed to protecting your personal data.</p>
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-6">Data We Collect</h2>
        <p>We collect your email address when you register or subscribe to our newsletter. We also collect anonymised usage data to improve our service.</p>
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-6">How We Use Your Data</h2>
        <p>Your data is used to provide and improve our service, send newsletters you have opted into, and comply with legal obligations. We do not sell your data to third parties.</p>
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-6">Cookies</h2>
        <p>We use essential cookies to keep you logged in and analytics cookies to understand how our site is used. You can disable non-essential cookies in your browser settings.</p>
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-6">Your Rights</h2>
        <p>Under UK GDPR you have the right to access, correct, or delete your personal data. Contact privacy@cninews.tv to exercise these rights.</p>
      </div>
    </div>
  );
}
