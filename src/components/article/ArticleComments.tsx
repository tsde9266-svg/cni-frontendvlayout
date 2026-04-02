'use client';
import { useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import api from '@/lib/api';

interface Comment {
  id:           number;
  content:      string;
  guest_name?:  string;
  user?:        { display_name: string };
  created_at:   string;
  replies?:     Comment[];
}

interface Props { articleId: number; }

export default function ArticleComments({ articleId }: Props) {
  const { user } = useAuthStore();
  const [content, setContent]     = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/api/v1/articles/${articleId}/comments`, {
        content,
        guest_name:  user ? undefined : guestName,
        guest_email: user ? undefined : guestEmail,
      });
      setSubmitted(true);
      setContent('');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 pt-6 border-t border-gray-200">
      <h3 className="font-headline text-xl font-bold text-gray-900 mb-6">Comments</h3>

      {/* Comment form */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 p-4 text-sm font-ui text-green-800">
          Your comment has been submitted and is awaiting moderation. Thank you.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 mb-8">
          {!user && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name *"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                required
                className="border border-gray-300 px-3 py-2 text-sm font-ui focus:outline-none focus:border-cni-blue"
              />
              <input
                type="email"
                placeholder="Your email (not published)"
                value={guestEmail}
                onChange={e => setGuestEmail(e.target.value)}
                className="border border-gray-300 px-3 py-2 text-sm font-ui focus:outline-none focus:border-cni-blue"
              />
            </div>
          )}
          <textarea
            placeholder="Write a comment…"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={4}
            className="w-full border border-gray-300 px-3 py-2 text-sm font-body focus:outline-none focus:border-cni-blue resize-y"
          />
          {error && <p className="text-sm text-red-600 font-ui">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm"
          >
            {submitting ? 'Submitting…' : 'Post Comment'}
          </button>
          <p className="text-xs text-gray-500 font-ui">
            Comments are moderated before appearing. Be respectful.
          </p>
        </form>
      )}
    </section>
  );
}
