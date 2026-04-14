'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { EmailList } from '@/components/email-list';
import { EmailDetail } from '@/components/email-detail';
import { PageHeader } from '@/components/ui/page-header';
import type { Email } from '@/lib/types';

export function EmailsPage({ emails }: { emails: Email[] }) {
  const {
    search,
    setSearch,
    sortKey,
    sortDir,
    toggleSort,
    sortedEmails,
    selectedEmailId,
    setSelectedEmailId,
    selectedEmail,
    getIpGroups,
  } = useDashboard(emails);

  return (
    <>
      <PageHeader title="Emails" />
      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className={selectedEmail ? 'xl:col-span-2' : 'xl:col-span-5'}>
            <EmailList
              emails={sortedEmails}
              search={search}
              onSearchChange={setSearch}
              sortKey={sortKey}
              sortDir={sortDir}
              onToggleSort={toggleSort}
              selectedEmailId={selectedEmailId}
              onSelectEmail={setSelectedEmailId}
            />
          </div>
          {selectedEmail && (
            <div className="xl:col-span-3">
              <EmailDetail
                email={selectedEmail}
                ipGroups={getIpGroups(selectedEmail)}
                onClose={() => setSelectedEmailId(null)}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
