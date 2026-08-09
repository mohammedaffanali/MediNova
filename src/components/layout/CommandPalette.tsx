import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { useUIStore } from '@/store/uiStore';
import { useDataStore } from '@/store/dataStore';
import {
  Search, Building2, Stethoscope, Boxes, Ambulance, Siren,
  ArrowRightLeft, BarChart3, Brain, Settings, FileText, ScrollText,
  LayoutDashboard, Network, CornerDownLeft, ArrowUp, ArrowDown, Hash, HelpCircle
} from 'lucide-react';

interface SearchItem {
  id: string;
  label: string;
  subtitle: string;
  icon: typeof Search;
  category: string;
  to: string;
  // Advanced flags for tag filtering
  icuAvailable?: boolean;
  mriAvailable?: boolean;
  ctAvailable?: boolean;
  waitTime?: number;
  specialization?: string;
  ambulanceAvailable?: boolean;
}

const QUICK_FILTERS = [
  { tag: '#icu', label: 'ICU Beds Available', desc: 'Hospitals with active ICU capacity' },
  { tag: '#cardiologist', label: 'Cardiologists', desc: 'Cardiology specialists directory' },
  { tag: '#mri', label: 'MRI Scanner Online', desc: 'Facilities with MRI diagnostic machines online' },
  { tag: '#ct', label: 'CT Scanner Online', desc: 'Facilities with CT diagnostic machines online' },
  { tag: '#wait', label: 'Wait Time < 30m', desc: 'Fastest triage response rates' },
  { tag: '#ambulance', label: 'Ambulances Available', desc: 'Available emergency response vehicles' },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { hospitals, doctors, ambulances, emergencies, transfers } = useDataStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<SearchItem[]>(() => {
    const navItems: SearchItem[] = [
      { id: 'nav-dashboard', label: 'Dashboard', subtitle: 'System overview', icon: LayoutDashboard, category: 'Navigation', to: '/' },
      { id: 'nav-hospitals', label: 'Hospitals', subtitle: 'Hospital network', icon: Building2, category: 'Navigation', to: '/hospitals' },
      { id: 'nav-doctors', label: 'Doctors', subtitle: 'Doctor directory', icon: Stethoscope, category: 'Navigation', to: '/doctors' },
      { id: 'nav-departments', label: 'Departments', subtitle: 'Department status', icon: Network, category: 'Navigation', to: '/departments' },
      { id: 'nav-resources', label: 'Resources', subtitle: 'Resource management', icon: Boxes, category: 'Navigation', to: '/resources' },
      { id: 'nav-ambulances', label: 'Ambulances', subtitle: 'Fleet management', icon: Ambulance, category: 'Navigation', to: '/ambulances' },
      { id: 'nav-emergency', label: 'Emergency Command', subtitle: 'Command center', icon: Siren, category: 'Navigation', to: '/emergency' },
      { id: 'nav-transfers', label: 'Transfers', subtitle: 'Transfer center', icon: ArrowRightLeft, category: 'Navigation', to: '/transfers' },
      { id: 'nav-analytics', label: 'Analytics', subtitle: 'Performance analytics', icon: BarChart3, category: 'Navigation', to: '/analytics' },
      { id: 'nav-reports', label: 'Reports', subtitle: 'Generate reports', icon: FileText, category: 'Navigation', to: '/reports' },
      { id: 'nav-ai', label: 'AI Command Center', subtitle: 'AI insights', icon: Brain, category: 'Navigation', to: '/ai' },
      { id: 'nav-audit', label: 'Audit Logs', subtitle: 'Activity logs', icon: ScrollText, category: 'Navigation', to: '/audit' },
      { id: 'nav-settings', label: 'Settings', subtitle: 'System settings', icon: Settings, category: 'Navigation', to: '/settings' },
    ];
    
    const hospitalItems: SearchItem[] = hospitals.map((h) => ({
      id: `hosp-${h.id}`,
      label: h.name,
      subtitle: `${h.city} · ${h.tier} · Wait: ${h.avgWaitTime}m`,
      icon: Building2,
      category: 'Hospitals',
      to: '/hospitals',
      icuAvailable: h.icuAvailable > 0,
      mriAvailable: h.mriAvailable,
      ctAvailable: h.ctAvailable,
      waitTime: h.avgWaitTime,
    }));
    
    const doctorItems: SearchItem[] = doctors.map((d) => ({
      id: `doc-${d.id}`,
      label: d.name,
      subtitle: `${d.department} · ${d.specialization} · Rating: ${d.rating.toFixed(1)}`,
      icon: Stethoscope,
      category: 'Doctors',
      to: '/doctors',
      specialization: d.specialization,
    }));
    
    const ambItems: SearchItem[] = ambulances.map((a) => ({
      id: `amb-${a.id}`,
      label: `Ambulance ${a.code}`,
      subtitle: `${a.type} Unit · ${a.status} · Fuel: ${Math.round(a.fuel)}%`,
      icon: Ambulance,
      category: 'Ambulances',
      to: '/ambulances',
      ambulanceAvailable: a.status === 'available',
    }));
    
    const emgItems: SearchItem[] = emergencies.slice(0, 10).map((e) => ({
      id: `emg-${e.id}`,
      label: `${e.code} — ${e.complaint.slice(0, 30)}`,
      subtitle: `${e.priority} · ${e.status}`,
      icon: Siren,
      category: 'Emergencies',
      to: '/emergency',
    }));
    
    const trfItems: SearchItem[] = transfers.slice(0, 10).map((t) => ({
      id: `trf-${t.id}`,
      label: `${t.code} — ${t.patientName}`,
      subtitle: `${t.reason.slice(0, 30)}`,
      icon: ArrowRightLeft,
      category: 'Transfers',
      to: '/transfers',
    }));
    
    return [...navItems, ...hospitalItems, ...doctorItems, ...ambItems, ...emgItems, ...trfItems];
  }, [hospitals, doctors, ambulances, emergencies, transfers]);

  // Advanced tags and string querying filter logic
  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return items.slice(0, 20);

    // Filter by tag matching
    if (trimmed.startsWith('#')) {
      const tag = trimmed;
      if (tag === '#icu') {
        return items.filter((i) => i.icuAvailable === true);
      }
      if (tag === '#mri') {
        return items.filter((i) => i.mriAvailable === true);
      }
      if (tag === '#ct') {
        return items.filter((i) => i.ctAvailable === true);
      }
      if (tag === '#wait') {
        return items.filter((i) => i.waitTime !== undefined && i.waitTime < 30);
      }
      if (tag === '#cardiologist') {
        return items.filter((i) => i.specialization?.toLowerCase().includes('cardio'));
      }
      if (tag === '#ambulance') {
        return items.filter((i) => i.ambulanceAvailable === true);
      }
    }

    // Normal textual query filter
    return items.filter(
      (i) => i.label.toLowerCase().includes(trimmed) ||
             i.subtitle.toLowerCase().includes(trimmed) ||
             i.category.toLowerCase().includes(trimmed)
    ).slice(0, 20);
  }, [items, query]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].to);
      setCommandPaletteOpen(false);
    }
  };

  const handleQuickFilterClick = (tag: string) => {
    setQuery(tag);
    inputRef.current?.focus();
  };

  const grouped = filtered.reduce<Record<string, SearchItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="absolute inset-0 bg-base-950/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl glass overflow-hidden shadow-float"
          >
            {/* Input Header bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-base-700/40">
              <Search className="h-5 w-5 text-brand-300 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search hospitals, specialists, resources, ambulances..."
                className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
              />
              <kbd className="rounded border border-base-600/60 px-1.5 py-0.5 text-[10px] text-ink-400 font-mono">ESC</kbd>
            </div>

            {/* Quick tag filters chips row */}
            <div className="px-4 py-2 bg-base-900/30 border-b border-base-700/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[9px] font-bold text-ink-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Hash className="h-3 w-3" /> Quick Tags:
              </span>
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.tag}
                  onClick={() => handleQuickFilterClick(f.tag)}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-all shrink-0 cursor-pointer',
                    query === f.tag
                      ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                      : 'bg-base-850 hover:bg-base-800 border-base-750 text-ink-400 hover:text-ink-200'
                  )}
                  title={f.desc}
                >
                  {f.tag}
                </button>
              ))}
            </div>

            {/* Results Pane */}
            <div className="max-h-[45vh] overflow-y-auto p-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-ink-400 flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="h-8 w-8 text-ink-500" />
                  <span>No results match "{query}"</span>
                  <button onClick={() => setQuery('')} className="text-xs text-brand-400 underline font-semibold mt-1">Clear Query</button>
                </div>
              ) : (
                Object.entries(grouped).map(([category, catItems]) => (
                  <div key={category}>
                    <p className="px-3 py-1.5 text-[10px] font-bold text-ink-500 uppercase tracking-wide">{category}</p>
                    {catItems.map((item) => {
                      const idx = filtered.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { navigate(item.to); setCommandPaletteOpen(false); }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            idx === selectedIndex ? 'bg-brand-500/15' : 'hover:bg-base-700/30',
                          )}
                        >
                          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', idx === selectedIndex ? 'bg-brand-500/20 text-brand-300' : 'bg-base-800/60 text-ink-400')}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-ink-100 truncate">{item.label}</p>
                            <p className="text-[10px] text-ink-400 truncate">{item.subtitle}</p>
                          </div>
                          {idx === selectedIndex && <CornerDownLeft className="h-3.5 w-3.5 text-ink-400 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-base-700/40 text-[9px] text-ink-500">
              <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> Navigate</span>
              <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> Select</span>
              <span className="ml-auto">Real-time database indexes synced</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
