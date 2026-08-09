import { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { DoctorCard } from '@/components/cards/DoctorCard';
import { SearchBar, FilterToolbar, SelectFilter } from '@/components/ui/FilterToolbar';
import { EmptyState } from '@/components/ui/EmptyState';
import { AIRecommendationCard } from '@/components/cards/AIRecommendationCard';
import { Stethoscope, Brain, Sparkles } from 'lucide-react';
import type { DoctorStatus } from '@/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'on_call', label: 'On Call' },
  { value: 'in_surgery', label: 'In Surgery' },
  { value: 'off_duty', label: 'Off Duty' },
];

export default function DoctorsPage() {
  const { scopedDoctors, scopedHospitals, recommendations } = useRealtimeData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const departments = [...new Set(scopedDoctors.map((d) => d.department))].sort();

  const filtered = scopedDoctors.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.specialization.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (deptFilter !== 'all' && d.department !== deptFilter) return false;
    return true;
  });

  const hospitalName = (id: string) => scopedHospitals.find((h) => h.id === id)?.name || '';
  const aiDoctorRecs = recommendations.filter((r) => r.type === 'doctor');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Directory"
        subtitle={`${scopedDoctors.length} doctors · ${scopedDoctors.filter(d => d.status === 'available').length} available now`}
        icon={<Stethoscope className="h-6 w-6" />}
      />

      {aiDoctorRecs.length > 0 && (
        <div className="glass p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-brand-300" />
            <span className="text-sm font-semibold text-ink-100">AI Doctor Recommendations</span>
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {aiDoctorRecs.map((rec) => <AIRecommendationCard key={rec.id} recommendation={rec} compact />)}
          </div>
        </div>
      )}

      <div className="glass p-4">
        <FilterToolbar>
          <SearchBar value={search} onChange={setSearch} placeholder="Search doctors, specializations..." className="flex-1 min-w-[200px]" />
          <SelectFilter value={statusFilter} onChange={setStatusFilter} label="Status" options={STATUS_OPTIONS} />
          <SelectFilter value={deptFilter} onChange={setDeptFilter} label="Department" options={[
            { value: 'all', label: 'All Departments' },
            ...departments.map((d) => ({ value: d, label: d })),
          ]} />
        </FilterToolbar>
      </div>

      {filtered.length === 0 ? (
        <div className="glass p-8">
          <EmptyState icon={<Stethoscope className="h-10 w-10" />} title="No doctors found" message="Try adjusting your search or filters." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((d) => <DoctorCard key={d.id} doctor={d} hospitalName={hospitalName(d.hospitalId)} />)}
        </div>
      )}
    </div>
  );
}
