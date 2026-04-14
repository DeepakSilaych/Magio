'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { StatsOverview } from '@/components/stats-overview';
import { ViewsChart } from '@/components/views-chart';
import { SessionsTable } from '@/components/sessions-table';
import { PageHeader } from '@/components/ui/page-header';
import type { Email } from '@/lib/types';

export function OverviewPage({ emails }: { emails: Email[] }) {
  const { stats, allSessions } = useDashboard(emails);

  return (
    <>
      <PageHeader title="Overview" />
      <main className="p-6 space-y-6">
        <StatsOverview stats={stats} />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <ViewsChart emails={emails} />
          </div>
          <SessionsTable sessions={allSessions.slice(0, 10)} search="" onSearchChange={() => {}} />
        </div>
      </main>
    </>
  );
}
