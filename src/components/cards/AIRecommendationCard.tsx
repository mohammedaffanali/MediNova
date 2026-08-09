import { motion } from 'framer-motion';
import type { AIRecommendation } from '@/types';
import { cn, timeAgo } from '@/utils';
import { Brain, Sparkles, ArrowRight, TrendingUp, Zap, Stethoscope, Ambulance, Building2, Clock, BarChart3, Activity } from 'lucide-react';

const typeIcons: Record<AIRecommendation['type'], typeof Brain> = {
  hospital: Building2,
  doctor: Stethoscope,
  resource: Activity,
  overload: TrendingUp,
  icu: Activity,
  ambulance: Ambulance,
  report: BarChart3,
  waittime: Clock,
  transfer: ArrowRight,
  optimization: Zap,
};

const impactColors: Record<AIRecommendation['impact'], string> = {
  low: 'text-success-400 bg-success-500/10',
  medium: 'text-brand-300 bg-brand-500/10',
  high: 'text-warning-400 bg-warning-500/10',
  critical: 'text-critical-400 bg-critical-500/10',
};

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onAction?: (rec: AIRecommendation) => void;
  compact?: boolean;
  className?: string;
}

export function AIRecommendationCard({ recommendation, onAction, compact, className }: AIRecommendationCardProps) {
  const Icon = typeIcons[recommendation.type] ?? Brain;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass p-4', className)}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/10 text-brand-300 border border-brand-500/25">
            <Icon className="h-5 w-5" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-brand-300 fill-brand-500/30" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-ink-100 truncate">{recommendation.title}</h4>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0', impactColors[recommendation.impact])}>
              {recommendation.impact}
            </span>
          </div>
          {!compact && (
            <p className="text-xs text-ink-300 mt-1.5 leading-relaxed">{recommendation.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="relative h-1.5 w-16 rounded-full bg-base-700 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-400 to-accent-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${recommendation.confidence}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="text-[10px] font-medium text-ink-300">{recommendation.confidence}%</span>
              </div>
              <span className="text-[10px] text-ink-500">{timeAgo(recommendation.createdAt)}</span>
            </div>
            {recommendation.actionable && onAction && (
              <button
                onClick={() => onAction(recommendation)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-300 hover:text-brand-200 transition-colors group"
              >
                {recommendation.action}
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
