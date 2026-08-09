import { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PageHeader } from '@/components/ui/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartTable, type Column } from '@/components/ui/SmartTable';
import { Timeline } from '@/components/cards/ActivityFeed';
import { cn, timeAgo } from '@/utils';
import {
  ArrowRightLeft, CheckCircle2, Clock, Brain, Zap, ArrowRight,
  Plus, X, User, ShieldAlert, Check, HelpCircle
} from 'lucide-react';
import type { Transfer, TransferStatus } from '@/types';

const statusConfig: Record<TransferStatus, { variant: 'neutral' | 'info' | 'accent' | 'warning' | 'success' | 'critical'; label: string }> = {
  pending: { variant: 'neutral', label: 'Pending' },
  ai_analysis: { variant: 'info', label: 'AI Analysis' },
  hospital_ranking: { variant: 'info', label: 'Hospital Ranking' },
  bed_reserved: { variant: 'accent', label: 'Bed Reserved' },
  ambulance_assigned: { variant: 'warning', label: 'Ambulance Assigned' },
  hospital_accepted: { variant: 'warning', label: 'Hospital Accepted' },
  in_transit: { variant: 'critical', label: 'In Transit' },
  completed: { variant: 'success', label: 'Completed' },
  rejected: { variant: 'neutral', label: 'Rejected' },
};

const flowSteps: TransferStatus[] = [
  'pending',
  'ai_analysis',
  'hospital_ranking',
  'bed_reserved',
  'ambulance_assigned',
  'hospital_accepted',
  'in_transit',
  'completed'
];

export default function TransfersPage() {
  const user = useAuthStore((s) => s.user);
  const { pushToast } = useUIStore();
  const { transfers, hospitals, advanceTransfer, createTransfer, scopedHospitals } = useRealtimeData();

  // Wizard modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(45);
  const [fromHospId, setFromHospId] = useState(user?.hospitalId || 'hosp_1');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [transferReason, setTransferReason] = useState('ICU bed unavailable at source facility');
  const [priority, setPriority] = useState<'critical' | 'urgent' | 'moderate'>('urgent');

  const active = transfers.filter((t) => t.status !== 'completed' && t.status !== 'rejected');
  const completed = transfers.filter((t) => t.status === 'completed');
  const inTransit = transfers.filter((t) => t.status === 'in_transit');
  const pending = transfers.filter((t) => t.status === 'pending');

  const hospitalName = (id: string) => hospitals.find((h) => h.id === id)?.name || 'Unknown';

  const handleCreateTransferSubmit = (targetHospitalId: string) => {
    if (!patientName.trim()) {
      pushToast('Input Error', 'Please specify a patient name.', 'warning');
      return;
    }

    createTransfer({
      patientName,
      patientAge,
      fromHospitalId: fromHospId,
      toHospitalId: targetHospitalId,
      reason: transferReason,
      priority,
    });

    pushToast(
      'Transfer Scheduled',
      `Patient transfer TRF-${500 + transfers.length + 1} initiated. AI has booked the ICU bed at ${hospitalName(targetHospitalId)}.`,
      'success'
    );

    // Reset and close
    setPatientName('');
    setWizardOpen(false);
  };

  // Live Hospital Match Scoring for the wizard
  const getScoredTargetHospitals = () => {
    return hospitals
      .filter((h) => h.id !== fromHospId)
      .map((h) => {
        let score = 98;
        
        // Severity and bed metrics
        if (h.icuAvailable === 0 && priority === 'critical') score -= 30;
        if (h.emergencyAvailable === 0) score -= 15;
        if (h.avgWaitTime > 45) score -= 10;
        
        // Specialty match modifier (mocked)
        const isMtc = h.code === 'MTC';
        const isMch = h.code === 'MCH';
        const isMci = h.code === 'MCI';

        if (specialty === 'Trauma Surgery' && !isMtc) score -= 12;
        if (specialty === 'Pediatrics' && !isMch) score -= 25;
        if (specialty === 'Cardiology' && !isMci) score -= 10;

        return {
          hospital: h,
          score: Math.max(40, score),
          reason: h.icuAvailable > 0 ? 'Optimal ICU bed count & specialized staff ready.' : 'High trauma triage capability matches case profile.',
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  const columns: Column<Transfer>[] = [
    { key: 'code', header: 'Transfer ID', sortable: true, sortValue: (t) => t.code, render: (t) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400"><ArrowRightLeft className="h-4 w-4" /></div>
        <div><p className="font-medium text-ink-100">{t.code}</p><p className="text-xs text-ink-400">{t.patientName} · {t.patientAge}y</p></div>
      </div>
    )},
    { key: 'from', header: 'From', render: (t) => <span className="text-xs text-ink-300">{hospitalName(t.fromHospitalId)}</span> },
    { key: 'to', header: 'To', render: (t) => t.toHospitalId ? <span className="text-xs text-ink-300">{hospitalName(t.toHospitalId)}</span> : <span className="text-xs text-ink-500">TBD</span> },
    { key: 'reason', header: 'Reason', render: (t) => <span className="text-xs text-ink-400">{t.reason}</span> },
    { key: 'priority', header: 'Priority', sortable: true, sortValue: (t) => t.priority, render: (t) => (
      <StatusBadge variant={t.priority === 'critical' ? 'critical' : t.priority === 'urgent' ? 'warning' : 'info'} size="sm">{t.priority}</StatusBadge>
    )},
    { key: 'status', header: 'Status', sortable: true, sortValue: (t) => t.status, render: (t) => (
      <StatusBadge variant={statusConfig[t.status].variant} dot pulse={t.status === 'in_transit'} size="sm">{statusConfig[t.status].label}</StatusBadge>
    )},
    { key: 'action', header: 'Action', render: (t) => t.status !== 'completed' && t.status !== 'rejected' ? (
      <button onClick={() => advanceTransfer(t.id)} className="flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-200 transition-colors">
        Advance <ArrowRight className="h-3 w-3" />
      </button>
    ) : <CheckCircle2 className="h-4 w-4 text-success-400" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Transfer Command"
        subtitle={`${active.length} active transfers · ${completed.length} completed`}
        icon={<ArrowRightLeft className="h-6 w-6" />}
        actions={
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 px-4 py-2 text-xs font-semibold text-base-950 shadow-glow transition-all cursor-pointer font-sans"
          >
            <Plus className="h-4 w-4" /> Request Transfer
          </button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Active Transfers" value={active.length} icon={<ArrowRightLeft className="h-5 w-5" />} accent="accent" live />
        <MetricCard label="Pending Analysis" value={pending.length} icon={<Clock className="h-5 w-5" />} accent="warning" />
        <MetricCard label="In Transit" value={inTransit.length} icon={<Zap className="h-5 w-5" />} accent="critical" live />
        <MetricCard label="Successfully Completed" value={completed.length} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
      </div>

      {/* AI Wizard Modal Dialog */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-base-950/70 backdrop-blur-md" onClick={() => setWizardOpen(false)} />
          <div className="relative w-full max-w-4xl glass p-6 border border-base-750/60 shadow-float flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-base-700/40 pb-3.5">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-300" />
                <h3 className="text-base font-bold text-ink-100">AI-Assisted Patient Transfer Coordinator</h3>
              </div>
              <button onClick={() => setWizardOpen(false)} className="text-ink-400 hover:text-ink-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 no-scrollbar">
              
              {/* Form Input fields (Left 5 cols) */}
              <div className="lg:col-span-5 space-y-4 pr-0 lg:pr-2">
                <SectionHeader title="Patient Details" subtitle="Operational metrics scoping" className="text-xs" />
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1 block">Patient Name</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-lg bg-base-850 border border-base-750 px-3 py-1.5 text-xs text-ink-100 focus:outline-none focus:border-brand-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1 block">Age</label>
                    <input
                      type="number"
                      required
                      value={patientAge}
                      onChange={(e) => setPatientAge(parseInt(e.target.value))}
                      className="w-full rounded-lg bg-base-850 border border-base-750 px-3 py-1.5 text-xs text-ink-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1 block">Source Hospital</label>
                    <select
                      value={fromHospId}
                      onChange={(e) => setFromHospId(e.target.value)}
                      className="w-full rounded-lg bg-base-850 border border-base-750 px-3 py-1.5 text-xs text-ink-200 focus:outline-none"
                    >
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>{h.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1 block">Specialty Needed</label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full rounded-lg bg-base-850 border border-base-750 px-3 py-1.5 text-xs text-ink-200 focus:outline-none"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Trauma Surgery">Trauma Surgery</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1 block">Transfer Reason</label>
                  <select
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full rounded-lg bg-base-850 border border-base-750 px-3 py-1.5 text-xs text-ink-200 focus:outline-none"
                  >
                    <option value="ICU bed unavailable at source facility">ICU bed unavailable</option>
                    <option value="Specialized cardiac care required">Specialized Cardiac Care required</option>
                    <option value="Trauma center transfer for polytrauma">Polytrauma specialized care</option>
                    <option value="Pediatric ICU capacity exceeded">Pediatric ICU capacity full</option>
                    <option value="Equipment Failure (MRI/CT scans offline)">Equipment failure (MRI/CT offline)</option>
                    <option value="Long waiting time optimization">Long waiting times</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1 block">Priority Severity</label>
                  <div className="flex gap-2">
                    {['moderate', 'urgent', 'critical'].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setPriority(pr as any)}
                        className={cn(
                          'flex-1 text-center py-1.5 text-xs font-semibold rounded border uppercase tracking-wider',
                          priority === pr 
                            ? pr === 'critical' ? 'bg-critical-500/10 border-critical-500/30 text-critical-400' : pr === 'urgent' ? 'bg-warning-500/10 border-warning-500/30 text-warning-400' : 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                            : 'bg-base-850/40 border-base-750 text-ink-400'
                        )}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Ranked Recommendations (Right 7 cols) */}
              <div className="lg:col-span-7 space-y-3 pl-0 lg:pl-4 lg:border-l border-base-700/30">
                <SectionHeader title="AI Capacity Analysis" subtitle="Optimized target hospitals by triage factors" icon={<Zap className="h-4 w-4 text-brand-300" />} />
                
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                  {getScoredTargetHospitals().map(({ hospital: targetHosp, score, reason }) => (
                    <div key={targetHosp.id} className="glass-flat p-4 hover:border-brand-500/20 border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-ink-100">{targetHosp.name}</h4>
                          <span className={cn(
                            'text-[9px] font-mono font-bold px-1.5 rounded',
                            score >= 90 
                              ? 'bg-success-400/10 text-success-400 border border-success-400/20' 
                              : 'bg-warning-400/10 text-warning-400 border border-warning-400/20'
                          )}>
                            {score}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-ink-400 mt-1 leading-relaxed">{reason}</p>
                        <p className="text-[9px] text-ink-500 mt-1">
                          ICU Available: <strong className="text-ink-300">{targetHosp.icuAvailable}/{targetHosp.icuBeds}</strong> · Wait SLA: <strong className="text-ink-300">{targetHosp.avgWaitTime}m</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => handleCreateTransferSubmit(targetHosp.id)}
                        className="rounded bg-brand-500 hover:bg-brand-400 px-3 py-1.5 text-[10px] font-bold text-base-950 shrink-0 w-full md:w-auto text-center cursor-pointer"
                      >
                        Select & Initiate
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Transfer Pipeline Workflow */}
      <div className="glass p-5">
        <SectionHeader title="Transfer Pipeline Workflow" subtitle="AI-assisted patient transfer progress tracker" icon={<Brain className="h-4 w-4" />} />
        <div className="mt-6 flex items-center gap-1 overflow-x-auto no-scrollbar pb-2">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <div className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border',
                i === 0 ? 'bg-brand-500/15 text-brand-200 border-brand-500/30' : 'bg-base-850/40 text-ink-400 border-base-700/50',
              )}>
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                  i === 0 ? 'bg-brand-500/30 text-brand-200' : 'bg-base-700/50 text-ink-400',
                )}>{i + 1}</span>
                {statusConfig[step].label}
              </div>
              {i < flowSteps.length - 1 && <ArrowRight className="h-3 w-3 text-ink-500 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Active Transfer timelines progress */}
      {active.length > 0 && (
        <div className="glass p-5">
          <SectionHeader title="Active Transfer Trackers" subtitle="Real-time timeline progression" icon={<ArrowRightLeft className="h-4 w-4" />} />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.slice(0, 6).map((t) => {
              const currentStep = flowSteps.indexOf(t.status);
              return (
                <div key={t.id} className="glass-flat p-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-base-750 pb-2">
                      <div>
                        <span className="text-sm font-semibold text-ink-100">{t.code}</span>
                        <p className="text-[10px] text-ink-400 mt-0.5">Patient: {t.patientName}</p>
                      </div>
                      <StatusBadge variant={statusConfig[t.status].variant} dot pulse={t.status === 'in_transit'} size="sm">{statusConfig[t.status].label}</StatusBadge>
                    </div>
                    
                    {/* Compact timeline display */}
                    <div className="space-y-3 pl-2 py-1">
                      <div className="flex gap-3 text-xs text-ink-300">
                        <span className="text-ink-400 font-medium">Origin:</span>
                        <span className="truncate">{hospitalName(t.fromHospitalId)}</span>
                      </div>
                      {t.toHospitalId && (
                        <div className="flex gap-3 text-xs text-ink-300">
                          <span className="text-ink-400 font-medium">Target:</span>
                          <span className="truncate">{hospitalName(t.toHospitalId)}</span>
                        </div>
                      )}
                      <div className="flex gap-3 text-xs text-ink-400 leading-relaxed italic">
                        <span>"{t.reason}"</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-base-750">
                    <Timeline items={flowSteps.slice(Math.max(0, currentStep - 1), currentStep + 2).map((step) => {
                      const idx = flowSteps.indexOf(step);
                      return {
                        id: `${t.id}-${step}`,
                        label: statusConfig[step].label,
                        time: idx < currentStep ? 'Done' : idx === currentStep ? 'Active' : 'Pending',
                        status: idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending',
                      };
                    })} />
                    {t.status !== 'completed' && (
                      <button onClick={() => advanceTransfer(t.id)} className="mt-4 w-full rounded-lg bg-brand-500/15 text-brand-200 border border-brand-500/25 px-3 py-2 text-xs font-semibold hover:bg-brand-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                        Advance State <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transfers Data Table */}
      <SmartTable columns={columns} data={transfers} rowKey={(t) => t.id} initialSort={{ key: 'status', dir: 'asc' }} />
    </div>
  );
}
