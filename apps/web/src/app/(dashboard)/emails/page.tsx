import { getDashboardData } from '@/lib/actions/email';
import { EmailsPage } from '@/components/pages/emails-page';
import { AutoRefresh } from '@/components/auto-refresh';

export const dynamic = 'force-dynamic';

export default async function Emails() {
  const emails = await getDashboardData();

  return (
    <>
      <AutoRefresh interval={10000} />
      <EmailsPage emails={emails} />
    </>
  );
}
