'use client';
import { Metadata } from 'next';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Compose mailto link as a fallback (backend form integration can be wired up later)
    const body = `Name: ${form.name}\nPhone: ${form.phone}\nSubject: ${form.subject}\n\n${form.message}`;
    window.location.href = `mailto:cninewsnetworkltd@gmail.com?subject=${encodeURIComponent(form.subject || 'Contact from website')}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Heading */}
      <div className="border-l-4 border-cni-red pl-4 mb-10">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h1>
        <p className="text-gray-500 mt-1">Get in touch with the CNI News Network team.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Contact details */}
        <div className="space-y-8">
          {/* Address */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-cni-red flex items-center justify-center shrink-0 rounded-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Office Address</p>
              <p className="text-gray-600 text-sm mt-0.5">
                Fairgate House, 205 Kings Road<br />
                Birmingham, B11 2AA<br />
                United Kingdom
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-cni-red flex items-center justify-center shrink-0 rounded-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Phone</p>
              <a href="tel:+442036338749" className="text-gray-600 text-sm mt-0.5 hover:text-cni-blue no-underline block">
                (+44) 020 3633 8749
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-cni-red flex items-center justify-center shrink-0 rounded-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Email</p>
              <a href="mailto:cninewsnetworkltd@gmail.com" className="text-gray-600 text-sm mt-0.5 hover:text-cni-blue no-underline block break-all">
                cninewsnetworkltd@gmail.com
              </a>
            </div>
          </div>

          {/* Social media */}
          <div>
            <p className="font-semibold text-gray-900 text-sm mb-3">Follow Us</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Facebook', href: 'https://www.facebook.com/CNINEWSNETWORK', bg: '#1877F2' },
                { label: 'YouTube', href: 'https://www.youtube.com/@CNINEWSUK', bg: '#FF0000' },
                { label: 'Instagram', href: 'https://www.instagram.com/cninewsnetwork', bg: '#E1306C' },
                { label: 'Twitter/X', href: 'https://twitter.com/cni_cninews', bg: '#000000' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/cni-news-b39b3866/', bg: '#0A66C2' },
              ].map(({ label, href, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-white rounded-sm no-underline hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: bg }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div>
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-sm p-6 text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-green-800">Message sent!</p>
              <p className="text-green-700 text-sm mt-1">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cni-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cni-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+44 ..."
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cni-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="How can we help?"
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cni-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Your message (optional)..."
                  className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cni-blue resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cni-red text-white font-semibold py-2.5 text-sm hover:bg-red-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
