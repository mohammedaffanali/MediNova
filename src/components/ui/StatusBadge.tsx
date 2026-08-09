import { cn } from '@/utils';
import type { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'critical' | 'info' | 'neutral' | 'brand' | 'accent';

const styles: Record<Variant, string> = {
  success: 'bg-success-500/15 text-success-400 border-success-500/30',
  warning: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
  danger: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
  critical: 'bg-critical-500/15 text-critical-400 border-critical-500/30',
  info: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  neutral: 'bg-base-700/40 text-ink-300 border-base-600/50',
  brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
  accent: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
};

const dotColors: Record<Variant, string> = {
  success: 'bg-success-400',
  warning: 'bg-warning-400',
  danger: 'bg-danger-400',
  critical: 'bg-critical-400',
  info: 'bg-brand-400',
  neutral: 'bg-ink-400',
  brand: 'bg-brand-400',
  accent: 'bg-accent-400',
};

interface StatusBadgeProps {
  variant?: Variant;
  children: ReactNode;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ variant = 'neutral', children, dot = false, pulse = false, className, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap',
        styles[variant],
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      {dot && (
        <span className="relative flex">
          <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotColors[variant])} />
          {pulse && (
            <span className={cn('absolute inset-0 rounded-full animate-ping', dotColors[variant], 'opacity-60')} />
          )}
        </span>
      )}
      {children}
    </span>
  );
}
