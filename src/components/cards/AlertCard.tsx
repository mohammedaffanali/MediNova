import { motion } from 'framer-motion';
import type { AlertItem } from '@/types';
import { cn, timeAgo } from '@/utils';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Bell } from 'lucide-react';

const severityConfig: Record<AlertItem['severity'], { icon: typeof Info; color: string; bg: string; border: string }> = {
  critical: { icon: AlertCircle, color: 'text-critical-400', bg: 'bg-critical-500/10', border: 'border-critical-500/30' },
  warning: { icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30' },
  info: { icon: Info, color: 'text-brand-300', bg: 'bg-brand-500/10', border: 'border-brand-500/30' },
  success: { icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10', border: 'border-success-500/30' },
};

interface AlertCardProps {
  alert: AlertItem;
  onAcknowledge?: (id: string) => void;
  className?: string;
}

export function AlertCard({ alert, onAcknowledge, className }: AlertCardProps) {
  const cfg = severityConfig[alert.severity];
  const Icon = cfg.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        'glass p-4 border-l-2',
        cfg.border,
        alert.acknowledged && 'opacity-60',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cfg.bg, cfg.color)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-ink-100 truncate">{alert.title}</h4>
            {!alert.acknowledged && (
              <span className="flex h-2 w-2 rounded-full bg-critical-400 animate-pulse shrink-0" />
            )}
          </div>
          <p className="text-xs text-ink-300 mt-1">{alert.message}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-[10px] text-ink-500">
              <Bell className="h-3 w-3" />
              <span>{alert.source}</span>
              <span>·</span>
              <span>{timeAgo(alert.createdAt)}</span>
            </div>
            {!alert.acknowledged && onAcknowledge && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="text-[11px] font-medium text-brand-300 hover:text-brand-200 transition-colors"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
