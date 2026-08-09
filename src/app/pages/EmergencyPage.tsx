import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartTable, type Column } from '@/components/ui/SmartTable';
import { Timeline } from '@/components/cards/ActivityFeed';
import { cn, timeAgo } from '@/utils';
import { Siren, MapPin, Clock, Activity, Heart, Thermometer, Wind, AlertCircle, Navigation, Ambulance } from 'lucide-react';
import type { EmergencyCase } from '@/types';

const severityConfig: Record<EmergencyCase['severity'], { variant: 'critical' | 'warning' | 'info' | 'success'; label: string }> = {
  level1: { variant: 'critical', label: 'Level 1 — Critical' },
  level2: { variant: 'warning', label: 'Level 2 — Urgent' },
  level3: { variant: 'info', label: 'Level 3 — Moderate' },
  level4: { variant: 'success', label: 'Level 4 — Minor' },
};

const statusLabels: Record<EmergencyCase['status'], string> = {
  active: 'Active', dispatched: 'Dispatched', transporting: 'Transporting', arrived: 'Arrived', resolved: 'Resolved',
};

export default function EmergencyPage() {
  const { emergencies, scopedHospitals, scopedAmbulances, resolveEmergency, dispatchAmbulance } = useRealtimeData();

  const active = emergencies.filter((e) => e.status !== 'resolved');
  const critical = active.filter((e) => e.severity === 'level1');
  const transporting = active.filter((e) => e.status === 'transporting');
  const avgEta = active.length ? Math.round(active.filter((e) => e.eta).reduce((s, e) => s + (e.eta || 0), 0) / (active.filter((e) => e.eta).length || 1)) : 0;

  const columns: Column<EmergencyCase>[] = [
    { key: 'code', header: 'Case ID', sortable: true, sortValue: (e) => e.code, render: (e) => (
      <div className="flex items-center gap-2.5">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', e.severity === 'level1' ? 'bg-critical-500/15 text-critical-400' : 'bg-warning-500/10 text-warning-400')}>
          <Siren className="h-4 w-4" />
        </div>
        <div><p className="font-medium text-ink-100">{e.code}</p><p className="text-xs text-ink-400">{e.patientAge}{e.patientGender} · {e.patientName}</p></div>
      </div>
    )},
    { key: 'severity', header: 'Severity', sortable: true, sortValue: (e) => e.severity, render: (e) => (
      <StatusBadge variant={severityConfig[e.severity].variant} dot pulse={e.severity === 'level1'} size="sm">{severityConfig[e.severity].label}</StatusBadge>
    )},
    { key: 'complaint', header: 'Complaint', render: (e) => <span className="text-ink-200 text-xs">{e.complaint}</span> },
    { key: 'location', header: 'Location', render: (e) => <span className="text-ink-400 text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span> },
    { key: 'status', header: 'Status', sortable: true, sortValue: (e) => e.status, render: (e) => (
      <StatusBadge variant={e.status === 'active' ? 'critical' : e.status === 'dispatched' ? 'warning' : e.status === 'transporting' ? 'accent' : 'success'} size="sm">{statusLabels[e.status]}</StatusBadge>
    )},
    { key: 'eta', header: 'ETA', sortable: true, sortValue: (e) => e.eta || 0, render: (e) => e.eta ? `${e.eta} min` : '—' },
    { key: 'updated', header: 'Updated', render: (e) => <span className="text-ink-500 text-xs">{timeAgo(e.updatedAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Command Center"
        subtitle={`${active.length} active cases · ${critical.length} critical`}
        icon={<Siren className="h-6 w-6" />}
        badge={critical.length > 0 ? <StatusBadge variant="critical" dot pulse>{critical.length} Critical</StatusBadge> : undefined}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Active Cases" value={active.length} icon={<Siren className="h-5 w-5" />} accent="critical" live />
        <MetricCard label="Critical (L1)" value={critical.length} icon={<AlertCircle className="h-5 w-5" />} accent="danger" live />
        <MetricCard label="Transporting" value={transporting.length} icon={<Ambulance className="h-5 w-5" />} accent="warning" live />
        <MetricCard label="Avg ETA" value={avgEta} unit="min" icon={<Clock className="h-5 w-5" />} accent="brand" />
      </div>

      {/* Critical cases with vitals */}
      {critical.length > 0 && (
        <div className="glass p-5">
          <SectionHeader title="Critical Cases — Live Vitals" subtitle={`${critical.length} Level 1 emergencies`} icon={<Heart className="h-4 w-4" />} action={<StatusBadge variant="critical" dot pulse size="sm">Critical</StatusBadge>} />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {critical.slice(0, 6).map((e) => (
              <div key={e.id} className="glass-flat p-4 border-l-2 border-critical-500/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Siren className="h-4 w-4 text-critical-400" />
                    <span className="text-sm font-semibold text-ink-100">{e.code}</span>
                  </div>
                  <StatusBadge variant="critical" dot pulse size="sm">L1</StatusBadge>
                </div>
                <p className="text-xs text-ink-300 mb-3">{e.complaint}</p>
                {e.vitals && (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg bg-base-850/50 px-2 py-1.5">
                      <Heart className="h-3 w-3 text-critical-400 mx-auto mb-0.5" />
                      <p className="text-xs font-bold text-ink-100">{e.vitals.heartRate}</p>
                      <p className="text-[8px] text-ink-500">BPM</p>
                    </div>
                    <div className="rounded-lg bg-base-850/50 px-2 py-1.5">
                      <Wind className="h-3 w-3 text-brand-300 mx-auto mb-0.5" />
                      <p className="text-xs font-bold text-ink-100">{e.vitals.spo2}%</p>
                      <p className="text-[8px] text-ink-500">SpO2</p>
                    </div>
                    <div className="rounded-lg bg-base-850/50 px-2 py-1.5">
                      <Thermometer className="h-3 w-3 text-warning-400 mx-auto mb-0.5" />
                      <p className="text-xs font-bold text-ink-100">{e.vitals.temperature}°</p>
                      <p className="text-[8px] text-ink-500">Temp</p>
                    </div>
                    <div className="rounded-lg bg-base-850/50 px-2 py-1.5">
                      <Activity className="h-3 w-3 text-accent-400 mx-auto mb-0.5" />
                      <p className="text-xs font-bold text-ink-100">{e.vitals.riskScore}</p>
                      <p className="text-[8px] text-ink-500">Risk</p>
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                  {e.eta && <span className="text-xs text-warning-400 flex items-center gap-1"><Navigation className="h-3 w-3" /> {e.eta}m</span>}
                </div>
                <div className="mt-3 flex gap-2">
                  {e.status === 'active' && (
                    <button onClick={() => { const amb = scopedAmbulances.find(a => a.status === 'available'); if (amb) dispatchAmbulance(e.id, amb.id); }} className="flex-1 rounded-lg bg-critical-500/20 text-critical-300 border border-critical-500/30 px-3 py-1.5 text-xs font-medium hover:bg-critical-500/30 transition-all">
                      Dispatch
                    </button>
                  )}
                  <button onClick={() => resolveEmergency(e.id)} className="flex-1 rounded-lg bg-success-500/15 text-success-300 border border-success-500/25 px-3 py-1.5 text-xs font-medium hover:bg-success-500/25 transition-all">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SmartTable columns={columns} data={emergencies} rowKey={(e) => e.id} initialSort={{ key: 'severity', dir: 'asc' }} />
    </div>
  );
}
