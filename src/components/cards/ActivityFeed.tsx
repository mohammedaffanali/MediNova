import { motion, AnimatePresence } from 'framer-motion';
import type { ActivityItem } from '@/types';
import { cn, timeAgo } from '@/utils';
import {
  AlertCircle, ArrowRightLeft, UserPlus, UserMinus, Activity, Stethoscope,
  Brain, Bell, Server, Siren,
} from 'lucide-react';

const typeIcons: Record<ActivityItem['type'], { icon: typeof Activity; color: string; bg: string }> = {
  emergency: { icon: Siren, color: 'text-critical-400', bg: 'bg-critical-500/10' },
  transfer: { icon: ArrowRightLeft, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  admission: { icon: UserPlus, color: 'text-brand-300', bg: 'bg-brand-500/10' },
  discharge: { icon: UserMinus, color: 'text-success-400', bg: 'bg-success-500/10' },
  resource: { icon: Activity, color: 'text-warning-400', bg: 'bg-warning-500/10' },
  staff: { icon: Stethoscope, color: 'text-brand-300', bg: 'bg-brand-500/10' },
  ai: { icon: Brain, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  system: { icon: Server, color: 'text-ink-300', bg: 'bg-base-700/40' },
  alert: { icon: Bell, color: 'text-warning-400', bg: 'bg-warning-500/10' },
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
  maxItems?: number;
}

export function ActivityFeed({ items, className, maxItems = 15 }: ActivityFeedProps) {
  const shown = items.slice(0, maxItems);
  return (
    <div className={cn('space-y-1', className)}>
      <AnimatePresence initial={false}>
        {shown.map((item) => {
          const cfg = typeIcons[item.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-brand-500/5 transition-colors"
            >
              <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', cfg.bg, cfg.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-200 truncate">{item.message}</p>
                {item.detail && <p className="text-[11px] text-ink-400 truncate">{item.detail}</p>}
              </div>
              <span className="text-[10px] text-ink-500 shrink-0 mt-0.5">{timeAgo(item.timestamp)}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

interface TimelineProps {
  items: { id: string; label: string; time: string; status: 'done' | 'active' | 'pending'; detail?: string }[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {items.map((item, i) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-base-700" />
          )}
          <div className={cn(
            'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
            item.status === 'done' && 'bg-brand-500/20 border-brand-400 text-brand-300',
            item.status === 'active' && 'bg-accent-500/20 border-accent-400 text-accent-300 animate-pulse',
            item.status === 'pending' && 'bg-base-800 border-base-600 text-ink-500',
          )}>
            {item.status === 'done' && <AlertCircle className="h-4 w-4" />}
            {item.status === 'active' && <span className="h-2 w-2 rounded-full bg-accent-400" />}
            {item.status === 'pending' && <span className="h-2 w-2 rounded-full bg-ink-500" />}
          </div>
          <div className="pt-1">
            <p className={cn('text-sm font-medium', item.status === 'pending' ? 'text-ink-400' : 'text-ink-100')}>{item.label}</p>
            {item.detail && <p className="text-xs text-ink-400 mt-0.5">{item.detail}</p>}
            <p className="text-[10px] text-ink-500 mt-1">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
