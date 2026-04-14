'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Mail, Eye, Globe, TrendingUp, Zap, Send } from 'lucide-react';
import type { DashboardStats } from '@/lib/types';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1.5 tracking-tight">{value}</p>
          </div>
          <div className="text-muted-foreground/50">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsOverview({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCard label="Total Emails" value={stats.totalEmails} icon={<Mail className="w-5 h-5" />} />
      <StatCard label="Total Views" value={stats.totalViews} icon={<Eye className="w-5 h-5" />} />
      <StatCard label="Unique IPs" value={stats.uniqueIps} icon={<Globe className="w-5 h-5" />} />
      <StatCard label="Avg. Views" value={stats.avgViewsPerEmail} icon={<TrendingUp className="w-5 h-5" />} />
      <StatCard label="Views Today" value={stats.viewsToday} icon={<Zap className="w-5 h-5" />} />
      <StatCard label="Sent Today" value={stats.emailsToday} icon={<Send className="w-5 h-5" />} />
    </div>
  );
}
