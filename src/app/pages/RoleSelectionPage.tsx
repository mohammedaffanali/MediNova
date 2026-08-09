import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import FuturisticBg from '@/components/layout/FuturisticBg';
import { Shield, Building2, Ambulance, ArrowRight, UserCheck } from 'lucide-react';
import type { UserRole } from '@/types';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: typeof Shield;
  responsibilities: string[];
  color: string;
  bgGlow: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'system_admin',
    title: 'System Admin',
    description: 'Monitor and manage the entire healthcare network, emergency response fleets, and global resource pools.',
    icon: Shield,
    responsibilities: [
      'Access global network diagnostics',
      'Manage healthcare facilities & regional settings',
      'Oversee ambulance fleet dispatcher operations',
      'Audit security logs & system transaction history',
    ],
    color: 'text-brand-300 border-brand-500/20 hover:border-brand-500/40',
    bgGlow: 'from-brand-500/10 to-transparent',
  },
  {
    id: 'hospital_admin',
    title: 'Hospital Administrator',
    description: 'Manage one medical facility, admitting patients, regulating bed occupancies, and managing doctor availability.',
    icon: Building2,
    responsibilities: [
      'Monitor admissions, discharges, and bed counts',
      'Track real-time ward & department occupancies',
      'Coordinate patient transfers via AI recommendations',
      'Update local equipment statuses & doctor availability',
    ],
    color: 'text-success-400 border-success-500/20 hover:border-success-500/40',
    bgGlow: 'from-success-500/10 to-transparent',
  },
  {
    id: 'ambulance_crew',
    title: 'Ambulance Crew',
    description: 'Field responders accepting emergencies, capturing live patient vitals, and navigating to recommended hospitals.',
    icon: Ambulance,
    responsibilities: [
      'Receive dispatch coordinates & turn-by-turn routing',
      'Log patient vitals & telemetry in transit',
      'Leverage AI for optimal hospital matches',
      'Request emergency bed reservations on-the-fly',
    ],
    color: 'text-warning-400 border-warning-500/20 hover:border-warning-500/40',
    bgGlow: 'from-warning-500/10 to-transparent',
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleSelectRole = (roleId: UserRole) => {
    navigate('/login', { state: { selectedRole: roleId } });
  };

  return (
    <div className="min-h-screen text-ink-200 flex flex-col selection:bg-brand-500/30 overflow-x-hidden relative">
      <FuturisticBg />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-base-800/40">
        <Logo />
        <button
          onClick={() => navigate('/')}
          className="text-xs text-ink-400 hover:text-ink-200 transition-colors"
        >
          Back to Landing
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col justify-center items-center gap-10">
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300"
          >
            <UserCheck className="h-3.5 w-3.5" /> Identity Access Management
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-bold text-ink-100"
          >
            Select Your Command Profile
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-ink-400 text-sm max-w-lg mx-auto"
          >
            Select a role card to customize your authorization experience. Permissions are securely validated after authentication.
          </motion.p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-4">
          {ROLES.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`glass flex flex-col h-full hover:shadow-glow text-left p-6 border group transition-all duration-300`}
            >
              {/* Card top gradient indicator */}
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${role.bgGlow}`} />

              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-base-850 border border-base-750 ${role.color}`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-ink-500 tracking-wider font-semibold uppercase">
                  RBAC SECURE
                </span>
              </div>

              <h2 className="text-lg font-bold text-ink-100 mb-2">{role.title}</h2>
              <p className="text-xs text-ink-400 leading-relaxed mb-6 flex-grow">{role.description}</p>

              {/* Responsibilities */}
              <div className="space-y-2.5 mb-8">
                <p className="text-[10px] font-bold text-ink-300 uppercase tracking-widest">Key Operational Duties</p>
                <ul className="space-y-1.5">
                  {role.responsibilities.map((resp) => (
                    <li key={resp} className="text-xs text-ink-400 flex items-start gap-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectRole(role.id)}
                className="group w-full relative flex items-center justify-center gap-2 rounded-lg bg-base-850 hover:bg-brand-500/10 hover:text-brand-200 border border-base-750 hover:border-brand-500/30 px-4 py-2.5 text-xs font-semibold text-ink-200 transition-all cursor-pointer font-sans"
              >
                Authenticate Role
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-base-800/40 bg-base-950/80 px-6 py-6 text-center text-xs text-ink-500">
        <p>© 2026 Medinova Health Inc. Classified System. Authorized Access Only. HIPAA Compliance Assured.</p>
      </footer>
    </div>
  );
}
