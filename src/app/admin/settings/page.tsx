'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminShell from '@/components/admin/layout/AdminShell';
import { PageHeader, Card, CardHeader, Button, Input, Textarea, Toggle } from '@/components/admin/ui/AdminUI';
import { adminSettingsApi } from '@/lib/adminApi';

interface Settings {
  site_name?: string; tagline?: string; contact_email?: string; footer_text?: string;
  google_analytics_id?: string; breaking_ticker?: boolean; maintenance_mode?: boolean;
  social_links?: { facebook?: string; twitter?: string; youtube?: string; instagram?: string };
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Settings>({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn:  () => adminSettingsApi.get().then(r => r.data.data as Settings),
  });

  useEffect(() => { if (data) setForm(data); }, [data]);

  const saveMutation = useMutation({
    mutationFn: (d: object) => adminSettingsApi.update(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const set = (key: keyof Settings, val: unknown) => setForm(f => ({ ...f, [key]: val }));
  const setSocial = (key: string, val: string) =>
    setForm(f => ({ ...f, social_links: { ...f.social_links, [key]: val } }));

  if (isLoading) return (
    <AdminShell breadcrumbs={[{ label: 'Settings' }]}>
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"/>)}</div>
    </AdminShell>
  );

  return (
    <AdminShell
      breadcrumbs={[{ label: 'Settings' }]}
      topActions={
        <Button variant="primary" size="sm" loading={saveMutation.isPending}
          onClick={() => saveMutation.mutate(form)}>
          {saved ? '✓ Saved' : 'Save settings'}
        </Button>
      }
    >
      <PageHeader title="Site settings" subtitle="Global configuration for CNI News Network" />

      <div className="space-y-5 max-w-2xl">
        {/* General */}
        <Card>
          <CardHeader title="General" />
          <div className="space-y-3">
            <Input label="Site name" value={form.site_name ?? ''} onChange={e => set('site_name', e.target.value)} placeholder="CNI News Network" />
            <Input label="Tagline" value={form.tagline ?? ''} onChange={e => set('tagline', e.target.value)} placeholder="Your Voice, Your News" />
            <Input label="Contact email" type="email" value={form.contact_email ?? ''} onChange={e => set('contact_email', e.target.value)} placeholder="news@cni.co.uk" />
            <Textarea label="Footer text" value={form.footer_text ?? ''} onChange={e => set('footer_text', e.target.value)} rows={2} placeholder="© 2025 CNI News Network Ltd. All rights reserved." />
          </div>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader title="Features" />
          <div className="space-y-3">
            <Toggle checked={!!form.breaking_ticker} onChange={v => set('breaking_ticker', v)} label="Show breaking news ticker on homepage" />
            <Toggle checked={!!form.maintenance_mode} onChange={v => set('maintenance_mode', v)} label="Maintenance mode (blocks public site)" />
          </div>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader title="Analytics" />
          <Input label="Google Analytics 4 Measurement ID" value={form.google_analytics_id ?? ''}
            onChange={e => set('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" hint="Leave blank to disable GA" />
        </Card>

        {/* Social */}
        <Card>
          <CardHeader title="Social media links" />
          <div className="space-y-3">
            {(['facebook','twitter','youtube','instagram'] as const).map(platform => (
              <Input key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                value={form.social_links?.[platform] ?? ''}
                onChange={e => setSocial(platform, e.target.value)}
                placeholder={`https://${platform}.com/cninews`}
              />
            ))}
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate(form)}>
            {saved ? '✓ All settings saved' : 'Save all settings'}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
