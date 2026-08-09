import { useState } from 'react';
import { PageHeader } from '@/components/ui/SectionHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/utils';
import { Settings, User, Bell, Shield, Palette, Database, Brain, Wifi, Save } from 'lucide-react';

type SettingSection = 'profile' | 'notifications' | 'security' | 'appearance' | 'ai' | 'system';

const sections: { id: SettingSection; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'ai', label: 'AI Settings', icon: Brain },
  { id: 'system', label: 'System', icon: Database },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { pushToast } = useUIStore();
  const [active, setActive] = useState<SettingSection>('profile');
  const [notifications, setNotifications] = useState({ critical: true, warnings: true, transfers: true, ai: true, reports: false });
  const [aiAutoAction, setAiAutoAction] = useState(false);
  const [aiPredictions, setAiPredictions] = useState(true);
  const [gmapsKey, setGmapsKey] = useState(() => localStorage.getItem('medinova_gmaps_key') || '');

  const handleSave = () => {
    localStorage.setItem('medinova_gmaps_key', gmapsKey);
    pushToast('Settings saved', 'Your preferences have been updated.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and system preferences"
        icon={<Settings className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="glass p-3 lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active === s.id ? 'bg-brand-500/15 text-brand-200 border border-brand-500/25' : 'text-ink-300 hover:bg-base-700/30 border border-transparent',
                )}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="glass p-6 lg:col-span-3">
          {active === 'profile' && (
            <div className="space-y-5">
              <SectionHeader title="Profile" subtitle="Your account information" icon={<User className="h-4 w-4" />} />
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold" style={{ background: `${user?.avatarColor}20`, color: user?.avatarColor }}>
                  {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-ink-100">{user?.name}</p>
                  <p className="text-sm text-ink-400">{user?.email}</p>
                  <StatusBadge variant="brand" size="sm" className="mt-1">{user?.role.replace('_', ' ')}</StatusBadge>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-ink-400 uppercase mb-1.5 block">Full Name</label>
                  <input defaultValue={user?.name} className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-brand-500/40" />
                </div>
                <div>
                  <label className="text-xs text-ink-400 uppercase mb-1.5 block">Email</label>
                  <input defaultValue={user?.email} className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-brand-500/40" />
                </div>
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-5">
              <SectionHeader title="Notifications" subtitle="Choose what alerts you receive" icon={<Bell className="h-4 w-4" />} />
              <div className="space-y-3">
                {(Object.keys(notifications) as (keyof typeof notifications)[]).map((key) => (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-base-850/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-100 capitalize">{key} Alerts</p>
                      <p className="text-xs text-ink-400">Receive notifications for {key} events</p>
                    </div>
                    <button
                      onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                      className={cn('relative h-6 w-11 rounded-full transition-colors', notifications[key] ? 'bg-brand-500/40' : 'bg-base-700/60')}
                    >
                      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-ink-100 transition-transform', notifications[key] ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-5">
              <SectionHeader title="Security" subtitle="Authentication and access control" icon={<Shield className="h-4 w-4" />} />
              <div className="rounded-lg bg-success-500/10 border border-success-500/20 px-4 py-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-success-400" />
                <span className="text-sm text-ink-200">Your account is protected with role-based access control.</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-ink-400 uppercase mb-1.5 block">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-brand-500/40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-ink-400 uppercase mb-1.5 block">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-brand-500/40" />
                  </div>
                  <div>
                    <label className="text-xs text-ink-400 uppercase mb-1.5 block">Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-brand-500/40" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 'appearance' && (
            <div className="space-y-5">
              <SectionHeader title="Appearance" subtitle="Customize the interface" icon={<Palette className="h-4 w-4" />} />
              <div>
                <label className="text-xs text-ink-400 uppercase mb-2 block">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Dark Enterprise', 'Midnight Blue'].map((theme, i) => (
                    <div key={theme} className={cn('rounded-lg border p-4 cursor-pointer transition-all', i === 0 ? 'border-brand-500/40 bg-brand-500/10' : 'border-base-700/50 bg-base-850/40 hover:border-base-600')}>
                      <div className="h-16 rounded-md mb-2" style={{ background: i === 0 ? 'linear-gradient(135deg, #0a1220, #142140)' : 'linear-gradient(135deg, #0a0a1a, #1a1a3a)' }} />
                      <p className="text-sm font-medium text-ink-100">{theme}</p>
                      {i === 0 && <StatusBadge variant="brand" size="sm" className="mt-1">Active</StatusBadge>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === 'ai' && (
            <div className="space-y-5">
              <SectionHeader title="AI Settings" subtitle="Configure AI assistant behavior" icon={<Brain className="h-4 w-4" />} />
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-base-850/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-100">Auto-Action Recommendations</p>
                    <p className="text-xs text-ink-400">Allow AI to automatically execute low-risk recommendations</p>
                  </div>
                  <button onClick={() => setAiAutoAction(v => !v)} className={cn('relative h-6 w-11 rounded-full transition-colors', aiAutoAction ? 'bg-brand-500/40' : 'bg-base-700/60')}>
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-ink-100 transition-transform', aiAutoAction ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-base-850/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-100">Predictive Forecasts</p>
                    <p className="text-xs text-ink-400">Generate ICU, ambulance, and resource forecasts</p>
                  </div>
                  <button onClick={() => setAiPredictions(v => !v)} className={cn('relative h-6 w-11 rounded-full transition-colors', aiPredictions ? 'bg-brand-500/40' : 'bg-base-700/60')}>
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-ink-100 transition-transform', aiPredictions ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === 'system' && (
            <div className="space-y-5">
              <SectionHeader title="System" subtitle="System status and configuration" icon={<Database className="h-4 w-4" />} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-base-850/40 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1"><Wifi className="h-4 w-4 text-success-400" /><span className="text-sm font-medium text-ink-100">Realtime Connection</span></div>
                  <StatusBadge variant="success" dot pulse size="sm">Connected</StatusBadge>
                </div>
                <div className="rounded-lg bg-base-850/40 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1"><Database className="h-4 w-4 text-success-400" /><span className="text-sm font-medium text-ink-100">Database</span></div>
                  <StatusBadge variant="success" dot size="sm">Operational</StatusBadge>
                </div>
                <div className="rounded-lg bg-base-850/40 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1"><Brain className="h-4 w-4 text-brand-300" /><span className="text-sm font-medium text-ink-100">AI Engine</span></div>
                  <StatusBadge variant="brand" dot pulse size="sm">Active</StatusBadge>
                </div>
                <div className="rounded-lg bg-base-850/40 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-success-400" /><span className="text-sm font-medium text-ink-100">Security</span></div>
                  <StatusBadge variant="success" dot size="sm">HIPAA-Ready</StatusBadge>
                </div>
              </div>

              {/* GIS API Configuration */}
              <div className="border-t border-base-700/40 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-ink-100 uppercase tracking-widest">GIS Integration Engine</h4>
                <div>
                  <label className="text-[10px] text-ink-400 uppercase mb-1.5 block">Google Maps Javascript API Key</label>
                  <input
                    type="text"
                    value={gmapsKey}
                    onChange={(e) => setGmapsKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-brand-500/40"
                  />
                  <p className="text-[10px] text-ink-500 mt-1 leading-normal">
                    Enter your Google Cloud Console API Key to enable directions, traffic congestion overlays, and Google Place autocompletes.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-brand-500/20 text-brand-200 border border-brand-500/30 px-4 py-2 text-sm font-medium hover:bg-brand-500/30 transition-all">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
