'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { Monitor, Smartphone, Globe, Compass } from 'lucide-react';
import { parseBrowser, parseOS, parseDevice, formatRelativeTime } from '@/lib/ua-parser';

type SessionView = {
  id: string;
  viewedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  emailSubject: string;
  emailRecipient: string;
};

function BrowserIcon({ browser }: { browser: string }) {
  const color: Record<string, string> = {
    Chrome: 'text-green-400', Firefox: 'text-orange-400', Safari: 'text-blue-400',
    Edge: 'text-cyan-400', Opera: 'text-red-400',
  };
  return <Compass className={`w-3.5 h-3.5 ${color[browser] || 'text-muted-foreground'}`} />;
}

function getAvatarColor(ip: string): string {
  const colors = [
    'bg-violet-500/20 text-violet-400', 'bg-blue-500/20 text-blue-400',
    'bg-emerald-500/20 text-emerald-400', 'bg-amber-500/20 text-amber-400',
    'bg-rose-500/20 text-rose-400', 'bg-cyan-500/20 text-cyan-400',
  ];
  let hash = 0;
  for (let i = 0; i < ip.length; i++) hash = ip.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function SessionsTable({ sessions, search, onSearchChange }: {
  sessions: SessionView[];
  search: string;
  onSearchChange: (val: string) => void;
}) {
  const filtered = search.trim()
    ? sessions.filter((s) =>
        s.emailSubject.toLowerCase().includes(search.toLowerCase()) ||
        s.emailRecipient.toLowerCase().includes(search.toLowerCase()) ||
        (s.ipAddress || '').includes(search)
      )
    : sessions;

  return (
    <DataTableShell title="Sessions" subtitle="All email view events" search={search} onSearchChange={onSearchChange} count={filtered.length} countLabel="session">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs font-medium text-muted-foreground w-12">Session</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Email</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">IP Address</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Browser</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">OS</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Device</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Last seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow className="border-border">
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No sessions found.</TableCell>
            </TableRow>
          ) : (
            filtered.map((session) => {
              const ua = session.userAgent || '';
              const browser = parseBrowser(ua);
              const ip = session.ipAddress || 'Unknown';
              return (
                <TableRow key={session.id} className="border-border">
                  <TableCell>
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className={`text-[10px] font-bold ${getAvatarColor(ip)}`}>{ip.slice(-2)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <p className="text-[13px] font-medium text-foreground truncate max-w-[200px]">{session.emailSubject}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{session.emailRecipient}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-[13px] text-foreground font-mono">{ip}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <BrowserIcon browser={browser} />
                      <span className="text-[13px] text-foreground">{browser}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0.5">{parseOS(ua)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {parseDevice(ua) === 'Mobile' ? <Smartphone className="w-3.5 h-3.5 text-muted-foreground" /> : <Monitor className="w-3.5 h-3.5 text-muted-foreground" />}
                      <span className="text-[13px] text-muted-foreground">{parseDevice(ua)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><span className="text-[12px] text-muted-foreground">{formatRelativeTime(session.viewedAt)}</span></TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
