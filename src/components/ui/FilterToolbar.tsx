import type { ReactNode } from 'react';
import { cn } from '@/utils';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  icon?: ReactNode;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className, icon }: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-ink-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg bg-base-850/60 border border-base-700/60 pl-9 pr-9 py-2 text-sm text-ink-100 placeholder:text-ink-500',
          'focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 transition-all',
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 text-ink-400 hover:text-ink-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {icon && <div className="absolute right-3">{icon}</div>}
    </div>
  );
}

interface FilterToolbarProps {
  children: ReactNode;
  className?: string;
}

export function FilterToolbar({ children, className }: FilterToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {children}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}

export function FilterChip({ active, onClick, children, count }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all',
        active
          ? 'bg-brand-500/15 text-brand-200 border-brand-500/40 shadow-glow'
          : 'bg-base-850/40 text-ink-300 border-base-700/50 hover:border-brand-500/30 hover:text-ink-100',
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', active ? 'bg-brand-500/25 text-brand-200' : 'bg-base-700/50 text-ink-400')}>
          {count}
        </span>
      )}
    </button>
  );
}

interface SelectFilterProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  className?: string;
}

export function SelectFilter({ value, onChange, options, label, className }: SelectFilterProps) {
  return (
    <div className={cn('relative', className)}>
      {label && <span className="absolute -top-2 left-2 bg-base-900 px-1 text-[10px] text-ink-400 z-10">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg bg-base-850/60 border border-base-700/60 pl-3 pr-8 py-2 text-sm text-ink-100 cursor-pointer focus:outline-none focus:border-brand-500/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-base-850 text-ink-100">
            {o.label}
          </option>
        ))}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" viewBox="0 0 20 20" fill="none">
        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
