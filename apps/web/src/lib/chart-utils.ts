import type { Email } from './types';
import { format } from 'date-fns';

export type TimeRange = '24h' | '7d' | '30d';

export type ChartDataPoint = {
  key: string;
  label: string;
  fullLabel: string;
  views: number;
};

export function getChartData(emails: Email[], range: TimeRange): ChartDataPoint[] {
  const allViews = emails.flatMap((e) => e.views);
  const now = new Date();

  if (range === '24h') {
    const points: ChartDataPoint[] = [];
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(d.getHours() - i, 0, 0, 0);
      const hourKey = d.toISOString().slice(0, 13);
      points.push({
        key: hourKey,
        label: format(d, 'HH:mm'),
        fullLabel: format(d, 'MMM d, HH:mm'),
        views: 0,
      });
    }
    allViews.forEach((v) => {
      const vd = new Date(v.viewedAt);
      const hourKey = vd.toISOString().slice(0, 13);
      const point = points.find((p) => p.key === hourKey);
      if (point) point.views++;
    });
    return points;
  }

  const days = range === '7d' ? 7 : 30;
  const points: ChartDataPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().split('T')[0];
    points.push({
      key: dayKey,
      label: range === '7d' ? format(d, 'EEE') : format(d, 'MMM d'),
      fullLabel: format(d, 'MMM d, yyyy'),
      views: 0,
    });
  }
  allViews.forEach((v) => {
    const dayKey = new Date(v.viewedAt).toISOString().split('T')[0];
    const point = points.find((p) => p.key === dayKey);
    if (point) point.views++;
  });
  return points;
}
