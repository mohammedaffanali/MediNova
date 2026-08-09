import { create } from 'zustand';
import type { ToastItem, AlertSeverity } from '@/types';
import { uid } from '@/utils';

interface UIState {
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  notificationPanelOpen: boolean;
  commandPaletteOpen: boolean;
  selectedHospitalId: string | null;
  toasts: ToastItem[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (v: boolean) => void;
  toggleNotificationPanel: () => void;
  setNotificationPanelOpen: (v: boolean) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setSelectedHospitalId: (id: string | null) => void;
  pushToast: (title: string, message: string, severity?: AlertSeverity) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  aiPanelOpen: true,
  notificationPanelOpen: false,
  commandPaletteOpen: false,
  selectedHospitalId: null,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setAIPanelOpen: (v) => set({ aiPanelOpen: v }),
  toggleNotificationPanel: () => set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),
  setNotificationPanelOpen: (v) => set({ notificationPanelOpen: v }),
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  setSelectedHospitalId: (id) => set({ selectedHospitalId: id }),
  pushToast: (title, message, severity = 'info') =>
    set((s) => ({
      toasts: [...s.toasts, { id: uid('toast'), title, message, severity, duration: 4000 }],
    })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
