import { useMemo, useState, useCallback } from 'react';
import type { Email, SortKey, SortDir, DashboardStats, IpGroup } from '@/lib/types';

export function useDashboard(emails: Email[]) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const filteredEmails = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return emails;
    return emails.filter(
      (e) =>
        e.subject.toLowerCase().includes(q) ||
        e.recipient.toLowerCase().includes(q) ||
        e.sender.toLowerCase().includes(q)
    );
  }, [emails, search]);

  const sortedEmails = useMemo(() => {
    return [...filteredEmails].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'createdAt':
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'views':
          return dir * (a.views.length - b.views.length);
        case 'subject':
          return dir * a.subject.localeCompare(b.subject);
        case 'recipient':
          return dir * a.recipient.localeCompare(b.recipient);
        default:
          return 0;
      }
    });
  }, [filteredEmails, sortKey, sortDir]);

  const stats: DashboardStats = useMemo(() => {
    const allViews = emails.flatMap((e) => e.views);
    const uniqueIps = new Set(allViews.map((v) => v.ipAddress).filter(Boolean));
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return {
      totalEmails: emails.length,
      totalViews: allViews.length,
      uniqueIps: uniqueIps.size,
      avgViewsPerEmail: emails.length > 0 ? Math.round((allViews.length / emails.length) * 10) / 10 : 0,
      viewsToday: allViews.filter((v) => new Date(v.viewedAt) >= todayStart).length,
      emailsToday: emails.filter((e) => new Date(e.createdAt) >= todayStart).length,
    };
  }, [emails]);

  const selectedEmail = useMemo(
    () => emails.find((e) => e.id === selectedEmailId) || null,
    [emails, selectedEmailId]
  );

  const getIpGroups = useCallback((email: Email): IpGroup[] => {
    const map = new Map<string, IpGroup>();
    email.views.forEach((v) => {
      const ip = v.ipAddress || 'Unknown';
      const existing = map.get(ip);
      if (existing) {
        existing.views.push(v);
        if (new Date(v.viewedAt) > existing.lastSeen) {
          existing.lastSeen = new Date(v.viewedAt);
          existing.userAgent = v.userAgent || 'Unknown';
        }
      } else {
        map.set(ip, { ip, views: [v], lastSeen: new Date(v.viewedAt), userAgent: v.userAgent || 'Unknown' });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.views.length - a.views.length);
  }, []);

  const allSessions = useMemo(() => {
    return emails.flatMap((e) =>
      e.views.map((v) => ({ ...v, emailSubject: e.subject, emailRecipient: e.recipient }))
    ).sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
  }, [emails]);

  return {
    search, setSearch,
    sortKey, sortDir, toggleSort,
    sortedEmails,
    stats,
    selectedEmailId, setSelectedEmailId,
    selectedEmail,
    getIpGroups,
    allSessions,
  };
}
