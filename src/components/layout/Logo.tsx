import { cn } from '@/utils';
import { Shield } from 'lucide-react';

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 border border-brand-500/30 shadow-glow">
        <Shield className="h-5 w-5 text-brand-300" />
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success-400 border-2 border-base-950" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <h1 className="text-base font-bold text-ink-100 leading-none tracking-tight">
            Medinova<span className="text-gradient"> AI</span>
          </h1>
          <p className="text-[10px] text-ink-400 mt-0.5 tracking-wide uppercase">Healthcare Operations</p>
        </div>
      )}
    </div>
  );
}
