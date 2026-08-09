import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="mb-4 text-ink-500">{icon}</div>}
      <h3 className="text-base font-semibold text-ink-200">{title}</h3>
      {message && <p className="mt-1.5 text-sm text-ink-400 max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
