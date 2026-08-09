import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { useUIStore } from '@/store/uiStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { AlertSeverity } from '@/types';

const config: Record<AlertSeverity, { icon: typeof Info; color: string; bg: string; border: string }> = {
  success: { icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10', border: 'border-success-500/30' },
  critical: { icon: AlertCircle, color: 'text-critical-400', bg: 'bg-critical-500/10', border: 'border-critical-500/30' },
  warning: { icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30' },
  info: { icon: Info, color: 'text-brand-300', bg: 'bg-brand-500/10', border: 'border-brand-500/30' },
};

function Toast({ id, title, message, severity, duration }: { id: string; title: string; message: string; severity: AlertSeverity; duration: number }) {
  const { dismissToast } = useUIStore();
  const cfg = config[severity];
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(() => dismissToast(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, dismissToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('glass p-4 min-w-[320px] max-w-md border-l-2', cfg.border)}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.bg, cfg.color)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-100">{title}</p>
          <p className="text-xs text-ink-300 mt-0.5">{message}</p>
        </div>
        <button onClick={() => dismissToast(id)} className="text-ink-400 hover:text-ink-200 transition-colors shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useUIStore();
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
