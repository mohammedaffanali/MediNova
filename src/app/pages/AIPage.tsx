import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AIRecommendationCard } from '@/components/cards/AIRecommendationCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { cn } from '@/utils';
import { Brain, Sparkles, TrendingUp, Activity, Ambulance, Stethoscope, Building2, Clock, Zap, ArrowRight, Cpu, Database, GitBranch } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import { useUIStore } from '@/store/uiStore';
import type { AIRecommendation } from '@/types';

const forecastData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}:00`,
  icu: Math.floor(Math.random() * 20) + 70,
  ambulance: Math.floor(Math.random() * 15) + 5,
  er: Math.floor(Math.random() * 25) + 50,
}));

const predictions = [
  { title: 'ICU Overload Risk', value: 'High', detail: 'MGH ICU at 96% in 90m', confidence: 92, color: 'var(--color-critical-400)', icon: Activity },
  { title: 'Ambulance Demand', value: '+40%', detail: 'Central Region 14:00-17:00', confidence: 79, color: 'var(--color-warning-400)', icon: Ambulance },
  { title: 'ER Wait Time', value: '38 min', detail: 'MGH — reducing trend', confidence: 85, color: 'var(--color-brand-400)', icon: Clock },
  { title: 'Resource Shortage', value: '3 items', detail: 'O-negative, Ventilators, Oxygen', confidence: 88, color: 'var(--color-danger-400)', icon: Zap },
];

export default function AIPage() {
  const { recommendations, scopedHospitals } = useRealtimeData();
  const { pushToast } = useUIStore();

  const handleAction = (rec: AIRecommendation) => {
    pushToast('AI Action Initiated', rec.action, 'success');
  };

  const capabilities = [
    { icon: Building2, label: 'Recommend Hospitals', desc: 'Find optimal facility based on capacity, proximity, and specialization' },
    { icon: Stethoscope, label: 'Recommend Doctors', desc: 'Match available specialists to patient needs and urgency' },
    { icon: TrendingUp, label: 'Predict Overload', desc: 'Forecast hospital and ICU capacity exhaustion' },
    { icon: Activity, label: 'Predict ICU Demand', desc: 'Project ICU bed requirements for the next 6 hours' },
    { icon: Zap, label: 'Resource Optimization', desc: 'Balance resources across the network automatically' },
    { icon: Ambulance, label: 'Forecast Ambulance Demand', desc: 'Predict surge periods and pre-position units' },
    { icon: ArrowRight, label: 'Summarize Operations', desc: 'Generate natural language operational summaries' },
    { icon: Clock, label: 'Estimate Wait Times', desc: 'Predict ER and department wait times' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Command Center"
        subtitle="Artificial intelligence for healthcare operations"
        icon={<Brain className="h-6 w-6" />}
        badge={<StatusBadge variant="accent" dot pulse>AI Active</StatusBadge>}
      />

      {/* AI Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="AI Status" value="Online" icon={<Cpu className="h-5 w-5" />} accent="success" live />
        <MetricCard label="Active Predictions" value={predictions.length} icon={<TrendingUp className="h-5 w-5" />} accent="accent" />
        <MetricCard label="Recommendations" value={recommendations.length} icon={<Sparkles className="h-5 w-5" />} accent="brand" live />
        <MetricCard label="Model Accuracy" value="94.2" unit="%" icon={<GitBranch className="h-5 w-5" />} accent="success" />
      </div>

      {/* Predictions */}
      <div className="glass p-5">
        <SectionHeader title="AI Predictions & Forecasts" subtitle="Real-time predictive insights" icon={<TrendingUp className="h-4 w-4" />} action={<StatusBadge variant="accent" dot pulse size="sm">Predicting</StatusBadge>} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {predictions.map((p) => (
            <div key={p.title} className="glass-flat p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-850/60" style={{ color: p.color }}>
                  <p.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-bold" style={{ color: p.color }}>{p.value}</span>
              </div>
              <p className="text-sm font-semibold text-ink-100">{p.title}</p>
              <p className="text-xs text-ink-400 mt-0.5">{p.detail}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-base-700 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.confidence}%`, background: p.color }} />
                </div>
                <span className="text-[10px] text-ink-400">{p.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5">
          <SectionHeader title="ICU Occupancy Forecast" subtitle="Next 24 hours" icon={<Activity className="h-4 w-4" />} />
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="icuForecast" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="100%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} />
              <Area type="monotone" dataKey="icu" stroke="#f43f5e" strokeWidth={2} fill="url(#icuForecast)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-5">
          <SectionHeader title="Ambulance Demand Forecast" subtitle="Next 24 hours" icon={<Ambulance className="h-4 w-4" />} />
          <ResponsiveContainer width="100%" height={240} className="mt-4">
            <BarChart data={forecastData}>
              <XAxis dataKey="hour" stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} cursor={{ fill: 'rgba(51,201,255,0.05)' }} />
              <Bar dataKey="ambulance" fill="#33c9ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="glass p-5">
        <SectionHeader title="AI Capabilities" subtitle="What the AI can do" icon={<Sparkles className="h-4 w-4" />} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {capabilities.map((cap) => (
            <div key={cap.label} className="glass-flat p-4 hover:border-brand-500/30 transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300 mb-3">
                <cap.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-sm font-semibold text-ink-100">{cap.label}</p>
              <p className="text-xs text-ink-400 mt-1 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Recommendations */}
      <div className="glass p-5">
        <SectionHeader title="All AI Recommendations" subtitle={`${recommendations.length} active recommendations`} icon={<Brain className="h-4 w-4" />} action={<StatusBadge variant="accent" dot size="sm">AI</StatusBadge>} />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <AIRecommendationCard key={rec.id} recommendation={rec} onAction={handleAction} />
          ))}
        </div>
      </div>
    </div>
  );
}
