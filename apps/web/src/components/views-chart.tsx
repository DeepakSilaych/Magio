'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TimeRangeToggle } from '@/components/ui/time-range-toggle';
import { BarChartWidget } from '@/components/ui/bar-chart-widget';
import { getChartData, type TimeRange } from '@/lib/chart-utils';
import type { Email } from '@/lib/types';

export function ViewsChart({ emails }: { emails: Email[] }) {
  const [range, setRange] = useState<TimeRange>('7d');
  const data = useMemo(() => getChartData(emails, range), [emails, range]);

  const xInterval = range === '24h' ? 3 : range === '30d' ? 4 : undefined;
  const barSize = range === '24h' ? 16 : range === '30d' ? 14 : 40;
  const subtitle = range === '24h' ? 'Last 24 hours' : range === '7d' ? 'Last 7 days' : 'Last 30 days';

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Views</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <TimeRangeToggle value={range} onChange={setRange} />
        </div>
        <BarChartWidget data={data} maxBarSize={barSize} xInterval={xInterval} />
      </CardContent>
    </Card>
  );
}
