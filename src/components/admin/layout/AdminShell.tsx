'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar  from './TopBar';
import AdminGuard from './AdminGuard';
import type { Breadcrumb } from '@/types/admin';

interface Props {
  children:     React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  /** Extra buttons shown in the TopBar right side */
  topActions?:  React.ReactNode;
}

/**
 * AdminShell
 * Wraps every /admin/* page.
 * Usage in a page:
 *
 *   <AdminShell breadcrumbs={[{ label: 'Articles', href: '/admin/articles' }]}>
 *     <PageContent />
 *   </AdminShell>
 */
export default function AdminShell({ children, breadcrumbs, topActions }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);

  return (
    <AdminGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden">

        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar
            breadcrumbs={breadcrumbs}
            onMobileMenu={() => setMobileOpen(true)}
            actions={topActions}
          />

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
