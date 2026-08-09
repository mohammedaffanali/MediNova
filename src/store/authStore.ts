import { create } from 'zustand';
import type { User, UserRole } from '@/types';
import { CURRENT_USER } from '@/mock/data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  token: string | null;
  login: (email: string, role: UserRole, rememberMe?: boolean) => boolean;
  loginWithGoogle: (googleUser: { name: string; email: string; picture: string; sub: string }) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setRememberMe: (val: boolean) => void;
}

// Full database of registered users with roles and permissions
export const REGISTERED_USERS: Record<string, User & { permissions: string[]; department?: string }> = {
  'arjun.mehta@medinova.health': {
    id: 'user_001',
    name: 'Dr. Arjun Mehta',
    role: 'system_admin',
    email: 'arjun.mehta@medinova.health',
    avatarColor: '#33c9ff',
    permissions: ['all_access', 'manage_hospitals', 'manage_ambulances', 'manage_users', 'view_audit_logs'],
  },
  'priya.sharma@medinova.health': {
    id: 'user_002',
    name: 'Dr. Priya Sharma',
    role: 'hospital_admin',
    email: 'priya.sharma@medinova.health',
    avatarColor: '#34d399',
    hospitalId: 'hosp_1',
    department: 'Cardiology',
    permissions: ['hospital_operations', 'manage_doctors', 'manage_resources', 'request_transfers'],
  },
  'sanjay.patel@medinova.health': {
    id: 'user_003',
    name: 'Sanjay Patel',
    role: 'ambulance_crew',
    email: 'sanjay.patel@medinova.health',
    avatarColor: '#fbbf24',
    hospitalId: 'hosp_1',
    permissions: ['field_operations', 'capture_vitals', 'request_admission'],
  },
};

const getStoredAuth = () => {
  try {
    const isRemembered = localStorage.getItem('medinova_remember') === 'true';
    const store = isRemembered ? localStorage : sessionStorage;
    const userStr = store.getItem('medinova_user');
    const token = store.getItem('medinova_token');
    
    if (userStr && token) {
      return {
        user: JSON.parse(userStr) as User,
        isAuthenticated: true,
        token,
        rememberMe: isRemembered,
      };
    }
  } catch (e) {
    console.error('Failed to parse stored auth session', e);
  }
  return {
    user: null,
    isAuthenticated: false,
    token: null,
    rememberMe: false,
  };
};

const writeAuditLog = (user: User, action: string, details: string) => {
  try {
    const currentLogs = localStorage.getItem('medinova_local_audit_logs');
    const logs = currentLogs ? JSON.parse(currentLogs) : [];
    const newLog = {
      id: `log_loc_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      resource: 'Auth',
      resourceId: user.id,
      details,
      ipAddress: '192.168.1.105',
      timestamp: Date.now(),
    };
    localStorage.setItem('medinova_local_audit_logs', JSON.stringify([newLog, ...logs].slice(0, 100)));
  } catch (e) {
    console.error('Failed to write local audit log', e);
  }
};

const initialAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  rememberMe: initialAuth.rememberMe,
  token: initialAuth.token,
  
  setRememberMe: (val) => set({ rememberMe: val }),

  login: (email, role, rememberMe = false) => {
    const matchedUser = REGISTERED_USERS[email.toLowerCase()];
    if (matchedUser && matchedUser.role === role) {
      const userObj: User = {
        id: matchedUser.id,
        name: matchedUser.name,
        role: matchedUser.role,
        email: matchedUser.email,
        avatarColor: matchedUser.avatarColor,
        hospitalId: matchedUser.hospitalId,
      };
      const mockToken = `jwt_${userObj.role}_${Date.now()}`;
      const store = rememberMe ? localStorage : sessionStorage;
      
      if (rememberMe) {
        localStorage.setItem('medinova_remember', 'true');
      } else {
        localStorage.removeItem('medinova_remember');
      }
      
      store.setItem('medinova_user', JSON.stringify(userObj));
      store.setItem('medinova_token', mockToken);
      
      set({ user: userObj, isAuthenticated: true, token: mockToken, rememberMe });
      writeAuditLog(userObj, 'LOGIN', `User logged in successfully via Email/Password`);
      return true;
    }
    return false;
  },

  loginWithGoogle: (googleUser) => {
    const matchedUser = REGISTERED_USERS[googleUser.email.toLowerCase()];
    if (!matchedUser) {
      return { 
        success: false, 
        error: 'This Google account is not registered with Medinova AI. Please contact your System Administrator.' 
      };
    }
    
    const userObj: User = {
      id: matchedUser.id,
      name: matchedUser.name,
      role: matchedUser.role,
      email: matchedUser.email,
      avatarColor: matchedUser.avatarColor,
      hospitalId: matchedUser.hospitalId,
    };
    const mockToken = `jwt_google_${userObj.role}_${Date.now()}`;
    const isRemembered = localStorage.getItem('medinova_remember') === 'true';
    const store = isRemembered ? localStorage : sessionStorage;
    
    store.setItem('medinova_user', JSON.stringify(userObj));
    store.setItem('medinova_token', mockToken);
    
    set({ user: userObj, isAuthenticated: true, token: mockToken });
    writeAuditLog(userObj, 'LOGIN', `User logged in successfully via Google Sign-In (${googleUser.sub})`);
    return { success: true };
  },

  logout: () => {
    const currUser = useAuthStore.getState().user;
    if (currUser) {
      writeAuditLog(currUser, 'LOGOUT', `User logged out and session cleared`);
    }
    
    localStorage.removeItem('medinova_user');
    localStorage.removeItem('medinova_token');
    localStorage.removeItem('medinova_remember');
    sessionStorage.removeItem('medinova_user');
    sessionStorage.removeItem('medinova_token');
    
    set({ user: null, isAuthenticated: false, token: null });
  },

  switchRole: (role) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    // Find registered user for this role
    const matchedEmail = Object.keys(REGISTERED_USERS).find(key => REGISTERED_USERS[key].role === role);
    if (matchedEmail) {
      const matched = REGISTERED_USERS[matchedEmail];
      const newUser: User = {
        id: matched.id,
        name: matched.name,
        role: matched.role,
        email: matched.email,
        avatarColor: matched.avatarColor,
        hospitalId: matched.hospitalId,
      };
      
      const isRemembered = useAuthStore.getState().rememberMe;
      const store = isRemembered ? localStorage : sessionStorage;
      const mockToken = `jwt_${role}_${Date.now()}`;
      
      store.setItem('medinova_user', JSON.stringify(newUser));
      store.setItem('medinova_token', mockToken);
      
      set({ user: newUser, token: mockToken });
      writeAuditLog(newUser, 'SWITCH_ROLE', `Role switched to ${role}`);
    }
  },
}));

export const ROLE_LABELS: Record<UserRole, string> = {
  system_admin: 'System Admin',
  hospital_admin: 'Hospital Administrator',
  ambulance_crew: 'Ambulance Crew',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  system_admin: 'Complete healthcare network access',
  hospital_admin: 'Single hospital operations',
  ambulance_crew: 'Tablet/mobile optimized field interface',
};
