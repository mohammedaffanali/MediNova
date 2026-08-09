import { motion } from 'framer-motion';
import type { Hospital } from '@/types';
import { cn, occupancy, formatNumber, timeAgo } from '@/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Building2, MapPin, BedDouble, Stethoscope, Activity, Clock } from 'lucide-react';

const healthVariant: Record<Hospital['health'], 'success' | 'warning' | 'danger' | 'critical'> = {
  optimal: 'success',
  stable: 'success',
  strained: 'warning',
  critical: 'critical',
};

const healthColor: Record<Hospital['health'], string> = {
  optimal: 'var(--color-success-400)',
  stable: 'var(--color-brand-400)',
  strained: 'var(--color-warning-400)',
  critical: 'var(--color-critical-400)',
};

interface HospitalCardProps {
  hospital: Hospital;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function HospitalCard({ hospital, onClick, compact, className }: HospitalCardProps) {
  const bedOcc = occupancy(hospital.availableBeds, hospital.totalBeds);
  const icuOcc = occupancy(hospital.icuAvailable, hospital.icuBeds);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={cn('glass glass-hover-lift p-5', onClick && 'cursor-pointer', className)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/10 text-brand-300 border border-brand-500/25">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink-100 truncate">{hospital.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-ink-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {hospital.city}
              </span>
              <span className="text-[10px] text-ink-500">·</span>
              <span className="text-[10px] text-brand-300 font-medium">{hospital.tier}</span>
            </div>
          </div>
        </div>
        <StatusBadge variant={healthVariant[hospital.health]} dot pulse={hospital.health === 'critical'}>
          {hospital.health}
        </StatusBadge>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <ProgressRing
          value={hospital.healthScore}
          size={64}
          strokeWidth={5}
          color={healthColor[hospital.health]}
          label={`${hospital.healthScore}`}
          sublabel="score"
        />
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-base-850/50 px-3 py-2">
            <p className="text-[10px] text-ink-400 uppercase">Beds</p>
            <p className="text-sm font-bold text-ink-100 tabular-nums">{hospital.availableBeds}<span className="text-ink-500 text-xs">/{hospital.totalBeds}</span></p>
          </div>
          <div className="rounded-lg bg-base-850/50 px-3 py-2">
            <p className="text-[10px] text-ink-400 uppercase">ICU</p>
            <p className="text-sm font-bold text-ink-100 tabular-nums">{hospital.icuAvailable}<span className="text-ink-500 text-xs">/{hospital.icuBeds}</span></p>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-base-850/40 px-2 py-2">
            <Stethoscope className="h-3.5 w-3.5 text-brand-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-ink-100">{hospital.doctors}</p>
            <p className="text-[9px] text-ink-500">Doctors</p>
          </div>
          <div className="rounded-lg bg-base-850/40 px-2 py-2">
            <BedDouble className="h-3.5 w-3.5 text-accent-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-ink-100">{hospital.emergencyAvailable}</p>
            <p className="text-[9px] text-ink-500">ER Beds</p>
          </div>
          <div className="rounded-lg bg-base-850/40 px-2 py-2">
            <Activity className="h-3.5 w-3.5 text-warning-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-ink-100">{hospital.emergencyQueue}</p>
            <p className="text-[9px] text-ink-500">Queue</p>
          </div>
          <div className="rounded-lg bg-base-850/40 px-2 py-2">
            <Clock className="h-3.5 w-3.5 text-success-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-ink-100">{hospital.responseTime}m</p>
            <p className="text-[9px] text-ink-500">Response</p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[10px] text-ink-500">
        <span>Bed occ: {bedOcc.toFixed(0)}% · ICU: {icuOcc.toFixed(0)}%</span>
        <span>Updated {timeAgo(hospital.lastUpdated)}</span>
      </div>
    </motion.div>
  );
}
