import { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatCard } from '@/components/ui/StatCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartTable, type Column } from '@/components/ui/SmartTable';
import { SearchBar, FilterToolbar, SelectFilter } from '@/components/ui/FilterToolbar';
import { cn } from '@/utils';
import { Ambulance, Fuel, Gauge, Navigation, Users, Radio, MapPin, Activity, Clock } from 'lucide-react';
import type { Ambulance as AmbType } from '@/types';

const statusVariant: Record<AmbType['status'], 'success' | 'warning' | 'critical' | 'neutral' | 'accent'> = {
  available: 'success', en_route: 'warning', on_scene: 'critical', transporting: 'critical', returning: 'accent', offline: 'neutral',
};

const statusLabels: Record<AmbType['status'], string> = {
  available: 'Available', en_route: 'En Route', on_scene: 'On Scene', transporting: 'Transporting', returning: 'Returning', offline: 'Offline',
};

export default function AmbulancesPage() {
  const { scopedAmbulances, scopedHospitals } = useRealtimeData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = scopedAmbulances.filter((a) => {
    if (search && !a.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const available = scopedAmbulances.filter((a) => a.status === 'available').length;
  const enRoute = scopedAmbulances.filter((a) => a.status === 'en_route' || a.status === 'transporting').length;
  const offline = scopedAmbulances.filter((a) => a.status === 'offline').length;
  const avgFuel = scopedAmbulances.length ? Math.round(scopedAmbulances.reduce((s, a) => s + a.fuel, 0) / scopedAmbulances.length) : 0;

  const columns: Column<AmbType>[] = [
    { key: 'code', header: 'Code', sortable: true, sortValue: (a) => a.code, render: (a) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300"><Ambulance className="h-4 w-4" /></div>
        <div><p className="font-medium text-ink-100">{a.code}</p><p className="text-xs text-ink-400">{a.type}</p></div>
      </div>
    )},
    { key: 'status', header: 'Status', sortable: true, sortValue: (a) => a.status, render: (a) => (
      <StatusBadge variant={statusVariant[a.status]} dot pulse={a.status === 'transporting' || a.status === 'on_scene'} size="sm">{statusLabels[a.status]}</StatusBadge>
    )},
    { key: 'driver', header: 'Driver', render: (a) => <span className="text-ink-200">{a.driver}</span> },
    { key: 'crew', header: 'Crew', render: (a) => <span className="text-ink-400 text-xs">{a.crew.length + 1} members</span> },
    { key: 'speed', header: 'Speed', sortable: true, sortValue: (a) => a.speed, render: (a) => a.speed > 0 ? `${a.speed} km/h` : '—' },
    { key: 'eta', header: 'ETA', sortable: true, sortValue: (a) => a.eta, render: (a) => a.eta > 0 ? `${a.eta} min` : '—' },
    { key: 'fuel', header: 'Fuel', sortable: true, sortValue: (a) => a.fuel, render: (a) => (
      <div className="flex items-center gap-2">
        <div className="w-12 h-1.5 rounded-full bg-base-700 overflow-hidden">
          <div className={cn('h-full rounded-full', a.fuel > 50 ? 'bg-success-400' : a.fuel > 25 ? 'bg-warning-400' : 'bg-danger-400')} style={{ width: `${a.fuel}%` }} />
        </div>
        <span className="text-xs tabular-nums">{a.fuel}%</span>
      </div>
    )},
    { key: 'priority', header: 'Priority', render: (a) => a.patientPriority ? (
      <StatusBadge variant={a.patientPriority === 'critical' ? 'critical' : a.patientPriority === 'urgent' ? 'warning' : 'info'} size="sm">{a.patientPriority}</StatusBadge>
    ) : '—' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ambulance Fleet"
        subtitle={`${scopedAmbulances.length} ambulances · Tablet-optimized`}
        icon={<Ambulance className="h-6 w-6" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Available" value={available} icon={<Ambulance className="h-5 w-5" />} accent="success" live />
        <MetricCard label="On Active Duty" value={enRoute} icon={<Navigation className="h-5 w-5" />} accent="warning" live />
        <MetricCard label="Offline" value={offline} icon={<Radio className="h-5 w-5" />} accent="danger" />
        <MetricCard label="Avg Fuel" value={avgFuel} unit="%" icon={<Fuel className="h-5 w-5" />} accent="brand" />
      </div>

      <div className="glass p-4">
        <FilterToolbar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search ambulance code..." className="flex-1 min-w-[200px]" />
          <SelectFilter value={statusFilter} onChange={setStatusFilter} label="Status" options={[
            { value: 'all', label: 'All Status' },
            { value: 'available', label: 'Available' },
            { value: 'en_route', label: 'En Route' },
            { value: 'on_scene', label: 'On Scene' },
            { value: 'transporting', label: 'Transporting' },
            { value: 'returning', label: 'Returning' },
            { value: 'offline', label: 'Offline' },
          ]} />
        </FilterToolbar>
      </div>

      <SmartTable columns={columns} data={filtered} rowKey={(a) => a.id} initialSort={{ key: 'status', dir: 'asc' }} />

      {/* Active ambulance detail cards */}
      {filtered.filter((a) => a.status !== 'available' && a.status !== 'offline').length > 0 && (
        <div className="glass p-5">
          <SectionHeader title="Active Units" subtitle="Live tracking" icon={<Activity className="h-4 w-4" />} action={<StatusBadge variant="success" dot pulse size="sm">Live</StatusBadge>} />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.filter((a) => a.status !== 'available' && a.status !== 'offline').map((a) => (
              <div key={a.id} className="glass-flat p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300"><Ambulance className="h-4 w-4" /></div>
                    <div><p className="text-sm font-semibold text-ink-100">{a.code}</p><p className="text-xs text-ink-400">{a.type}</p></div>
                  </div>
                  <StatusBadge variant={statusVariant[a.status]} dot pulse size="sm">{statusLabels[a.status]}</StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-ink-300"><Gauge className="h-3.5 w-3.5 text-brand-300" /> {a.speed} km/h</div>
                  <div className="flex items-center gap-1.5 text-ink-300"><Clock className="h-3.5 w-3.5 text-warning-400" /> ETA {a.eta || 0}m</div>
                  <div className="flex items-center gap-1.5 text-ink-300"><Fuel className="h-3.5 w-3.5 text-success-400" /> {a.fuel}%</div>
                  <div className="flex items-center gap-1.5 text-ink-300"><Users className="h-3.5 w-3.5 text-accent-400" /> {a.crew.length + 1}</div>
                </div>
                {a.patientPriority && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-ink-500 uppercase">Patient:</span>
                    <StatusBadge variant={a.patientPriority === 'critical' ? 'critical' : 'warning'} size="sm">{a.patientPriority}</StatusBadge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
