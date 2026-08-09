import { useRealtimeData } from '@/hooks/useRealtimeData';
import { PageHeader } from '@/components/ui/SectionHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChart3, TrendingUp, Activity, Clock, ArrowRightLeft, Stethoscope, BedDouble } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';

const COLORS = ['#33c9ff', '#4d8dff', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export default function AnalyticsPage() {
  const { scopedHospitals, scopedDoctors, scopedAmbulances, transfers, emergencies } = useRealtimeData();

  const performanceData = scopedHospitals.slice(0, 6).map((h) => ({
    name: h.code,
    admissions: Math.floor(Math.random() * 50) + 20,
    discharges: Math.floor(Math.random() * 40) + 15,
    efficiency: h.healthScore,
  }));

  const workloadData = scopedDoctors.slice(0, 8).map((d) => ({
    name: d.name.split(' ').slice(-1)[0],
    patients: d.patientsToday,
    hours: 12,
  }));

  const responseTimeData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    time: Math.floor(Math.random() * 10) + 5,
    target: 8,
  }));

  const transferData = [
    { name: 'Completed', value: transfers.filter(t => t.status === 'completed').length, fill: '#34d399' },
    { name: 'In Transit', value: transfers.filter(t => t.status === 'in_transit').length, fill: '#33c9ff' },
    { name: 'Pending', value: transfers.filter(t => t.status === 'pending' || t.status === 'ai_analysis').length, fill: '#fbbf24' },
    { name: 'Active', value: transfers.filter(t => !['completed', 'rejected', 'pending', 'ai_analysis'].includes(t.status)).length, fill: '#4d8dff' },
  ];

  const occupancyTrend = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}h`,
    icu: Math.floor(Math.random() * 20) + 70,
    general: Math.floor(Math.random() * 15) + 60,
    er: Math.floor(Math.random() * 25) + 50,
  }));

  const deptPerformance = ['ER', 'ICU', 'Cardio', 'Neuro', 'Trauma', 'Peds', 'Ortho', 'Onco'].map((name) => ({
    name,
    score: Math.floor(Math.random() * 30) + 70,
    fill: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Performance insights across the network"
        icon={<BarChart3 className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass p-5">
          <SectionHeader title="Hospital Performance" subtitle="Admissions vs Discharges" icon={<TrendingUp className="h-4 w-4" />} />
          <ResponsiveContainer width="100%" height={260} className="mt-4">
            <BarChart data={performanceData}>
              <XAxis dataKey="name" stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} cursor={{ fill: 'rgba(51,201,255,0.05)' }} />
              <Bar dataKey="admissions" fill="#33c9ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="discharges" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <SectionHeader title="Doctor Workload" subtitle="Patients per doctor today" icon={<Stethoscope className="h-4 w-4" />} />
          <ResponsiveContainer width="100%" height={260} className="mt-4">
            <BarChart data={workloadData} layout="vertical">
              <XAxis type="number" stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} cursor={{ fill: 'rgba(51,201,255,0.05)' }} />
              <Bar dataKey="patients" fill="#4d8dff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass p-5">
          <SectionHeader title="Response Time" subtitle="Last 7 days (min)" icon={<Clock className="h-4 w-4" />} />
          <ResponsiveContainer width="100%" height={220} className="mt-4">
            <LineChart data={responseTimeData}>
              <XAxis dataKey="day" stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} />
              <Line type="monotone" dataKey="time" stroke="#33c9ff" strokeWidth={2} dot={{ fill: '#33c9ff', r: 3 }} />
              <Line type="monotone" dataKey="target" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <SectionHeader title="Transfer Analytics" subtitle="Status distribution" icon={<ArrowRightLeft className="h-4 w-4" />} />
          <ResponsiveContainer width="100%" height={220} className="mt-4">
            <PieChart>
              <Pie data={transferData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {transferData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-5">
          <SectionHeader title="Department Performance" subtitle="Efficiency scores" icon={<Activity className="h-4 w-4" />} />
          <ResponsiveContainer width="100%" height={220} className="mt-4">
            <RadialBarChart innerRadius="20%" outerRadius="100%" data={deptPerformance} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="score" cornerRadius={4} background={{ fill: 'rgba(36,58,92,0.3)' }}>
                {deptPerformance.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </RadialBar>
              <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-5">
        <SectionHeader title="Bed Occupancy Trends" subtitle="ICU, General & ER over 24h" icon={<BedDouble className="h-4 w-4" />} action={<StatusBadge variant="success" dot pulse size="sm">Live</StatusBadge>} />
        <ResponsiveContainer width="100%" height={280} className="mt-4">
          <AreaChart data={occupancyTrend}>
            <defs>
              <linearGradient id="icuGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="100%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
              <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#33c9ff" stopOpacity={0.3} /><stop offset="100%" stopColor="#33c9ff" stopOpacity={0} /></linearGradient>
              <linearGradient id="erGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} /><stop offset="100%" stopColor="#fbbf24" stopOpacity={0} /></linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#4a5c75" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(10,18,32,0.95)', border: '1px solid rgba(36,58,92,0.6)', borderRadius: 12, fontSize: 12, color: '#e6edf6' }} />
            <Area type="monotone" dataKey="icu" stroke="#f43f5e" strokeWidth={2} fill="url(#icuGrad)" name="ICU %" />
            <Area type="monotone" dataKey="general" stroke="#33c9ff" strokeWidth={2} fill="url(#genGrad)" name="General %" />
            <Area type="monotone" dataKey="er" stroke="#fbbf24" strokeWidth={2} fill="url(#erGrad)" name="ER %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
