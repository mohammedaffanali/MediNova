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
import { randomInt, randomBetween, pick, clamp, uid } from '@/utils';

type Listener = () => void;

export interface RealtimeState {
  hospitals: Hospital[];
  doctors: Doctor[];
  ambulances: Ambulance[];
  emergencies: EmergencyCase[];
  transfers: Transfer[];
  activity: ActivityItem[];
  alerts: AlertItem[];
  recommendations: AIRecommendation[];
}

const ACTIVITY_TEMPLATES = [
  { type: 'emergency' as const, message: 'New emergency case — Level 2', detail: 'Fall injury reported', severity: 'warning' as const },
  { type: 'transfer' as const, message: 'Transfer initiated — TRF-507', detail: 'ICU bed request to MUH', severity: 'info' as const },
  { type: 'admission' as const, message: 'ER admission — MGH', detail: 'Bed 8 occupied', severity: 'info' as const },
  { type: 'discharge' as const, message: 'Patient discharged — MCH', detail: 'Pediatric ward bed freed', severity: 'success' as const },
  { type: 'resource' as const, message: 'MRI available — MCI', detail: 'Scanner back online', severity: 'success' as const },
  { type: 'staff' as const, message: 'Doctor available — Dr. Iyer', detail: 'Shift started at MGH', severity: 'info' as const },
  { type: 'ai' as const, message: 'AI recommendation updated', detail: 'Ambulance demand forecast refreshed', severity: 'info' as const },
  { type: 'alert' as const, message: 'Bed availability dropped', detail: 'MEH emergency beds at 2', severity: 'warning' as const },
];

export class MockRealtimeService {
  private state: RealtimeState;
  private listeners = new Set<Listener>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private activityIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(initial: RealtimeState) {
    this.state = initial;
  }

  getState(): RealtimeState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private update(mutator: (s: RealtimeState) => void) {
    this.state = { ...this.state };
    mutator(this.state);
    this.notify();
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), 2500);
    this.activityIntervalId = setInterval(() => this.addActivity(), 5000);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.activityIntervalId) clearInterval(this.activityIntervalId);
    this.intervalId = null;
    this.activityIntervalId = null;
  }

  private tick() {
    this.update((s) => {
      s.hospitals = s.hospitals.map((h) => {
        const delta = randomInt(-2, 2);
        const newAvail = clamp(h.availableBeds + delta, 0, h.totalBeds);
        const newIcuAvail = clamp(h.icuAvailable + randomInt(-1, 1), 0, h.icuBeds);
        const newEmgAvail = clamp(h.emergencyAvailable + randomInt(-1, 1), 0, h.emergencyBeds);
        const newVentAvail = clamp(h.ventilatorsAvailable + randomInt(-1, 1), 0, h.ventilators);
        const occ = ((h.totalBeds - newAvail) / h.totalBeds) * 100;
        const healthScore = Math.round(clamp(100 - occ * 0.6 + randomBetween(-5, 5), 20, 98));
        const health = healthScore >= 80 ? 'optimal' : healthScore >= 60 ? 'stable' : healthScore >= 40 ? 'strained' : 'critical';
        return {
          ...h,
          availableBeds: newAvail,
          icuAvailable: newIcuAvail,
          emergencyAvailable: newEmgAvail,
          ventilatorsAvailable: newVentAvail,
          emergencyQueue: clamp(h.emergencyQueue + randomInt(-1, 1), 0, 30),
          avgWaitTime: clamp(h.avgWaitTime + randomInt(-3, 3), 2, 90),
          responseTime: clamp(h.responseTime + randomInt(-2, 2), 3, 30),
          oxygenLevel: clamp(h.oxygenLevel + randomInt(-2, 1), 30, 100),
          healthScore,
          health,
          lastUpdated: Date.now(),
        };
      });

      s.doctors = s.doctors.map((d) => {
        if (Math.random() < 0.08) {
          const statuses: Doctor['status'][] = ['available', 'busy', 'emergency', 'on_call', 'in_surgery'];
          return { ...d, status: pick(statuses), queue: clamp(d.queue + randomInt(-1, 2), 0, 10) };
        }
        return { ...d, queue: clamp(d.queue + randomInt(-1, 1), 0, 10), patientsToday: d.patientsToday + (Math.random() < 0.05 ? 1 : 0) };
      });

      s.ambulances = s.ambulances.map((a) => {
        if (a.status === 'offline') return a;
        const speed = a.status === 'available' ? 0 : a.status === 'en_route' || a.status === 'transporting' ? randomInt(25, 75) : randomInt(0, 15);
        const heading = (a.heading + randomInt(-15, 15)) % 360;
        const latDelta = speed > 0 ? Math.cos((heading * Math.PI) / 180) * 0.0008 : 0;
        const lngDelta = speed > 0 ? Math.sin((heading * Math.PI) / 180) * 0.0008 : 0;
        return {
          ...a,
          lat: a.lat + latDelta,
          lng: a.lng + lngDelta,
          speed,
          heading,
          eta: a.eta > 0 ? clamp(a.eta - 1, 0, 30) : a.eta,
          fuel: clamp(a.fuel - (speed > 0 ? randomBetween(0, 0.3) : 0), 10, 100),
          lastUpdated: Date.now(),
        };
      });

      s.emergencies = s.emergencies.map((e) => {
        if (e.status === 'resolved') return e;
        if (Math.random() < 0.12) {
          const progression: Record<string, EmergencyCase['status']> = {
            active: 'dispatched',
            dispatched: 'transporting',
            transporting: 'arrived',
            arrived: 'resolved',
          };
          return { ...e, status: progression[e.status] || e.status, updatedAt: Date.now() };
        }
        if (e.eta && e.eta > 0) {
          return { ...e, eta: e.eta - 1, updatedAt: Date.now() };
        }
        return e;
      });

      s.transfers = s.transfers.map((t) => {
        if (t.status === 'completed') return t;
        if (Math.random() < 0.1) {
          const progression: Record<string, Transfer['status']> = {
            pending: 'ai_analysis',
            ai_analysis: 'hospital_ranking',
            hospital_ranking: 'bed_reserved',
            bed_reserved: 'ambulance_assigned',
            ambulance_assigned: 'hospital_accepted',
            hospital_accepted: 'in_transit',
            in_transit: 'completed',
          };
          return { ...t, status: progression[t.status] || t.status, updatedAt: Date.now() };
        }
        return t;
      });

      s.recommendations = s.recommendations.map((r) => ({
        ...r,
        confidence: clamp(r.confidence + randomBetween(-1, 1), 70, 99),
      }));
    });
  }

  private addActivity() {
    this.update((s) => {
      const t = pick(ACTIVITY_TEMPLATES);
      const item: ActivityItem = {
        id: uid('act'),
        type: t.type,
        message: t.message,
        detail: t.detail,
        severity: t.severity,
        hospitalId: `hosp_${randomInt(1, 8)}`,
        timestamp: Date.now(),
      };
      s.activity = [item, ...s.activity].slice(0, 50);
    });
  }

  acknowledgeAlert(alertId: string) {
    this.update((s) => {
      s.alerts = s.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
    });
  }

  resolveEmergency(caseId: string) {
    this.update((s) => {
      s.emergencies = s.emergencies.map((e) => (e.id === caseId ? { ...e, status: 'resolved', updatedAt: Date.now() } : e));
    });
  }

  advanceTransfer(transferId: string) {
    this.update((s) => {
      s.transfers = s.transfers.map((t) => {
        if (t.id !== transferId || t.status === 'completed') return t;
        const progression: Record<string, Transfer['status']> = {
          pending: 'ai_analysis',
          ai_analysis: 'hospital_ranking',
          hospital_ranking: 'bed_reserved',
          bed_reserved: 'ambulance_assigned',
          ambulance_assigned: 'hospital_accepted',
          hospital_accepted: 'in_transit',
          in_transit: 'completed',
        };
        return { ...t, status: progression[t.status] || t.status, updatedAt: Date.now() };
      });
    });
  }

  dispatchAmbulance(caseId: string, ambulanceId: string) {
    this.update((s) => {
      s.emergencies = s.emergencies.map((e) =>
        e.id === caseId ? { ...e, status: 'dispatched', ambulanceId, updatedAt: Date.now() } : e,
      );
      s.ambulances = s.ambulances.map((a) =>
        a.id === ambulanceId ? { ...a, status: 'en_route', assignedCaseId: caseId, lastUpdated: Date.now() } : a,
      );
    });
  }

  createTransfer(transfer: Omit<Transfer, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'status' | 'recommendedHospitals'>) {
    this.update((s) => {
      const code = `TRF-${500 + s.transfers.length + 1}`;
      const newTransfer: Transfer = {
        ...transfer,
        id: uid('tx'),
        code,
        status: 'ai_analysis',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        recommendedHospitals: s.hospitals
          .filter((h) => h.id !== transfer.fromHospitalId)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((h) => {
            let score = 95;
            if (h.icuAvailable === 0) score -= 30;
            if (h.emergencyQueue > 12) score -= 15;
            
            return {
              hospitalId: h.id,
              score: Math.max(45, Math.min(99, Math.round(score - Math.random() * 10))),
              reason: h.icuAvailable > 0 ? 'Lowest wait times and ICU bed available.' : 'Trauma ward capability matches diagnosis.',
            };
          }),
      };
      s.transfers = [newTransfer, ...s.transfers];
      
      // Also post a live activity log
      const logItem: ActivityItem = {
        id: uid('act'),
        type: 'transfer',
        message: `Transfer Request Created — ${code}`,
        detail: `Patient: ${transfer.patientName} (${transfer.patientAge}y)`,
        hospitalId: transfer.fromHospitalId,
        severity: 'info',
        timestamp: Date.now(),
      };
      s.activity = [logItem, ...s.activity].slice(0, 50);
    });
  }

  createEmergency(emgCase: Omit<EmergencyCase, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'status' | 'vitals'>) {
    this.update((s) => {
      const code = `EMG-${100 + s.emergencies.length + 1}`;
      const newCase: EmergencyCase = {
        ...emgCase,
        id: uid('case'),
        code,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        vitals: {
          heartRate: randomInt(60, 140),
          bloodPressure: `${randomInt(90, 140)}/${randomInt(60, 90)}`,
          temperature: parseFloat(randomBetween(97.5, 101.2).toFixed(1)),
          ecg: Array.from({ length: 40 }, (_, j) => Math.sin(j / 2) * 20 + randomBetween(-5, 5)),
          spo2: randomInt(85, 99),
          riskScore: emgCase.severity === 'level1' ? randomInt(75, 98) : randomInt(20, 65),
        }
      };
      s.emergencies = [newCase, ...s.emergencies];
      
      // Add activity feed item
      const logItem: ActivityItem = {
        id: uid('act'),
        type: 'emergency',
        message: `New Incident Logged — ${code}`,
        detail: emgCase.complaint,
        severity: emgCase.severity === 'level1' ? 'critical' : 'warning',
        timestamp: Date.now(),
      };
      s.activity = [logItem, ...s.activity].slice(0, 50);
    });
  }
}

let service: MockRealtimeService | null = null;

export function getRealtimeService(initial?: RealtimeState): MockRealtimeService {
  if (!service && initial) {
    service = new MockRealtimeService(initial);
  }
  return service!;
}
