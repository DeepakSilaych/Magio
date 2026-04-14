'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { Eye, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { Email, SortKey, SortDir } from '@/lib/types';

type Props = {
  emails: Email[];
  search: string;
  onSearchChange: (val: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onToggleSort: (key: SortKey) => void;
  selectedEmailId: string | null;
  onSelectEmail: (id: string | null) => void;
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return dir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />;
}

function SortableHead({ label, sortKeyVal, currentKey, dir, onToggle }: {
  label: string; sortKeyVal: SortKey; currentKey: SortKey; dir: SortDir; onToggle: (key: SortKey) => void;
}) {
  return (
    <TableHead>
      <button onClick={() => onToggle(sortKeyVal)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        {label} <SortIcon active={currentKey === sortKeyVal} dir={dir} />
      </button>
    </TableHead>
  );
}

export function EmailList({ emails, search, onSearchChange, sortKey, sortDir, onToggleSort, selectedEmailId, onSelectEmail }: Props) {
  return (
    <DataTableShell title="Tracked Emails" subtitle="All emails with embedded tracker" search={search} onSearchChange={onSearchChange} count={emails.length} countLabel="email">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <SortableHead label="Subject" sortKeyVal="subject" currentKey={sortKey} dir={sortDir} onToggle={onToggleSort} />
            <SortableHead label="Recipient" sortKeyVal="recipient" currentKey={sortKey} dir={sortDir} onToggle={onToggleSort} />
            <SortableHead label="Sent" sortKeyVal="createdAt" currentKey={sortKey} dir={sortDir} onToggle={onToggleSort} />
            <SortableHead label="Views" sortKeyVal="views" currentKey={sortKey} dir={sortDir} onToggle={onToggleSort} />
            <TableHead className="text-xs font-medium text-muted-foreground text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.length === 0 ? (
            <TableRow className="border-border">
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No emails found.</TableCell>
            </TableRow>
          ) : (
            emails.map((email) => (
              <TableRow
                key={email.id}
                onClick={() => onSelectEmail(selectedEmailId === email.id ? null : email.id)}
                className={`border-border cursor-pointer transition-colors ${selectedEmailId === email.id ? 'bg-accent/50' : ''}`}
              >
                <TableCell><p className="text-[13px] font-medium text-foreground truncate max-w-[220px]">{email.subject}</p></TableCell>
                <TableCell><p className="text-[13px] text-muted-foreground truncate max-w-[180px]">{email.recipient}</p></TableCell>
                <TableCell><p className="text-[13px] text-muted-foreground">{format(new Date(email.createdAt), 'MMM d, HH:mm')}</p></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[13px] font-semibold text-foreground">{email.views.length}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {email.views.length > 0 ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 text-[10px]">Opened</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
