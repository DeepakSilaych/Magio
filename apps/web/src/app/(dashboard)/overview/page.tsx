import { getDashboardData } from '@/lib/actions/email';
import { OverviewPage } from '@/components/pages/overview-page';
import { AutoRefresh } from '@/components/auto-refresh';

export const dynamic = 'force-dynamic';

export default async function Overview() {
  const emails = await getDashboardData();

  return (
    <>
      <AutoRefresh interval={10000} />
      <OverviewPage emails={emails} />
    </>
  );
}
