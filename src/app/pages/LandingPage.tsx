import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import FuturisticBg from '@/components/layout/FuturisticBg';
import { Shield, Activity, Brain, Server, ChevronRight, Users, Siren, Clock } from 'lucide-react';

const STATS = [
  { label: 'Network Uptime', value: '99.98%', detail: 'Global SLA guarantee', icon: Server, color: 'text-brand-300' },
  { label: 'Connected Nodes', value: '250+', detail: 'Hospitals & hubs', icon: Activity, color: 'text-success-400' },
  { label: 'Telemetry Feeds', value: '14,000+', detail: 'Real-time metrics/sec', icon: Brain, color: 'text-accent-400' },
  { label: 'Avg Dispatch SLA', value: '8.2 min', detail: 'National emergency response', icon: Clock, color: 'text-critical-400' },
];

const FEATURES = [
  {
    title: 'Real-Time Operational Mapping',
    description: 'Continuous tracking of bed capacity, ICU availability, equipment statuses, and ambulance locations across national networks.',
    icon: Siren,
  },
  {
    title: 'AI Predictive Load-Balancing',
    description: 'Forecasts ICU overload, ventilator shortages, and ER wait-times. Recommends proactive patient routing and transfers.',
    icon: Brain,
  },
  {
    title: 'Mobile First Response',
    description: 'Dedicated tablet dashboards for ambulance crews with real-time vitals entry, turn-by-turn navigation, and digital admission request workflows.',
    icon: Users,
  },
  {
    title: 'Enterprise Security & Audit',
    description: 'State-of-the-art role-based access control (RBAC), end-to-end telemetry encryption, and HIPAA/GDPR-ready system audit trails.',
    icon: Shield,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-ink-200 flex flex-col selection:bg-brand-500/30 overflow-x-hidden relative">
      <FuturisticBg />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-base-800/40">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline-flex items-center rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-inset ring-brand-500/20">
            Enterprise Operations v2.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-ink-400 font-mono hidden md:inline">SYSTEM STATUS: ALL OK</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col justify-center items-center gap-16">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                National Healthcare <br />
                <span className="text-gradient">Operations Platform</span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-ink-300 leading-relaxed max-w-2xl"
            >
              Medinova AI 2.0 connects hospitals, emergency dispatch networks, and medical resources into a single, unified operational intelligence center. Powered by real-time predictive models, it streamlines crisis response and balances resource allocation dynamically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => navigate('/roles')}
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 px-6 py-3.5 text-sm font-semibold text-base-950 shadow-glow hover:shadow-lg transition-all cursor-pointer font-sans"
              >
                Enter Platform Command
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Interactive Healthcare Network Visualizer */}
          <div className="lg:col-span-5 flex justify-center items-center relative h-[350px] w-full">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-72 h-72 rounded-full border border-base-800/60 bg-base-900/30 flex items-center justify-center shadow-card"
            >
              {/* Outer rotating ring */}
              <div className="absolute inset-[-20px] rounded-full border border-dashed border-brand-500/20 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-[-40px] rounded-full border border-dashed border-accent-500/10 animate-[spin_60s_linear_infinite_reverse]" />

              {/* Pulsing Core */}
              <div className="w-24 h-24 rounded-full bg-brand-500/5 border border-brand-500/30 flex items-center justify-center relative shadow-glow">
                <Brain className="h-10 w-10 text-brand-300 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-brand-500/30 animate-[ping_3s_ease-in-out_infinite]" />
              </div>

              {/* Surrounding Node 1 */}
              <div className="absolute top-4 left-4 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-base-850/80 border border-success-500/30 flex items-center justify-center text-success-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="w-0.5 h-10 bg-gradient-to-b from-success-500/40 to-transparent" />
              </div>

              {/* Surrounding Node 2 */}
              <div className="absolute bottom-6 left-8 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-base-850/80 border border-brand-500/30 flex items-center justify-center text-brand-300">
                  <Server className="h-4 w-4" />
                </div>
              </div>

              {/* Surrounding Node 3 */}
              <div className="absolute top-12 right-2 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-base-850/80 border border-critical-500/30 flex items-center justify-center text-critical-400">
                  <Siren className="h-4 w-4 animate-bounce" />
                </div>
              </div>

              {/* Surrounding Node 4 */}
              <div className="absolute bottom-4 right-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-base-850/80 border border-accent-500/30 flex items-center justify-center text-accent-300">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Live Network Statistics */}
        <div className="w-full space-y-4">
          <h2 className="text-left text-xs font-bold text-ink-400 uppercase tracking-widest">Network Telemetry</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass p-5 flex flex-col items-start border-l-2 border-brand-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-ink-400 font-medium">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-ink-100 font-sans tracking-tight">{stat.value}</div>
                <div className="text-[10px] text-ink-500 mt-1">{stat.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="w-full space-y-6">
          <div className="text-left">
            <h2 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-1">Platform Core</h2>
            <h3 className="text-2xl font-semibold text-ink-100">Designed for Critical Medical Infrastructure</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 + 0.2 }}
                className="glass p-6 text-left hover:border-brand-500/30 transition-all flex gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/25">
                  <feat.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink-100">{feat.title}</h4>
                  <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-base-800/40 bg-base-950/80 px-6 py-6 text-center text-xs text-ink-500">
        <p>© 2026 Medinova Health Inc. Classified System. Authorized Access Only. HIPAA Compliance Assured.</p>
      </footer>
    </div>
  );
}
