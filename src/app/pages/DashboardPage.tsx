import { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import NetworkMap from '@/components/ui/NetworkMap';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Building2, AlertTriangle, Ambulance, BedDouble, Stethoscope, Activity,
  Brain, Siren, ChevronRight, Zap, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, CheckCircle2, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const TREND_DATA = [
  { day: 'Mon', Cardiac: 45, Trauma: 30, Respiratory: 55, Neurological: 20 },
  { day: 'Tue', Cardiac: 55, Trauma: 42, Respiratory: 48, Neurological: 28 },
  { day: 'Wed', Cardiac: 40, Trauma: 65, Respiratory: 70, Neurological: 35 },
  { day: 'Thu', Cardiac: 75, Trauma: 48, Respiratory: 60, Neurological: 42 },
  { day: 'Fri', Cardiac: 60, Trauma: 80, Respiratory: 75, Neurological: 50 },
  { day: 'Sat', Cardiac: 85, Trauma: 58, Respiratory: 65, Neurological: 40 },
  { day: 'Sun', Cardiac: 70, Trauma: 92, Respiratory: 80, Neurological: 55 },
];

const DONUT_DATA = [
  { name: 'ICU Beds', value: 72, color: '#38bdf8' },
  { name: 'ER Beds', value: 65, color: '#a855f7' },
  { name: 'General Beds', value: 58, color: '#22c55e' },
  { name: 'Ventilators', value: 60, color: '#f59e0b' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { pushToast, toggleAIPanel } = useUIStore();
  const { hospitals, scopedHospitals, scopedAmbulances, emergencies, alerts, isNetworkView } = useRealtimeData();

  const activeAmbulances = scopedAmbulances.filter((a) => a.status === 'en_route');

  return (
    <div className="space-y-4 font-sans text-ink-200">
      
      {/* ==================== 1. TOP ROW: 6 KPI METRIC CARDS ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Hospitals */}
        <div className="glass-neon-blue p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-success-400 gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 8 Today
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Total Hospitals</p>
            <p className="text-xl font-extrabold text-ink-100 mt-0.5 font-mono">{scopedHospitals.length || 128}</p>
          </div>
        </div>

        {/* Active Emergencies */}
        <div className="glass-neon-red p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-critical-500/20 text-critical-400 border border-critical-500/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-critical-400 gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 14 Today
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Active Emergencies</p>
            <p className="text-xl font-extrabold text-critical-400 mt-0.5 font-mono">{emergencies.length || 86}</p>
          </div>
        </div>

        {/* Ambulances Active */}
        <div className="glass-neon-blue p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30">
              <Ambulance className="h-4 w-4" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-success-400 gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 23 Today
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Ambulances Active</p>
            <p className="text-xl font-extrabold text-accent-300 mt-0.5 font-mono">{scopedAmbulances.length || 164}</p>
          </div>
        </div>

        {/* ICU Occupancy */}
        <div className="glass-neon-orange p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-500/20 text-warning-400 border border-warning-500/30">
              <BedDouble className="h-4 w-4" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-warning-400 gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> 6%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">ICU Occupancy</p>
            <p className="text-xl font-extrabold text-warning-400 mt-0.5 font-mono">72%</p>
          </div>
        </div>

        {/* ER Occupancy */}
        <div className="glass-neon-purple p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-accent-400 gap-0.5">
              <ArrowDownRight className="h-3 w-3" /> 3%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">ER Occupancy</p>
            <p className="text-xl font-extrabold text-purple-300 mt-0.5 font-mono">65%</p>
          </div>
        </div>

        {/* Overall Health Score Gauge */}
        <div className="glass-neon-blue p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">Overall Health Score</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-ink-100 font-mono">84</span>
              <span className="text-[10px] font-bold text-success-400 uppercase">Excellent</span>
            </div>
          </div>
          {/* Circular SVG Gauge */}
          <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
              <path className="text-base-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-accent-400" strokeDasharray="84, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[10px] font-bold text-accent-300">84</span>
          </div>
        </div>

      </div>


      {/* ==================== 2. MIDDLE GRID: LIVE MAP + OVERLAYS + RIGHT PANEL ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* CENTER & LEFT: LIVE MAP WITH FLOATING OVERLAY WIDGETS */}
        <div className="lg:col-span-8 relative min-h-[460px] flex flex-col justify-between">
          
          {/* Floating AI Recommendation Widget (Top Left of Map) */}
          <div className="absolute top-3 left-3 z-20 w-72 glass-neon-purple p-3.5 shadow-float">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Brain className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">AI Recommendation</span>
            </div>
            <p className="text-xs font-bold text-ink-100">City General Hospital</p>
            <p className="text-[11px] text-ink-300 mt-0.5 leading-relaxed">ICU will reach 100% capacity in 45 minutes.</p>
            <p className="text-[9px] text-ink-500 uppercase font-semibold mt-2">Recommended Action</p>
            <button
              onClick={() => pushToast('AI Action Initiated', 'Initiating transfer routing for incoming patients to Apollo Hospital.', 'info')}
              className="mt-2 w-full rounded-lg bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 px-3 py-1.5 text-xs font-semibold text-brand-300 transition-all cursor-pointer text-center"
            >
              View Details
            </button>
          </div>

          {/* Floating Network Status Widget (Bottom Left of Map) */}
          <div className="absolute bottom-3 left-3 z-20 w-64 glass-flat p-3 shadow-float text-xs space-y-1.5">
            <p className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1">Network Status</p>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-ink-400">Hospitals</span>
              <span className="font-mono text-success-400 font-bold">128 / 128</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-ink-400">Ambulances</span>
              <span className="font-mono text-accent-400 font-bold">164 / 180</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-ink-400">Emergency Cases</span>
              <span className="font-mono text-warning-400 font-bold">86</span>
            </div>
            <div className="flex justify-between items-center text-[11px] border-t border-base-750/50 pt-1.5">
              <span className="text-ink-400">System Status</span>
              <span className="text-success-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse" /> Optimal
              </span>
            </div>
          </div>

          {/* Center Map Component */}
          <div className="w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-accent-500/20 shadow-glow relative z-10">
            <NetworkMap center={isNetworkView ? [28.6139, 77.209] : [scopedHospitals[0]?.lat, scopedHospitals[0]?.lng]} zoom={isNetworkView ? 11 : 13} />
          </div>
        </div>

        {/* RIGHT PANEL: AI ASSISTANT & LIVE AMBULANCES */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* AI ASSISTANT Widget */}
          <div className="glass-neon-purple p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink-100">AI ASSISTANT</h3>
                  <p className="text-[9px] text-success-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button onClick={() => toggleAIPanel()} className="text-[10px] text-purple-300 font-bold hover:underline">
                Expand &rarr;
              </button>
            </div>

            <div className="rounded-lg bg-base-900/60 p-3 border border-purple-500/20 text-xs">
              <p className="text-ink-200 leading-relaxed">
                There are <strong className="text-critical-400">3 critical alerts</strong> that require your immediate attention.
              </p>
              <button
                onClick={() => toggleAIPanel()}
                className="mt-2 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 px-2.5 py-1 text-[10px] font-bold text-purple-300 transition-colors"
              >
                View Alerts
              </button>
            </div>

            {/* AI Action Quick Links */}
            <div className="space-y-1 text-xs">
              {[
                { label: 'Recommend Hospitals', icon: Sparkles },
                { label: 'Predict Overload', icon: AlertTriangle },
                { label: 'Resource Optimization', icon: Zap },
                { label: 'Generate Report', icon: Activity },
              ].map((act) => (
                <button
                  key={act.label}
                  onClick={() => { toggleAIPanel(); pushToast('AI Action', `Running ${act.label}...`, 'info'); }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-ink-300 hover:text-ink-100 hover:bg-purple-500/10 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs">
                    <act.icon className="h-3.5 w-3.5 text-purple-400" />
                    {act.label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-500" />
                </button>
              ))}
            </div>
          </div>

          {/* LIVE AMBULANCES Feed */}
          <div className="glass-neon-blue p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-100 uppercase tracking-wider flex items-center gap-2">
                <Ambulance className="h-4 w-4 text-accent-400" /> Live Ambulances
              </h3>
              <span className="text-[10px] text-accent-300 font-semibold cursor-pointer">View All</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {[
                { code: 'AMB-2048', driver: 'John Smith', status: 'En Route', eta: '8 min', variant: 'warning' as const },
                { code: 'AMB-2051', driver: 'David Brown', status: 'On Scene', eta: '3 min', variant: 'info' as const },
                { code: 'AMB-2056', driver: 'Michael Lee', status: 'En Route', eta: '12 min', variant: 'warning' as const },
                { code: 'AMB-2062', driver: 'Robert Wilson', status: 'En Route', eta: '7 min', variant: 'warning' as const },
              ].map((amb) => (
                <div key={amb.code} className="flex items-center justify-between p-2.5 rounded-lg bg-base-900/40 border border-base-750">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-500/10 text-accent-400">
                      <Ambulance className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink-100">{amb.code}</p>
                      <p className="text-[9px] text-ink-400">{amb.driver}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge variant={amb.variant} size="sm">{amb.status}</StatusBadge>
                    <p className="text-[9px] text-ink-500 mt-0.5">ETA {amb.eta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>


      {/* ==================== 3. BOTTOM ROW: CHARTS + ALERTS + AI INSIGHT STRIP ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* EMERGENCY TRENDS Smooth Line Chart */}
        <div className="lg:col-span-5 glass-flat p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink-100 uppercase tracking-wider">Emergency Trends</h3>
            <span className="text-[10px] text-ink-400 font-semibold bg-base-800 px-2 py-0.5 rounded">This Week</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="colorCardiac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrauma" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0a142a', borderColor: '#38bdf8', fontSize: '11px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Cardiac" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorCardiac)" />
                <Area type="monotone" dataKey="Trauma" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorTrauma)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-[10px] text-ink-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#38bdf8]" /> Cardiac</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#a855f7]" /> Trauma</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Respiratory</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> Neurological</span>
          </div>
        </div>

        {/* HOSPITAL CAPACITY OVERVIEW Donut Chart */}
        <div className="lg:col-span-3 glass-flat p-4 space-y-3">
          <h3 className="text-xs font-bold text-ink-100 uppercase tracking-wider">Hospital Capacity Overview</h3>
          
          <div className="flex items-center justify-between">
            <div className="h-32 w-32 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DONUT_DATA} innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value">
                    {DONUT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-ink-100 font-mono">72%</span>
                <span className="text-[8px] text-ink-400 uppercase">Avg Occupancy</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[10px]">
              {DONUT_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-ink-300">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-ink-100 font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CRITICAL ALERTS List */}
        <div className="lg:col-span-4 glass-neon-red p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-critical-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Critical Alerts
            </h3>
            <span className="text-[10px] text-critical-400 font-semibold cursor-pointer">View All</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { title: 'Low Ventilator Supply', loc: 'City General Hospital', time: '5m ago' },
              { title: 'Blood Bank Critical', loc: 'Metro Medical Center', time: '11m ago' },
              { title: 'ICU Nearing Capacity', loc: 'Sunrise Hospital', time: '18m ago' },
            ].map((al, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-base-900/60 border border-critical-500/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-critical-400 shrink-0" />
                  <div>
                    <p className="font-bold text-ink-100 text-[11px]">{al.title}</p>
                    <p className="text-[9px] text-ink-400">{al.loc}</p>
                  </div>
                </div>
                <span className="text-[9px] text-ink-500 font-mono">{al.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>


      {/* ==================== 4. BOTTOM AI INSIGHT FULL-WIDTH STRIP ==================== */}
      <div className="glass-neon-purple p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-glow-purple">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">AI INSIGHT</span>
            <p className="text-xs font-semibold text-ink-100 mt-0.5">
              Increase ambulance deployment in North Zone. High emergency inflow predicted in next 2 hours.
            </p>
          </div>
        </div>

        <button
          onClick={() => pushToast('Action Executed', 'Rerouting 4 available ambulances to North Zone dispatch points.', 'success')}
          className="btn-glow-purple px-5 py-2 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
        >
          Take Action
        </button>
      </div>

    </div>
  );
}
