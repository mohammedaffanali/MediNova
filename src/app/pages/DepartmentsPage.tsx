import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartTable, type Column } from '@/components/ui/SmartTable';
import { Network, Stethoscope, Users, BedDouble, Clock } from 'lucide-react';
import type { Department } from '@/types';

const statusVariant: Record<Department['status'], 'success' | 'warning' | 'critical' | 'neutral'> = {
  optimal: 'success', adequate: 'success', low: 'warning', critical: 'critical', offline: 'neutral',
};

export default function DepartmentsPage() {
  const { departments, scopedHospitals } = useRealtimeData();
  const hospital = scopedHospitals[0];

  const totalDoctors = departments.reduce((s, d) => s + d.doctors, 0);
  const totalNurses = departments.reduce((s, d) => s + d.nurses, 0);
  const totalBeds = departments.reduce((s, d) => s + d.beds, 0);
  const avgOcc = departments.length ? departments.reduce((s, d) => s + d.occupancy, 0) / departments.length : 0;
  const totalQueue = departments.reduce((s, d) => s + d.queue, 0);

  const columns: Column<Department>[] = [
    { key: 'name', header: 'Department', sortable: true, sortValue: (d) => d.name, render: (d) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300"><Network className="h-4 w-4" /></div>
        <div><p className="font-medium text-ink-100">{d.name}</p><p className="text-xs text-ink-400">Head: {d.head}</p></div>
      </div>
    )},
    { key: 'doctors', header: 'Doctors', sortable: true, sortValue: (d) => d.doctors, render: (d) => d.doctors },
    { key: 'nurses', header: 'Nurses', sortable: true, sortValue: (d) => d.nurses, render: (d) => d.nurses },
    { key: 'beds', header: 'Beds', sortable: true, sortValue: (d) => d.beds, render: (d) => d.beds },
    { key: 'occupancy', header: 'Occupancy', sortable: true, sortValue: (d) => d.occupancy, render: (d) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-base-700 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${d.occupancy}%`, background: d.occupancy > 90 ? '#f43f5e' : d.occupancy > 75 ? '#fbbf24' : '#34d399' }} />
        </div>
        <span className="text-xs tabular-nums">{d.occupancy.toFixed(0)}%</span>
      </div>
    )},
    { key: 'queue', header: 'Queue', sortable: true, sortValue: (d) => d.queue, render: (d) => <span className="tabular-nums">{d.queue}</span> },
    { key: 'wait', header: 'Avg Wait', sortable: true, sortValue: (d) => d.avgWaitTime, render: (d) => `${d.avgWaitTime}m` },
    { key: 'status', header: 'Status', sortable: true, sortValue: (d) => d.status, render: (d) => (
      <StatusBadge variant={statusVariant[d.status]} dot size="sm">{d.status}</StatusBadge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle={hospital ? `${hospital.name} · ${departments.length} departments` : `${departments.length} departments`}
        icon={<Network className="h-6 w-6" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Doctors" value={totalDoctors} icon={<Stethoscope className="h-5 w-5" />} />
        <StatCard label="Total Nurses" value={totalNurses} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total Beds" value={totalBeds} icon={<BedDouble className="h-5 w-5" />} />
        <StatCard label="Avg Occupancy" value={`${avgOcc.toFixed(0)}%`} ringValue={avgOcc} ringColor={avgOcc > 85 ? 'var(--color-critical-400)' : avgOcc > 70 ? 'var(--color-warning-400)' : 'var(--color-success-400)'} />
      </div>

      <div className="glass p-5">
        <SectionHeader title="Department Status" subtitle="All departments" icon={<Network className="h-4 w-4" />} action={<StatusBadge variant="warning" dot size="sm">{totalQueue} in queue</StatusBadge>} />
      </div>

      <SmartTable columns={columns} data={departments} rowKey={(d) => d.id} initialSort={{ key: 'occupancy', dir: 'desc' }} />
    </div>
  );
}
