import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service — CNI News Network' };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>
      <div className="prose prose-sm text-gray-700 space-y-4">
        <p>By accessing CNI News Network you agree to these terms. We reserve the right to update them at any time.</p>
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-6">Use of Content</h2>
        <p>All content published on CNI News Network is protected by copyright. You may share articles with attribution but may not reproduce them in full without written permission.</p>
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-6">User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. CNI News Network is not liable for any loss resulting from unauthorised use of your account.</p>
        <h2 className="font-headline text-lg font-bold text-gray-900 mt-6">Contact</h2>
        <p>For questions about these terms contact us at legal@cninews.tv</p>
      </div>
    </div>
  );
}
