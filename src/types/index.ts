export type UserRole = 'system_admin' | 'hospital_admin' | 'ambulance_crew';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarColor: string;
  hospitalId?: string;
}

export type HospitalHealth = 'optimal' | 'stable' | 'strained' | 'critical';
export type HospitalTier = 'Level I' | 'Level II' | 'Level III' | 'Level IV';

export interface Hospital {
  id: string;
  name: string;
  code: string;
  tier: HospitalTier;
  region: string;
  city: string;
  lat: number;
  lng: number;
  health: HospitalHealth;
  healthScore: number;
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  icuAvailable: number;
  emergencyBeds: number;
  emergencyAvailable: number;
  ventilators: number;
  ventilatorsAvailable: number;
  doctors: number;
  nurses: number;
  operatingTheatres: number;
  otAvailable: number;
  ctAvailable: boolean;
  mriAvailable: boolean;
  bloodBankUnits: number;
  labQueue: number;
  pharmacyStock: number;
  dialysisSlots: number;
  oxygenLevel: number;
  powerBackup: number;
  emergencyQueue: number;
  avgWaitTime: number;
  responseTime: number;
  lastUpdated: number;
}

export type DoctorStatus =
  | 'available'
  | 'busy'
  | 'emergency'
  | 'on_call'
  | 'off_duty'
  | 'in_surgery';

export interface Doctor {
  id: string;
  name: string;
  photoColor: string;
  hospitalId: string;
  department: string;
  specialization: string;
  status: DoctorStatus;
  queue: number;
  patientsToday: number;
  shiftStart: string;
  shiftEnd: string;
  currentLocation: string;
  emergencyContact: string;
  yearsExperience: number;
  rating: number;
}

export type ResourceStatus = 'optimal' | 'adequate' | 'low' | 'critical' | 'offline';

export interface Resource {
  id: string;
  hospitalId: string;
  name: string;
  category: 'bed' | 'icu' | 'emergency' | 'ventilator' | 'imaging' | 'blood' | 'supply' | 'facility';
  total: number;
  available: number;
  unit: string;
  status: ResourceStatus;
  trend: number[];
  forecast: number[];
  prediction: string;
  lastUpdated: number;
}

export type AmbulanceStatus = 'available' | 'en_route' | 'on_scene' | 'transporting' | 'returning' | 'offline';
export type AmbulanceType = 'ALS' | 'BLS' | 'CCU' | 'Air';

export interface Ambulance {
  id: string;
  code: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  hospitalId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  eta: number;
  assignedCaseId?: string;
  patientPriority?: 'critical' | 'urgent' | 'moderate' | 'minor';
  driver: string;
  crew: string[];
  fuel: number;
  lastUpdated: number;
}

export interface Vitals {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  ecg: number[];
  spo2: number;
  riskScore: number;
}

export type EmergencySeverity = 'level1' | 'level2' | 'level3' | 'level4';
export type EmergencyStatus = 'active' | 'dispatched' | 'transporting' | 'arrived' | 'resolved';

export interface EmergencyCase {
  id: string;
  code: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  complaint: string;
  priority: 'critical' | 'urgent' | 'moderate' | 'minor';
  location: string;
  lat: number;
  lng: number;
  hospitalId?: string;
  ambulanceId?: string;
  vitals?: Vitals;
  eta?: number;
  createdAt: number;
  updatedAt: number;
}

export type TransferStatus =
  | 'pending'
  | 'ai_analysis'
  | 'hospital_ranking'
  | 'bed_reserved'
  | 'ambulance_assigned'
  | 'hospital_accepted'
  | 'in_transit'
  | 'completed'
  | 'rejected';

export interface Transfer {
  id: string;
  code: string;
  patientName: string;
  patientAge: number;
  fromHospitalId: string;
  toHospitalId?: string;
  reason: string;
  status: TransferStatus;
  priority: 'critical' | 'urgent' | 'moderate';
  recommendedHospitals: { hospitalId: string; score: number; reason: string }[];
  ambulanceId?: string;
  createdAt: number;
  updatedAt: number;
}

export type ActivityType =
  | 'emergency'
  | 'transfer'
  | 'admission'
  | 'discharge'
  | 'resource'
  | 'staff'
  | 'ai'
  | 'system'
  | 'alert';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  detail?: string;
  hospitalId?: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
  timestamp: number;
}

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  hospitalId?: string;
  acknowledged: boolean;
  createdAt: number;
}

export type AIRecommendationType =
  | 'hospital'
  | 'doctor'
  | 'resource'
  | 'overload'
  | 'icu'
  | 'ambulance'
  | 'report'
  | 'waittime'
  | 'transfer'
  | 'optimization';

export interface AIRecommendation {
  id: string;
  type: AIRecommendationType;
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  actionable: boolean;
  hospitalId?: string;
  createdAt: number;
}

export interface AIPrediction {
  id: string;
  type: 'icu' | 'overload' | 'ambulance_demand' | 'resource' | 'waittime';
  title: string;
  forecast: { label: string; value: number; confidence: number }[];
  horizon: string;
  confidence: number;
  createdAt: number;
}

export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  head: string;
  doctors: number;
  nurses: number;
  beds: number;
  occupancy: number;
  queue: number;
  status: ResourceStatus;
  avgWaitTime: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  read: boolean;
  severity: AlertSeverity;
  timestamp: number;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  duration: number;
}
