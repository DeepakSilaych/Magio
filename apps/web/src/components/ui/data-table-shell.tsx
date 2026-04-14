'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

export function DataTableShell({
  title,
  subtitle,
  search,
  onSearchChange,
  count,
  countLabel,
  children,
}: {
  title: string;
  subtitle: string;
  search: string;
  onSearchChange: (val: string) => void;
  count: number;
  countLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search"
              className="pl-9 h-8 text-xs bg-secondary border-border"
            />
          </div>
        </div>
        <ScrollArea className="h-[480px]">
          {children}
        </ScrollArea>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground">
            {count} {countLabel}{count !== 1 ? 's' : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
