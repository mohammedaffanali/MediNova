import { create } from 'zustand';
import {
  createHospitals,
  createDoctors,
  createAmbulances,
  createEmergencies,
  createTransfers,
  createActivityFeed,
  createAlerts,
  createAIRecommendations,
} from '@/mock/data';
import type {
  Hospital,
  Doctor,
  Ambulance,
  EmergencyCase,
  Transfer,
  ActivityItem,
  AlertItem,
  AIRecommendation,
} from '@/types';
import { getRealtimeService, type RealtimeState } from '@/mock/realtime';

function buildInitialState(): RealtimeState {
  const hospitals = createHospitals();
  const doctors = createDoctors(hospitals);
  const ambulances = createAmbulances(hospitals);
  const emergencies = createEmergencies(hospitals, ambulances);
  const transfers = createTransfers(hospitals);
  const activity = createActivityFeed(20);
  const alerts = createAlerts();
  const recommendations = createAIRecommendations();
  return { hospitals, doctors, ambulances, emergencies, transfers, activity, alerts, recommendations };
}

interface DataState extends RealtimeState {
  init: () => void;
  setFromSnapshot: (s: RealtimeState) => void;
  acknowledgeAlert: (id: string) => void;
  resolveEmergency: (id: string) => void;
  advanceTransfer: (id: string) => void;
  dispatchAmbulance: (caseId: string, ambulanceId: string) => void;
  createTransfer: (transfer: Omit<Transfer, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'status' | 'recommendedHospitals'>) => void;
  createEmergency: (emgCase: Omit<EmergencyCase, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'status' | 'vitals'>) => void;
}

export const useDataStore = create<DataState>((set, get) => {
  const initial = buildInitialState();
  const service = getRealtimeService(initial);

  return {
    ...initial,
    init: () => {
      if (!localStorage.getItem('medinova_gmaps_key')) {
        localStorage.setItem('medinova_gmaps_key', 'AIzaSyCgqRCNsmXhQz3Wu-mLNxIMQ9H4yMfTlCQ');
      }
      service.subscribe(() => {
        set({ ...service.getState() });
      });
      service.start();
    },
    setFromSnapshot: (s) => set({ ...s }),
    acknowledgeAlert: (id) => service.acknowledgeAlert(id),
    resolveEmergency: (id) => service.resolveEmergency(id),
    advanceTransfer: (id) => service.advanceTransfer(id),
    dispatchAmbulance: (caseId, ambulanceId) => service.dispatchAmbulance(caseId, ambulanceId),
    createTransfer: (transfer) => service.createTransfer(transfer),
    createEmergency: (emgCase) => service.createEmergency(emgCase),
  };
});

export type { Hospital, Doctor, Ambulance, EmergencyCase, Transfer, ActivityItem, AlertItem, AIRecommendation };
