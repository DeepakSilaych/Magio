'use client';

import type { TimeRange } from '@/lib/chart-utils';

const RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

export function TimeRangeToggle({
  value,
  onChange,
  size = 'md',
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
  size?: 'sm' | 'md';
}) {
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]';

  return (
    <div className="flex items-center bg-secondary rounded-lg p-0.5">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`${px} font-medium rounded-md transition-colors ${
            value === opt.value
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
