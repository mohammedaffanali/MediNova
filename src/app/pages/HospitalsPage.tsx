import { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { HospitalCard } from '@/components/cards/HospitalCard';
import { SearchBar, FilterToolbar, FilterChip, SelectFilter } from '@/components/ui/FilterToolbar';
import { SmartTable, type Column } from '@/components/ui/SmartTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Building2, MapPin } from 'lucide-react';
import type { Hospital } from '@/types';
import { occupancy, formatNumber } from '@/utils';

const healthVariant: Record<Hospital['health'], 'success' | 'warning' | 'critical'> = {
  optimal: 'success', stable: 'success', strained: 'warning', critical: 'critical',
};

export default function HospitalsPage() {
  const { scopedHospitals } = useRealtimeData();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const filtered = scopedHospitals.filter((h) => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (tierFilter !== 'all' && h.tier !== tierFilter) return false;
    if (healthFilter !== 'all' && h.health !== healthFilter) return false;
    return true;
  });

  const columns: Column<Hospital>[] = [
    { key: 'name', header: 'Hospital', sortable: true, sortValue: (h) => h.name, render: (h) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300"><Building2 className="h-4 w-4" /></div>
        <div><p className="font-medium text-ink-100">{h.name}</p><p className="text-xs text-ink-400">{h.code} · {h.city}</p></div>
      </div>
    )},
    { key: 'tier', header: 'Tier', sortable: true, sortValue: (h) => h.tier, render: (h) => <span className="text-brand-300 font-medium">{h.tier}</span> },
    { key: 'health', header: 'Health', sortable: true, sortValue: (h) => h.healthScore, render: (h) => (
      <div className="flex items-center gap-2">
        <StatusBadge variant={healthVariant[h.health]} dot size="sm">{h.healthScore}</StatusBadge>
      </div>
    )},
    { key: 'beds', header: 'Beds', sortable: true, sortValue: (h) => h.availableBeds, render: (h) => <span className="tabular-nums">{h.availableBeds}/{h.totalBeds}</span> },
    { key: 'icu', header: 'ICU', sortable: true, sortValue: (h) => h.icuAvailable, render: (h) => <span className="tabular-nums">{h.icuAvailable}/{h.icuBeds}</span> },
    { key: 'er', header: 'ER Beds', sortable: true, sortValue: (h) => h.emergencyAvailable, render: (h) => <span className="tabular-nums">{h.emergencyAvailable}/{h.emergencyBeds}</span> },
    { key: 'docs', header: 'Doctors', sortable: true, sortValue: (h) => h.doctors, render: (h) => formatNumber(h.doctors) },
    { key: 'response', header: 'Response', sortable: true, sortValue: (h) => h.responseTime, render: (h) => `${h.responseTime}m` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Network"
        subtitle={`${scopedHospitals.length} hospitals · Real-time status`}
        icon={<Building2 className="h-6 w-6" />}
      />

      <div className="glass p-4">
        <FilterToolbar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search hospitals..." className="flex-1 min-w-[200px]" />
          <SelectFilter value={tierFilter} onChange={setTierFilter} label="Tier" options={[
            { value: 'all', label: 'All Tiers' },
            { value: 'Level I', label: 'Level I' },
            { value: 'Level II', label: 'Level II' },
            { value: 'Level III', label: 'Level III' },
            { value: 'Level IV', label: 'Level IV' },
          ]} />
          <SelectFilter value={healthFilter} onChange={setHealthFilter} label="Health" options={[
            { value: 'all', label: 'All Status' },
            { value: 'optimal', label: 'Optimal' },
            { value: 'stable', label: 'Stable' },
            { value: 'strained', label: 'Strained' },
            { value: 'critical', label: 'Critical' },
          ]} />
          <div className="flex gap-1 ml-auto">
            <FilterChip active={view === 'grid'} onClick={() => setView('grid')}>Grid</FilterChip>
            <FilterChip active={view === 'table'} onClick={() => setView('table')}>Table</FilterChip>
          </div>
        </FilterToolbar>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-8">
          <EmptyState icon={<Building2 className="h-10 w-10" />} title="No hospitals found" message="Try adjusting your search or filters." />
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((h) => <HospitalCard key={h.id} hospital={h} />)}
        </div>
      ) : (
        <SmartTable columns={columns} data={filtered} rowKey={(h) => h.id} />
      )}
    </div>
  );
}
