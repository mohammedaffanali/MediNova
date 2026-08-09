import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

type TrendDirection = 'up' | 'down' | 'neutral';
type AccentColor = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'critical';

const accentMap: Record<AccentColor, { text: string; bg: string; ring: string; chart: string }> = {
  brand: { text: 'text-brand-300', bg: 'bg-brand-500/10', ring: 'ring-brand-500/20', chart: 'var(--color-brand-400)' },
  accent: { text: 'text-accent-400', bg: 'bg-accent-500/10', ring: 'ring-accent-500/20', chart: 'var(--color-accent-400)' },
  success: { text: 'text-success-400', bg: 'bg-success-500/10', ring: 'ring-success-500/20', chart: 'var(--color-success-400)' },
  warning: { text: 'text-warning-400', bg: 'bg-warning-500/10', ring: 'ring-warning-500/20', chart: 'var(--color-warning-400)' },
  danger: { text: 'text-danger-400', bg: 'bg-danger-500/10', ring: 'ring-danger-500/20', chart: 'var(--color-danger-400)' },
  critical: { text: 'text-critical-400', bg: 'bg-critical-500/10', ring: 'ring-critical-500/20', chart: 'var(--color-critical-400)' },
};

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  accent?: AccentColor;
  trend?: { direction: TrendDirection; value: string };
  sparkline?: number[];
  live?: boolean;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  label,
  value,
  unit,
  icon,
  accent = 'brand',
  trend,
  sparkline,
  live = false,
  className,
  onClick,
}: MetricCardProps) {
  const a = accentMap[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={cn('glass glass-hover-lift p-5 group relative', onClick && 'cursor-pointer', className)}
    >
      {/* Soft backlighting glow */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-500/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full" />
      
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg relative z-10', a.bg, a.text, 'ring-1', a.ring)}>
          {icon}
        </div>
        {live && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-success-400">
            <span className="live-dot bg-success-400 text-success-400" />
            LIVE
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-ink-100 tabular-nums">{value}</span>
          {unit && <span className="text-sm text-ink-400">{unit}</span>}
        </div>
      </div>
      {(trend || sparkline) && (
        <div className="mt-3 flex items-center justify-between">
          {trend && (
            <span className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              trend.direction === 'up' ? 'text-success-400' : trend.direction === 'down' ? 'text-danger-400' : 'text-ink-400',
            )}>
              {trend.direction === 'up' ? <ArrowUp className="h-3 w-3" /> : trend.direction === 'down' ? <ArrowDown className="h-3 w-3" /> : null}
              {trend.value}
            </span>
          )}
          {sparkline && sparkline.length > 1 && (
            <svg width={80} height={28} className="overflow-visible ml-auto">
              <defs>
                <linearGradient id={`mc-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={a.chart} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={a.chart} stopOpacity={0} />
                </linearGradient>
              </defs>
              {(() => {
                const max = Math.max(...sparkline);
                const min = Math.min(...sparkline);
                const range = max - min || 1;
                const pts = sparkline.map((v, i) => {
                  const x = (i / (sparkline.length - 1)) * 80;
                  const y = 28 - ((v - min) / range) * 24 - 2;
                  return `${x},${y}`;
                });
                return (
                  <>
                    <polyline points={pts.join(' ')} fill="none" stroke={a.chart} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <polygon points={`${pts.join(' ')} 80,28 0,28`} fill={`url(#mc-${label.replace(/\s/g, '')})`} />
                  </>
                );
              })()}
            </svg>
          )}
        </div>
      )}
    </motion.div>
  );
}
