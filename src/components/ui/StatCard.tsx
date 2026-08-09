import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { ProgressRing } from './ProgressRing';
import { StatusBadge } from './StatusBadge';

interface StatCardProps {
  label: string;
  value: string | number;
  total?: string | number;
  unit?: string;
  icon?: ReactNode;
  ringValue?: number;
  ringColor?: string;
  status?: 'optimal' | 'adequate' | 'low' | 'critical' | 'offline';
  className?: string;
}

const statusVariant: Record<NonNullable<StatCardProps['status']>, 'success' | 'warning' | 'danger' | 'critical' | 'neutral'> = {
  optimal: 'success',
  adequate: 'info' as 'success',
  low: 'warning',
  critical: 'critical',
  offline: 'neutral',
};

const statusColor: Record<NonNullable<StatCardProps['status']>, string> = {
  optimal: 'var(--color-success-400)',
  adequate: 'var(--color-brand-400)',
  low: 'var(--color-warning-400)',
  critical: 'var(--color-critical-400)',
  offline: 'var(--color-ink-400)',
};

export function StatCard({ label, value, total, unit, icon, ringValue, ringColor, status, className }: StatCardProps) {
  const rColor = ringColor ?? (status ? statusColor[status] : 'var(--color-brand-400)');
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn('glass p-4 flex items-center gap-4', className)}
    >
      {ringValue !== undefined && (
        <ProgressRing value={ringValue} size={56} strokeWidth={5} color={rColor} label={`${Math.round(ringValue)}%`} />
      )}
      {icon && !ringValue && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-400 uppercase tracking-wide font-medium truncate">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-xl font-bold text-ink-100 tabular-nums">{value}</span>
          {total !== undefined && <span className="text-sm text-ink-500">/ {total}</span>}
          {unit && <span className="text-xs text-ink-400">{unit}</span>}
        </div>
        {status && (
          <div className="mt-1.5">
            <StatusBadge variant={statusVariant[status]} dot size="sm">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </StatusBadge>
          </div>
        )}
      </div>
    </motion.div>
  );
}
