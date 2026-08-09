import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, ROLE_LABELS, REGISTERED_USERS } from '@/store/authStore';
import { Logo } from '@/components/layout/Logo';
import FuturisticBg from '@/components/layout/FuturisticBg';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, Globe, Smartphone, Building, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserRole } from '@/types';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialRole = location.state?.selectedRole || 'system_admin';
  const [role, setRole] = useState<UserRole>(initialRole);
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Steps: 'login' | 'mfa' | 'google-chooser'
  const [step, setStep] = useState<'login' | 'mfa' | 'google-chooser'>('login');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaUserEmail, setMfaUserEmail] = useState('');
  
  const loginStore = useAuthStore((s) => s.login);
  const loginWithGoogleStore = useAuthStore((s) => s.loginWithGoogle);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // Pre-fill email based on role selection to simplify testing
  useEffect(() => {
    if (role === 'system_admin') {
      setEmail('arjun.mehta@medinova.health');
    } else if (role === 'hospital_admin') {
      setEmail('priya.sharma@medinova.health');
    } else if (role === 'ambulance_crew') {
      setEmail('sanjay.patel@medinova.health');
    }
    setPassword('••••••••'); // simulated password
  }, [role]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ambulance_crew') {
        navigate('/ambulances');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const matched = REGISTERED_USERS[email.toLowerCase()];
    if (!matched) {
      setError('Invalid credentials. Email is not registered.');
      return;
    }
    if (matched.role !== role) {
      setError(`Authentication mismatch. This account belongs to a ${ROLE_LABELS[matched.role]}. Please select the correct role.`);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMfaUserEmail(email);
      setStep('mfa');
    }, 800);
  };

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    if (mfaCode.length !== 6 || !/^\d+$/.test(mfaCode)) {
      setMfaError('MFA verification failed. Please enter a valid 6-digit code.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const success = loginStore(mfaUserEmail, role, rememberMe);
      if (success) {
        // Redirection handled by useEffect
      } else {
        setMfaError('Authentication session failed.');
      }
    }, 600);
  };

  const handleGoogleClick = () => {
    setStep('google-chooser');
  };

  // Google account chooser simulator
  const handleSelectGoogleAccount = (googleAccount: { name: string; email: string; picture: string; sub: string }) => {
    setError('');
    setStep('login');
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      const res = loginWithGoogleStore(googleAccount);
      if (!res.success) {
        setError(res.error || 'Authentication error.');
      } else {
        // Redirection handled by useEffect
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen text-ink-200 flex flex-col justify-center items-center selection:bg-brand-500/30 overflow-x-hidden p-4 relative animate-fade-in">
      <FuturisticBg />

      <Logo className="mb-6 scale-110" />

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          
          {/* Main Credentials Login Form */}
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.97, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -5 }}
              transition={{ duration: 0.2 }}
              className="glass p-8 border border-base-750/60 shadow-float"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-ink-400 mb-1">
                <span>IDENTITY PROVIDER DIRECTORY</span>
              </div>
              <h2 className="text-xl font-bold text-ink-100 flex items-center justify-between">
                Sign In
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-brand-500/20 bg-brand-500/10 text-brand-300`}>
                  {ROLE_LABELS[role]}
                </span>
              </h2>
              <p className="text-xs text-ink-400 mt-1 mb-6">Access secure Medinova command servers.</p>

              {error && (
                <div className="mb-4 rounded-lg bg-critical-500/10 border border-critical-500/20 p-3 text-xs text-critical-400 flex items-start gap-2 animate-pulse">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] text-ink-400 uppercase tracking-widest font-semibold mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-ink-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@medinova.health"
                      className="w-full rounded-lg bg-base-850/60 border border-base-700/50 pl-10 pr-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-brand-500/40"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-ink-400 uppercase tracking-widest font-semibold block">Password</label>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact hospital IT department to reset credentials.'); }} className="text-[10px] font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-ink-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg bg-base-850/60 border border-base-700/50 pl-10 pr-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-brand-500/40"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-ink-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-base-850 border-base-700 text-brand-500 focus:ring-0"
                    />
                    Remember my credentials
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 py-2.5 text-sm font-semibold text-base-950 shadow-glow disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Request Connection'}
                </button>
              </form>

              {/* SSO Integrations */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-base-800/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-base-900 px-2 text-[10px] text-ink-500 font-bold tracking-widest">
                    Federated SSO Command
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-lg bg-base-850 hover:bg-base-800 border border-base-700/50 px-4 py-2 text-xs font-semibold text-ink-200 transition-colors cursor-pointer"
                >
                  <Globe className="h-4 w-4 text-brand-300" />
                  Continue with Google Workspace
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert('Microsoft Azure Directory Single Sign-On is configured. Ready for enterprise mapping.')}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-base-850/40 hover:bg-base-850 border border-base-700/30 px-3 py-2 text-[10px] font-semibold text-ink-300 transition-colors cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-ink-500" />
                    Microsoft SSO
                  </button>
                  <button
                    onClick={() => alert('SSO SAML2 integration verified. Awaiting network authority redirection.')}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-base-850/40 hover:bg-base-850 border border-base-700/30 px-3 py-2 text-[10px] font-semibold text-ink-300 transition-colors cursor-pointer"
                  >
                    <Building className="h-3.5 w-3.5 text-ink-500" />
                    Hospital SSO
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-between text-xs font-medium border-t border-base-800/40 pt-4">
                <button
                  onClick={() => navigate('/roles')}
                  className="flex items-center gap-1.5 text-ink-400 hover:text-ink-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Roles
                </button>
              </div>
            </motion.div>
          )}

          {/* MFA / 2FA View */}
          {step === 'mfa' && (
            <motion.div
              key="mfa"
              initial={{ opacity: 0, scale: 0.97, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -5 }}
              transition={{ duration: 0.2 }}
              className="glass p-8 border border-base-750/60 shadow-float"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 border border-brand-500/25 mb-4">
                <Smartphone className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-ink-100">Verification Required</h2>
              <p className="text-xs text-ink-400 mt-1 mb-6">
                Enter the 6-digit confirmation code from your authenticator application or device to authenticate session.
              </p>

              {mfaError && (
                <div className="mb-4 rounded-lg bg-critical-500/10 border border-critical-500/20 p-3 text-xs text-critical-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{mfaError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyMfa} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-ink-400 uppercase tracking-widest font-semibold block">6-Digit Code</label>
                    <span className="text-[10px] text-ink-500 font-mono">Test code: 123456</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="123456"
                    className="w-full tracking-[1.5em] text-center rounded-lg bg-base-850/60 border border-base-700/50 py-2.5 text-lg font-bold text-brand-300 focus:outline-none focus:border-brand-500/40 focus:ring-0 placeholder:tracking-normal placeholder:font-normal placeholder:text-ink-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 py-2.5 text-sm font-semibold text-base-950 shadow-glow disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm Identity'}
                </button>
              </form>

              <div className="mt-8 flex justify-between text-xs font-medium border-t border-base-800/40 pt-4">
                <button
                  onClick={() => setStep('login')}
                  className="flex items-center gap-1.5 text-ink-400 hover:text-ink-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Cancel Request
                </button>
              </div>
            </motion.div>
          )}

          {/* Google Accounts Chooser Overlay Simulator */}
          {step === 'google-chooser' && (
            <motion.div
              key="google"
              initial={{ opacity: 0, scale: 0.97, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -5 }}
              transition={{ duration: 0.2 }}
              className="glass p-8 border border-base-750/60 shadow-float"
            >
              <div className="flex justify-center mb-6">
                <svg className="h-9 w-9" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48C21.68,11.78 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.88c2.4,0 4.41,-0.8 5.88,-2.18l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.48,0.98 -2.68,0 -4.95,-1.81 -5.76,-4.25H2.04v2.66C3.51,18.42 7.5,20.88 12,20.88z" fill="#34A853" />
                    <path d="M6.24,12.85c-0.2,-0.62 -0.32,-1.28 -0.32,-1.95s0.12,-1.33 0.32,-1.95V6.29H2.04c-0.66,1.33 -1.04,2.83 -1.04,4.41s0.38,3.08 1.04,4.41L6.24,12.85z" fill="#FBBC05" />
                    <path d="M12,5.27c1.3,0 2.48,0.45 3.4,1.32l2.55,-2.55C16.41,2.6 14.4,1.92 12,1.92 7.5,1.92 3.51,4.38 2.04,8.29l4.2,3.26C7.05,7.08 9.32,5.27 12,5.27z" fill="#EA4335" />
                  </g>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-ink-100 text-center">Choose an account</h2>
              <p className="text-xs text-ink-400 mt-1 text-center mb-6">to continue to <strong>medinova.health</strong></p>

              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                
                {/* Account 1 */}
                <button
                  onClick={() => handleSelectGoogleAccount({
                    name: 'Dr. Arjun Mehta',
                    email: 'arjun.mehta@medinova.health',
                    picture: 'A',
                    sub: '1102947209384729103'
                  })}
                  className="w-full flex items-center gap-3 rounded-xl bg-base-850/50 hover:bg-base-850 border border-base-750 px-4 py-3 text-left transition-colors cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 font-bold text-sm">
                    AM
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-100 truncate">Dr. Arjun Mehta</p>
                    <p className="text-[10px] text-ink-400 truncate">arjun.mehta@medinova.health</p>
                  </div>
                  <span className="text-[9px] font-mono text-success-400 bg-success-400/10 px-1.5 py-0.5 rounded border border-success-400/20">REGISTERED</span>
                </button>

                {/* Account 2 */}
                <button
                  onClick={() => handleSelectGoogleAccount({
                    name: 'Dr. Priya Sharma',
                    email: 'priya.sharma@medinova.health',
                    picture: 'P',
                    sub: '1098472019482938471'
                  })}
                  className="w-full flex items-center gap-3 rounded-xl bg-base-850/50 hover:bg-base-850 border border-base-750 px-4 py-3 text-left transition-colors cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-500/20 text-success-300 font-bold text-sm">
                    PS
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-100 truncate">Dr. Priya Sharma</p>
                    <p className="text-[10px] text-ink-400 truncate">priya.sharma@medinova.health</p>
                  </div>
                  <span className="text-[9px] font-mono text-success-400 bg-success-400/10 px-1.5 py-0.5 rounded border border-success-400/20">REGISTERED</span>
                </button>

                {/* Account 3 */}
                <button
                  onClick={() => handleSelectGoogleAccount({
                    name: 'Sanjay Patel',
                    email: 'sanjay.patel@medinova.health',
                    picture: 'S',
                    sub: '1058294710495827361'
                  })}
                  className="w-full flex items-center gap-3 rounded-xl bg-base-850/50 hover:bg-base-850 border border-base-750 px-4 py-3 text-left transition-colors cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-500/20 text-warning-300 font-bold text-sm">
                    SP
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-100 truncate">Sanjay Patel</p>
                    <p className="text-[10px] text-ink-400 truncate">sanjay.patel@medinova.health</p>
                  </div>
                  <span className="text-[9px] font-mono text-success-400 bg-success-400/10 px-1.5 py-0.5 rounded border border-success-400/20">REGISTERED</span>
                </button>

                {/* Unregistered Account */}
                <button
                  onClick={() => handleSelectGoogleAccount({
                    name: 'John Doe',
                    email: 'john.doe@gmail.com',
                    picture: 'J',
                    sub: '1029482938472910394'
                  })}
                  className="w-full flex items-center gap-3 rounded-xl bg-base-850/50 hover:bg-base-850 border border-base-750 px-4 py-3 text-left transition-colors cursor-pointer"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-500/20 text-ink-400 font-bold text-sm">
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-100 truncate">John Doe</p>
                    <p className="text-[10px] text-ink-400 truncate">john.doe@gmail.com</p>
                  </div>
                  <span className="text-[9px] font-mono text-ink-500 bg-base-800 px-1.5 py-0.5 rounded border border-base-700">UNREGISTERED</span>
                </button>

              </div>

              <div className="mt-8 flex justify-between text-xs font-medium border-t border-base-800/40 pt-4">
                <button
                  onClick={() => setStep('login')}
                  className="flex items-center gap-1.5 text-ink-400 hover:text-ink-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-[10px] text-ink-500 relative z-10 max-w-sm">
        <p>This workstation is registered. All connection requests are monitored and recorded under Security Policy IAM-881.</p>
      </div>
    </div>
  );
}
