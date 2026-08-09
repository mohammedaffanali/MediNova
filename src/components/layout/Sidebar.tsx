import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import {
  LayoutDashboard, Building2, Stethoscope, Network, Boxes, Ambulance,
  Siren, ArrowRightLeft, BarChart3, FileText, Brain, ScrollText, Settings,
  ChevronLeft, Activity, LogOut,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  badge?: 'emergency';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['system_admin', 'hospital_admin'] },
  { to: '/hospitals', label: 'Hospitals', icon: Building2, roles: ['system_admin'] },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['system_admin', 'hospital_admin'] },
  { to: '/departments', label: 'Departments', icon: Network, roles: ['system_admin', 'hospital_admin'] },
  { to: '/resources', label: 'Resources', icon: Boxes, roles: ['system_admin', 'hospital_admin'] },
  { to: '/ambulances', label: 'Ambulances', icon: Ambulance, roles: ['system_admin', 'ambulance_crew'] },
  { to: '/emergency', label: 'Emergency Command', icon: Siren, roles: ['system_admin'], badge: 'emergency' },
  { to: '/transfers', label: 'Transfers', icon: ArrowRightLeft, roles: ['system_admin', 'hospital_admin'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['system_admin', 'hospital_admin'] },
  { to: '/reports', label: 'Reports', icon: FileText, roles: ['system_admin', 'hospital_admin'] },
  { to: '/ai', label: 'AI Command Center', icon: Brain, roles: ['system_admin', 'hospital_admin'] },
  { to: '/audit', label: 'Audit Logs', icon: ScrollText, roles: ['system_admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['system_admin', 'hospital_admin', 'ambulance_crew'] },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return null;
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className={cn(
      'relative flex flex-col glass-flat border-r border-base-700/60 transition-all duration-300 z-30',
      sidebarCollapsed ? 'w-[72px]' : 'w-64',
    )}>
      <div className="flex items-center justify-between px-4 h-16 border-b border-base-700/40">
        {!sidebarCollapsed && <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Navigation</span>}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg bg-base-800/60 text-ink-400 hover:text-brand-300 hover:bg-brand-500/10 transition-all',
            sidebarCollapsed && 'mx-auto',
          )}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5">
        {items.map((item) => {
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group',
                isActive
                  ? 'text-brand-200 bg-brand-500/10'
                  : 'text-ink-300 hover:text-ink-100 hover:bg-base-700/30',
                sidebarCollapsed && 'justify-center',
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-brand-400 to-accent-400"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-brand-300')} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              {!sidebarCollapsed && item.badge === 'emergency' && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-critical-400 animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-base-700/40 p-3 space-y-2">
        <button
          onClick={() => logout()}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-critical-400 hover:bg-critical-500/10 transition-colors cursor-pointer',
            sidebarCollapsed && 'justify-center',
          )}
          title={sidebarCollapsed ? 'Sign Out Securely' : undefined}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!sidebarCollapsed && <span className="font-sans">Sign Out</span>}
        </button>

        <div className={cn('flex items-center gap-2 rounded-lg bg-base-850/40 px-3 py-2', sidebarCollapsed && 'justify-center')}>
          <Activity className="h-3.5 w-3.5 text-success-400 shrink-0" />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-[10px] text-ink-300 font-medium">System Online</p>
              <p className="text-[9px] text-ink-500">All services operational</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
