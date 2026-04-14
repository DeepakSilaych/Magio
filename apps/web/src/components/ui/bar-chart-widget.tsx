'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type DataPoint = {
  label: string;
  views: number;
  [key: string]: unknown;
};

const TOOLTIP_STYLE = {
  background: 'rgba(20,20,30,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
  padding: '8px 12px',
};

const AXIS_TICK = { fill: 'rgba(255,255,255,0.35)', fontSize: 11 };
const GRID_STROKE = 'rgba(255,255,255,0.04)';
const CURSOR_FILL = { fill: 'rgba(255,255,255,0.03)' };

export function BarChartWidget({
  data,
  height = 200,
  maxBarSize = 40,
  xInterval,
  tooltipLabelKey = 'fullLabel',
}: {
  data: DataPoint[];
  height?: number;
  maxBarSize?: number;
  xInterval?: number;
  tooltipLabelKey?: string;
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK}
            interval={xInterval}
          />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={CURSOR_FILL}
            formatter={(value) => [`${value} views`, '']}
            labelFormatter={(_, payload) => (payload?.[0]?.payload as Record<string, string>)?.[tooltipLabelKey] || ''}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          />
          <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={maxBarSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
