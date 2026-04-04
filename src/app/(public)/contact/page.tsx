import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact Us — CNI News Network' };

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-8">Get in touch with the CNI News Network team.</p>
      <div className="space-y-4 text-sm text-gray-700">
        <div>
          <p className="font-semibold">Editorial</p>
          <p>editorial@cninews.tv</p>
        </div>
        <div>
          <p className="font-semibold">Advertising</p>
          <p>advertising@cninews.tv</p>
        </div>
        <div>
          <p className="font-semibold">General Enquiries</p>
          <p>hello@cninews.tv</p>
        </div>
      </div>
    </div>
  );
}
