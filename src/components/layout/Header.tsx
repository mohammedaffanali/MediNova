import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatClock } from '@/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore, ROLE_LABELS } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { Logo } from './Logo';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, Siren, Building2, Clock, Moon, Sun, Brain,
  ChevronDown, AlertTriangle, Menu, LogOut, Mail, Settings, Grid,
} from 'lucide-react';

export function Header() {
  const {
    toggleAIPanel, aiPanelOpen, toggleNotificationPanel,
    setCommandPaletteOpen, setSelectedHospitalId, selectedHospitalId,
  setSidebarCollapsed, sidebarCollapsed,
  pushToast,
  } = useUIStore();
  const { user, switchRole, logout } = useAuthStore();
  const { hospitals, alerts } = useDataStore();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const [hospitalMenuOpen, setHospitalMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const hospitalMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (hospitalMenuRef.current && !hospitalMenuRef.current.contains(e.target as Node)) setHospitalMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setProfileMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unackAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalAlerts = unackAlerts.filter((a) => a.severity === 'critical');
  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  return (
    <header className="relative z-30 flex h-16 items-center gap-3 border-b border-base-700/60 bg-base-900/80 backdrop-blur-xl px-4">
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-800/60 text-ink-300 hover:text-brand-300 hover:bg-brand-500/10 transition-all lg:flex"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      <Logo collapsed />

      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="group flex w-full items-center gap-3 rounded-lg bg-base-850/60 border border-base-700/60 px-3.5 py-2 text-sm text-ink-500 hover:border-brand-500/40 hover:bg-base-800/60 transition-all"
        >
          <Search className="h-4 w-4 group-hover:text-brand-300 transition-colors" />
          <span className="flex-1 text-left">Search hospitals, doctors, equipment...</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-base-600/60 px-1.5 py-0.5 text-[10px] text-ink-400 font-mono">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {criticalAlerts.length > 0 && (
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={() => toggleNotificationPanel()}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-critical-500/15 text-critical-400 border border-critical-500/30 hover:bg-critical-500/25 transition-all"
          >
            <Siren className="h-4.5 w-4.5" />
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical-500 text-[9px] font-bold text-base-950 px-1">
              {criticalAlerts.length}
            </span>
          </motion.button>
        )}

        <button
          onClick={() => toggleNotificationPanel()}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-base-800/60 text-ink-300 hover:text-brand-300 hover:bg-brand-500/10 transition-all"
        >
          <Bell className="h-4.5 w-4.5" />
          {unackAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-base-950 px-1">
              {unackAlerts.length}
            </span>
          )}
        </button>

        {user?.role === 'system_admin' && (
          <div className="relative" ref={hospitalMenuRef}>
            <button
              onClick={() => setHospitalMenuOpen(!hospitalMenuOpen)}
              className="flex h-9 items-center gap-2 rounded-lg bg-base-800/60 px-3 text-sm text-ink-200 hover:bg-brand-500/10 hover:text-brand-200 transition-all border border-base-700/50"
            >
              <Building2 className="h-4 w-4 text-brand-300" />
              <span className="hidden lg:inline max-w-[120px] truncate">{selectedHospital?.name || 'All Hospitals'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
            </button>
            <AnimatePresence>
              {hospitalMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-2 w-64 glass p-2 z-50"
                >
                  <button
                    onClick={() => { setSelectedHospitalId(null); setHospitalMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-200 hover:bg-brand-500/10 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-brand-300" />
                    All Hospitals (Network View)
                  </button>
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {hospitals.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => { setSelectedHospitalId(h.id); setHospitalMenuOpen(false); }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                          selectedHospitalId === h.id ? 'bg-brand-500/10 text-brand-200' : 'text-ink-200 hover:bg-base-700/40',
                        )}
                      >
                        <span className={cn('h-2 w-2 rounded-full',
                          h.health === 'optimal' ? 'bg-success-400' : h.health === 'stable' ? 'bg-brand-400' : h.health === 'strained' ? 'bg-warning-400' : 'bg-critical-400',
                        )} />
                        <span className="truncate">{h.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-base-800/60 px-3 py-1.5 border border-base-700/50">
          <Clock className="h-3.5 w-3.5 text-brand-300" />
          <span className="text-xs font-mono text-ink-200 tabular-nums">{formatClock(now)}</span>
        </div>

        {/* AI Quick Status Pill */}
        <button
          onClick={() => toggleAIPanel()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 font-mono text-xs font-bold shadow-glow hover:bg-brand-500/30 transition-all cursor-pointer"
          title="AI Assistant"
        >
          AI
        </button>

        {/* Notifications Icon with Badge 12 */}
        <button
          onClick={() => toggleNotificationPanel()}
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-base-850/80 border border-base-750 text-ink-300 hover:text-ink-100 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical-500 text-[9px] font-extrabold text-white">
            12
          </span>
        </button>

        {/* Mail Icon */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-base-850/80 border border-base-750 text-ink-300 hover:text-ink-100 transition-all cursor-pointer"
          title="Messages"
        >
          <Mail className="h-4 w-4" />
        </button>

        {/* Settings Icon */}
        <button
          onClick={() => navigate('/settings')}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-base-850/80 border border-base-750 text-ink-300 hover:text-ink-100 transition-all cursor-pointer"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 rounded-lg bg-base-800/60 p-1 pr-2 hover:bg-brand-500/10 transition-all border border-base-700/50"
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-base-950"
              style={{ background: `linear-gradient(135deg, ${user?.avatarColor}, ${user?.avatarColor}99)` }}
            >
              {user?.name.split(' ').slice(-1)[0][0]}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-medium text-ink-100 leading-none">{user?.name}</p>
              <p className="text-[10px] text-ink-400 mt-0.5">{user ? ROLE_LABELS[user.role] : ''}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-ink-400 hidden lg:block" />
          </button>
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-2 w-56 glass p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-base-700/40 mb-2">
                  <p className="text-sm font-medium text-ink-100">{user?.name}</p>
                  <p className="text-xs text-ink-400">{user?.email}</p>
                </div>
                <p className="px-3 py-1 text-[10px] font-bold text-ink-500 uppercase tracking-wide">Developer Sandbox</p>
                {(['system_admin', 'hospital_admin', 'ambulance_crew'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => { switchRole(role); setProfileMenuOpen(false); pushToast('Role switched', `Now viewing as ${ROLE_LABELS[role]}`, 'info'); }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs transition-colors',
                      user?.role === role ? 'bg-brand-500/10 text-brand-200' : 'text-ink-300 hover:bg-base-750/40 hover:text-ink-100',
                    )}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
                <div className="border-t border-base-700/40 my-1 pt-1">
                  <button
                    onClick={() => { logout(); setProfileMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-critical-400 hover:bg-critical-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out Securely
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
