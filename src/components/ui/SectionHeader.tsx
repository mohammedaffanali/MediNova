import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, icon, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink-100 truncate">{title}</h2>
          {subtitle && <p className="text-xs text-ink-400 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon, actions, badge, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-4 min-w-0">
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 text-brand-300 border border-brand-500/25">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-ink-100 truncate">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
