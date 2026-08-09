import { motion, AnimatePresence } from 'framer-motion';
import { cn, timeAgo } from '@/utils';
import { useUIStore } from '@/store/uiStore';
import { useDataStore } from '@/store/dataStore';
import { AlertCard } from '@/components/cards/AlertCard';
import { X, Bell, CheckCheck, Filter } from 'lucide-react';
import { useState } from 'react';

export function NotificationPanel() {
  const { notificationPanelOpen, setNotificationPanelOpen } = useUIStore();
  const { alerts, acknowledgeAlert } = useDataStore();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filtered = alerts.filter((a) => filter === 'all' || a.severity === filter || (filter === 'critical' && a.severity === 'critical'));
  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationPanelOpen(false)}
            className="fixed inset-0 z-40 bg-base-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass-flat border-l border-base-700/60 flex flex-col bg-base-900/95"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-base-700/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/25">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-ink-100">Notifications</h2>
                  <p className="text-[10px] text-ink-400">{unackCount} unread</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:text-ink-200 hover:bg-base-700/40 transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-b border-base-700/40 shrink-0">
              <Filter className="h-3.5 w-3.5 text-ink-400" />
              {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium border transition-all capitalize',
                    filter === f
                      ? 'bg-brand-500/15 text-brand-200 border-brand-500/40'
                      : 'bg-base-850/40 text-ink-400 border-base-700/50 hover:text-ink-200',
                  )}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => alerts.forEach((a) => !a.acknowledged && acknowledgeAlert(a.id))}
                className="ml-auto flex items-center gap-1 text-[11px] font-medium text-brand-300 hover:text-brand-200 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Ack all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell className="h-8 w-8 text-ink-500 mb-2" />
                  <p className="text-sm text-ink-400">No notifications</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
