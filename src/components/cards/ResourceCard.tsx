import { motion } from 'framer-motion';
import type { Resource } from '@/types';
import { cn, occupancy, timeAgo } from '@/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MiniChart } from '@/components/ui/MiniChart';
import { Activity, TrendingUp } from 'lucide-react';

const statusVariant: Record<Resource['status'], 'success' | 'warning' | 'danger' | 'critical' | 'neutral'> = {
  optimal: 'success',
  adequate: 'info' as 'success',
  low: 'warning',
  critical: 'critical',
  offline: 'neutral',
};

const chartColor: Record<Resource['status'], string> = {
  optimal: 'var(--color-success-400)',
  adequate: 'var(--color-brand-400)',
  low: 'var(--color-warning-400)',
  critical: 'var(--color-critical-400)',
  offline: 'var(--color-ink-400)',
};

const categoryIcons: Record<Resource['category'], string> = {
  bed: '🛏️',
  icu: '🏥',
  emergency: '🚑',
  ventilator: '💨',
  imaging: '📷',
  blood: '🩸',
  supply: '📦',
  facility: '⚙️',
};

interface ResourceCardProps {
  resource: Resource;
  onClick?: () => void;
  className?: string;
}

export function ResourceCard({ resource, onClick, className }: ResourceCardProps) {
  const occ = occupancy(resource.available, resource.total);
  const color = chartColor[resource.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={cn('glass glass-hover-lift p-4', onClick && 'cursor-pointer', className)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-850/60 text-base border border-base-700/50">
            <span className="text-sm">{categoryIcons[resource.category]}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink-100 truncate">{resource.name}</h3>
            <p className="text-[10px] text-ink-500 uppercase tracking-wide">{resource.category}</p>
          </div>
        </div>
        <StatusBadge variant={statusVariant[resource.status]} dot size="sm">
          {resource.status}
        </StatusBadge>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-ink-100 tabular-nums">{resource.available}</span>
            <span className="text-sm text-ink-500">/ {resource.total} {resource.unit}</span>
          </div>
          <p className="text-[11px] text-ink-400 mt-0.5">{occ.toFixed(0)}% occupied</p>
        </div>
        <MiniChart data={resource.trend} width={80} height={28} color={color} />
      </div>

      <div className="w-full h-1.5 rounded-full bg-base-800 overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${occ}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1 text-ink-400">
          <Activity className="h-3 w-3 text-brand-300" />
          {resource.prediction}
        </span>
        <span className="text-ink-500">{timeAgo(resource.lastUpdated)}</span>
      </div>
    </motion.div>
  );
}
