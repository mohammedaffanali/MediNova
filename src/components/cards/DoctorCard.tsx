import { motion } from 'framer-motion';
import type { Doctor } from '@/types';
import { cn } from '@/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Star, Clock, Phone, MapPin, Users, Brain, RefreshCw, Building } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';

const statusConfig: Record<Doctor['status'], { variant: 'success' | 'warning' | 'info' | 'accent' | 'neutral' | 'danger'; label: string; color: string }> = {
  available: { variant: 'success', label: 'Available', color: 'var(--color-success-400)' },
  busy: { variant: 'warning', label: 'Busy (OPD)', color: 'var(--color-warning-400)' },
  emergency: { variant: 'danger', label: 'Emergency', color: 'var(--color-critical-400)' },
  on_call: { variant: 'accent', label: 'On Call', color: 'var(--color-accent-400)' },
  off_duty: { variant: 'neutral', label: 'Off Duty', color: 'var(--color-ink-400)' },
  in_surgery: { variant: 'danger', label: 'In Surgery', color: 'var(--color-danger-400)' },
};

interface DoctorCardProps {
  doctor: Doctor;
  hospitalName?: string;
  onClick?: () => void;
  className?: string;
}

export function DoctorCard({ doctor, hospitalName, onClick, className }: DoctorCardProps) {
  const { doctors, hospitals } = useDataStore();
  const cfg = statusConfig[doctor.status];

  const isUnavailable = doctor.status !== 'available';

  // AI Fallback Recommendation Logic
  const fallbackRec = (() => {
    if (!isUnavailable) return null;

    // 1. Same facility, same specialty, available
    const sameHospAlt = doctors.find(
      (d) => d.id !== doctor.id &&
             d.hospitalId === doctor.hospitalId &&
             d.specialization === doctor.specialization &&
             d.status === 'available'
    );
    if (sameHospAlt) {
      return {
        type: 'doctor' as const,
        name: sameHospAlt.name,
        message: 'Direct local referral available',
      };
    }

    // 2. Nearby facility, same specialty, available
    const nearbyAlt = doctors.find(
      (d) => d.hospitalId !== doctor.hospitalId &&
             d.specialization === doctor.specialization &&
             d.status === 'available'
    );
    if (nearbyAlt) {
      const targetHosp = hospitals.find((h) => h.id === nearbyAlt.hospitalId);
      return {
        type: 'hospital' as const,
        name: targetHosp ? targetHosp.name : 'Partner Hospital',
        message: `Redirect Patient (Specialist: ${nearbyAlt.name})`,
      };
    }

    return null;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={cn('glass glass-hover-lift p-4 flex flex-col justify-between h-full', onClick && 'cursor-pointer', className)}
    >
      <div>
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-base-950"
              style={{ background: `linear-gradient(135deg, ${doctor.photoColor}, ${doctor.photoColor}99)` }}
            >
              {doctor.name.split(' ').slice(-1)[0][0]}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-base-850"
              style={{ background: cfg.color }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-ink-100 truncate">{doctor.name}</h3>
              <StatusBadge variant={cfg.variant} dot size="sm" pulse={doctor.status === 'emergency' || doctor.status === 'in_surgery'}>
                {cfg.label}
              </StatusBadge>
            </div>
            <p className="text-[10px] text-ink-400 mt-0.5">{doctor.department}</p>
            <p className="text-[10px] text-brand-300 font-semibold mt-0.5">{doctor.specialization}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-lg bg-base-850/40 px-2 py-1">
            <p className="text-sm font-bold text-ink-100 tabular-nums">{doctor.queue}</p>
            <p className="text-[8px] text-ink-500 uppercase tracking-wider">Queue</p>
          </div>
          <div className="rounded-lg bg-base-850/40 px-2 py-1">
            <p className="text-sm font-bold text-ink-100 tabular-nums">{doctor.patientsToday}</p>
            <p className="text-[8px] text-ink-500 uppercase tracking-wider">Today</p>
          </div>
          <div className="rounded-lg bg-base-850/40 px-2 py-1">
            <p className="text-sm font-bold text-ink-100 flex items-center justify-center gap-0.5">
              <Star className="h-3 w-3 text-warning-400 fill-warning-400" />
              {doctor.rating.toFixed(1)}
            </p>
            <p className="text-[8px] text-ink-500 uppercase tracking-wider">Rating</p>
          </div>
        </div>

        {/* Operational Telemetry Details */}
        <div className="mt-3.5 space-y-1.5 text-[10px] text-ink-400 border-t border-base-800/40 pt-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-ink-500 shrink-0" />
            <span className="truncate">{doctor.currentLocation}{hospitalName ? ` · ${hospitalName}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-ink-500 shrink-0" />
            <span>Shift: {doctor.shiftStart} – {doctor.shiftEnd}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-ink-500 shrink-0" />
            <span>Contact: {doctor.emergencyContact}</span>
          </div>
        </div>
      </div>

      {/* AI Fallback Recommendations Section */}
      {fallbackRec && (
        <div className="mt-4 pt-3.5 border-t border-base-800/60 space-y-1.5 bg-brand-500/5 -mx-4 -mb-4 p-3 rounded-b-xl">
          <p className="text-[9px] font-bold text-brand-300 uppercase tracking-widest flex items-center gap-1">
            <Brain className="h-3.5 w-3.5 animate-pulse" /> AI Fallback Recommendation
          </p>
          <div className="flex items-start gap-2 text-[10px]">
            {fallbackRec.type === 'doctor' ? (
              <RefreshCw className="h-3.5 w-3.5 text-success-400 mt-0.5 shrink-0" />
            ) : (
              <Building className="h-3.5 w-3.5 text-warning-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-ink-100 leading-tight">{fallbackRec.name}</p>
              <p className="text-ink-400 text-[9px] mt-0.5">{fallbackRec.message}</p>
            </div>
          </div>
        </div>
      )}

      {!fallbackRec && (
        <div className="mt-4 pt-2.5 border-t border-base-800/40 flex items-center justify-between text-[9px] text-ink-500">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {doctor.yearsExperience} years experience</span>
          <span>SLA verified</span>
        </div>
      )}
    </motion.div>
  );
}
