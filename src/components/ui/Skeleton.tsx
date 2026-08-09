import { cn } from '@/utils';

export function SkeletonLoader({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass p-5 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
      <div className="skeleton h-8 w-20" />
      <div className="skeleton h-3 w-full" />
    </div>
  );
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton h-4 flex-1" style={{ maxWidth: `${100 / cols}%` }} />
      ))}
    </div>
  );
}
