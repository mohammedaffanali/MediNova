import { useState } from 'react';
import { PageHeader } from '@/components/ui/SectionHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchBar, FilterToolbar, SelectFilter } from '@/components/ui/FilterToolbar';
import { SmartTable, type Column } from '@/components/ui/SmartTable';
import { createAuditLogs } from '@/mock/data';
import { ScrollText, Shield, Eye, Edit, Plus, Check, Send, Download, LogIn, Settings } from 'lucide-react';
import type { AuditLog, UserRole } from '@/types';
import { formatDateTime, cn } from '@/utils';

const actionIcons: Record<string, typeof Eye> = {
  VIEW: Eye, UPDATE: Edit, CREATE: Plus, APPROVE: Check, DISPATCH: Send, EXPORT: Download, LOGIN: LogIn, CONFIG: Settings,
};

const actionVariant: Record<string, 'info' | 'warning' | 'success' | 'accent' | 'neutral'> = {
  VIEW: 'info', UPDATE: 'warning', CREATE: 'success', APPROVE: 'success', DISPATCH: 'accent', EXPORT: 'neutral', LOGIN: 'info', CONFIG: 'warning',
};

const roleVariant: Record<UserRole, 'brand' | 'accent' | 'warning'> = {
  system_admin: 'brand', hospital_admin: 'accent', ambulance_crew: 'warning',
};

export default function AuditPage() {
  const [logs] = useState<AuditLog[]>(() => createAuditLogs(40));
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter((l) => {
    if (search && !l.userName.toLowerCase().includes(search.toLowerCase()) && !l.details.toLowerCase().includes(search.toLowerCase())) return false;
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    return true;
  });

  const columns: Column<AuditLog>[] = [
    { key: 'timestamp', header: 'Timestamp', sortable: true, sortValue: (l) => l.timestamp, render: (l) => <span className="text-xs text-ink-400 tabular-nums">{formatDateTime(l.timestamp)}</span> },
    { key: 'user', header: 'User', sortable: true, sortValue: (l) => l.userName, render: (l) => (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold">{l.userName.split(' ').slice(-1)[0][0]}</div>
        <div><p className="text-sm text-ink-100">{l.userName}</p><p className="text-xs text-ink-500">{l.ipAddress}</p></div>
      </div>
    )},
    { key: 'role', header: 'Role', sortable: true, sortValue: (l) => l.userRole, render: (l) => (
      <StatusBadge variant={roleVariant[l.userRole]} size="sm">{l.userRole.replace('_', ' ')}</StatusBadge>
    )},
    { key: 'action', header: 'Action', sortable: true, sortValue: (l) => l.action, render: (l) => {
      const Icon = actionIcons[l.action] || Eye;
      return <div className="flex items-center gap-1.5"><Icon className={cn('h-3.5 w-3.5', `text-${actionVariant[l.action] === 'info' ? 'brand' : actionVariant[l.action] === 'warning' ? 'warning' : actionVariant[l.action] === 'success' ? 'success' : 'accent'}-400`)} /><StatusBadge variant={actionVariant[l.action]} size="sm">{l.action}</StatusBadge></div>;
    }},
    { key: 'resource', header: 'Resource', sortable: true, sortValue: (l) => l.resource, render: (l) => <span className="text-ink-300 text-sm">{l.resource}</span> },
    { key: 'details', header: 'Details', render: (l) => <span className="text-ink-400 text-xs">{l.details}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Security & activity tracking"
        icon={<ScrollText className="h-6 w-6" />}
        badge={<StatusBadge variant="success" dot size="sm">HIPAA-Ready</StatusBadge>}
      />

      <div className="glass p-4 border-l-2 border-success-500/40">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-success-400" />
          <p className="text-sm text-ink-300">
            All actions are logged with user identity, IP address, and timestamp. Sensitive fields are encrypted. This system maintains HIPAA-ready and GDPR-ready audit trails.
          </p>
        </div>
      </div>

      <div className="glass p-4">
        <FilterToolbar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by user or action..." className="flex-1 min-w-[200px]" />
          <SelectFilter value={actionFilter} onChange={setActionFilter} label="Action" options={[
            { value: 'all', label: 'All Actions' },
            { value: 'VIEW', label: 'View' },
            { value: 'UPDATE', label: 'Update' },
            { value: 'CREATE', label: 'Create' },
            { value: 'APPROVE', label: 'Approve' },
            { value: 'DISPATCH', label: 'Dispatch' },
            { value: 'LOGIN', label: 'Login' },
            { value: 'CONFIG', label: 'Config' },
          ]} />
        </FilterToolbar>
      </div>

      <SmartTable columns={columns} data={filtered} rowKey={(l) => l.id} initialSort={{ key: 'timestamp', dir: 'desc' }} />
    </div>
  );
}
