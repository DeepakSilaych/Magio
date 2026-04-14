'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TimeRangeToggle } from '@/components/ui/time-range-toggle';
import { BarChartWidget } from '@/components/ui/bar-chart-widget';
import { X, Globe, Eye, Users, Copy, Check } from 'lucide-react';
import { parseBrowser, parseOS, parseDevice, formatRelativeTime } from '@/lib/ua-parser';
import { getChartData, type TimeRange } from '@/lib/chart-utils';
import type { Email, IpGroup } from '@/lib/types';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function EmailChart({ email }: { email: Email }) {
  const [range, setRange] = useState<TimeRange>('24h');

  const wrappedEmails = useMemo(() => [email], [email]);
  const data = useMemo(() => getChartData(wrappedEmails, range), [wrappedEmails, range]);

  if (email.views.length === 0) return null;

  const xInterval = range === '24h' ? 3 : range === '30d' ? 4 : undefined;
  const barSize = range === '24h' ? 10 : range === '30d' ? 10 : 24;
  const titles: Record<TimeRange, string> = { '24h': 'Hourly Distribution', '7d': 'Daily Distribution', '30d': 'Monthly Distribution' };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-foreground">{titles[range]}</h4>
        <TimeRangeToggle value={range} onChange={setRange} size="sm" />
      </div>
      <BarChartWidget data={data} height={120} maxBarSize={barSize} xInterval={xInterval} tooltipLabelKey="label" />
    </div>
  );
}

function ViewsTable({ email }: { email: Email }) {
  const sortedViews = useMemo(
    () => [...email.views].sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()),
    [email.views]
  );

  if (email.views.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <Eye className="w-3.5 h-3.5 text-primary" />
        All Views
        <span className="text-muted-foreground font-normal">({email.views.length})</span>
      </h4>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-medium text-muted-foreground h-8">#</TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground h-8">IP Address</TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground h-8">Browser</TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground h-8">OS</TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground h-8">Device</TableHead>
              <TableHead className="text-[11px] font-medium text-muted-foreground h-8 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedViews.map((view, i) => {
              const ua = view.userAgent || '';
              return (
                <TableRow key={view.id} className="border-border">
                  <TableCell className="text-[11px] text-muted-foreground font-mono py-2">{sortedViews.length - i}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                      <span className="text-[12px] text-foreground font-mono">{view.ipAddress || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground py-2">{parseBrowser(ua)}</TableCell>
                  <TableCell className="py-2"><Badge variant="secondary" className="text-[9px] font-medium px-1.5 py-0">{parseOS(ua)}</Badge></TableCell>
                  <TableCell className="text-[12px] text-muted-foreground py-2">{parseDevice(ua)}</TableCell>
                  <TableCell className="text-right py-2">
                    <span className="text-[12px] text-foreground font-medium">{format(new Date(view.viewedAt), 'HH:mm:ss')}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5">{formatRelativeTime(view.viewedAt)}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function EmailDetail({ email, ipGroups, onClose }: { email: Email; ipGroups: IpGroup[]; onClose: () => void }) {
  const lastView = email.views.length > 0
    ? new Date(Math.max(...email.views.map((v) => new Date(v.viewedAt).getTime())))
    : null;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-sm font-bold text-foreground truncate">{email.subject}</h2>
              <p className="text-xs text-muted-foreground mt-1">To: {email.recipient} &middot; {format(new Date(email.createdAt), 'MMM d, yyyy HH:mm')}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] text-muted-foreground font-mono">{email.id}</span>
                <CopyButton text={email.id} />
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: <Eye className="w-4 h-4 text-primary" />, value: email.views.length, label: 'Views' },
              { icon: <Users className="w-4 h-4 text-primary" />, value: ipGroups.length, label: 'Unique IPs' },
              { icon: null, value: lastView ? format(lastView, 'HH:mm') : '—', label: 'Last View' },
            ].map((stat) => (
              <div key={stat.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className={`flex items-center justify-center gap-1.5 ${stat.icon ? 'text-lg' : 'text-sm'} font-bold text-foreground`}>
                  {stat.icon}
                  {stat.value}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-5 space-y-5">
            <EmailChart email={email} />
            {email.views.length > 0 && (
              <>
                <Separator className="bg-border" />
                <ViewsTable email={email} />
              </>
            )}
            {email.views.length === 0 && (
              <div className="text-center py-10">
                <Eye className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No views yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
