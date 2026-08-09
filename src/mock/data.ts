import type {
  Hospital,
  Doctor,
  Ambulance,
  EmergencyCase,
  Transfer,
  Department,
  Resource,
  AlertItem,
  AIRecommendation,
  ActivityItem,
  User,
} from '@/types';
import { randomInt, randomBetween, pick, uid } from '@/utils';

export const CURRENT_USER: User = {
  id: 'user_001',
  name: 'Dr. Arjun Mehta',
  role: 'system_admin',
  email: 'arjun.mehta@medinova.health',
  avatarColor: '#33c9ff',
};

export const REGIONS = [
  'Northern Region',
  'Southern Region',
  'Eastern Region',
  'Western Region',
  'Central Region',
];

const HOSPITAL_NAMES = [
  { name: 'Medinova General Hospital', code: 'MGH', tier: 'Level I' as const, city: 'Northbridge' },
  { name: 'Medinova Trauma Center', code: 'MTC', tier: 'Level I' as const, city: 'Eastview' },
  { name: 'Medinova Childrens Hospital', code: 'MCH', tier: 'Level II' as const, city: 'Southport' },
  { name: 'Medinova Cardiac Institute', code: 'MCI', tier: 'Level I' as const, city: 'Westhaven' },
  { name: 'Medinova Regional Medical', code: 'MRM', tier: 'Level III' as const, city: 'Central City' },
  { name: 'Medinova Emergency Hospital', code: 'MEH', tier: 'Level II' as const, city: 'Lakeside' },
  { name: 'Medinova University Hospital', code: 'MUH', tier: 'Level I' as const, city: 'Riverside' },
  { name: 'Medinova Community Hospital', code: 'MComH', tier: 'Level IV' as const, city: 'Hillcrest' },
];

const BASE_LAT = 28.6139;
const BASE_LNG = 77.209;

export function createHospitals(): Hospital[] {
  return HOSPITAL_NAMES.map((h, i) => {
    const totalBeds = randomInt(180, 650);
    const availableBeds = randomInt(20, Math.floor(totalBeds * 0.4));
    const icuBeds = randomInt(20, 80);
    const icuAvailable = randomInt(2, Math.floor(icuBeds * 0.4));
    const emergencyBeds = randomInt(15, 50);
    const emergencyAvailable = randomInt(1, Math.floor(emergencyBeds * 0.4));
    const ventilators = randomInt(15, 60);
    const ventilatorsAvailable = randomInt(1, Math.floor(ventilators * 0.4));
    const occ = ((totalBeds - availableBeds) / totalBeds) * 100;
    const healthScore = Math.round(100 - occ * 0.6 + randomBetween(-8, 8));
    const health = healthScore >= 80 ? 'optimal' : healthScore >= 60 ? 'stable' : healthScore >= 40 ? 'strained' : 'critical';
    return {
      id: `hosp_${i + 1}`,
      name: h.name,
      code: h.code,
      tier: h.tier,
      region: REGIONS[i % REGIONS.length],
      city: h.city,
      lat: BASE_LAT + randomBetween(-0.25, 0.25),
      lng: BASE_LNG + randomBetween(-0.25, 0.25),
      health: health as Hospital['health'],
      healthScore: Math.max(20, Math.min(98, healthScore)),
      totalBeds,
      availableBeds,
      icuBeds,
      icuAvailable,
      emergencyBeds,
      emergencyAvailable,
      ventilators,
      ventilatorsAvailable,
      doctors: randomInt(45, 220),
      nurses: randomInt(120, 480),
      operatingTheatres: randomInt(4, 18),
      otAvailable: randomInt(0, 6),
      ctAvailable: Math.random() > 0.1,
      mriAvailable: Math.random() > 0.15,
      bloodBankUnits: randomInt(80, 500),
      labQueue: randomInt(3, 28),
      pharmacyStock: randomInt(60, 98),
      dialysisSlots: randomInt(2, 12),
      oxygenLevel: randomInt(55, 99),
      powerBackup: randomInt(70, 100),
      emergencyQueue: randomInt(2, 18),
      avgWaitTime: randomInt(8, 65),
      responseTime: randomInt(4, 22),
      lastUpdated: Date.now(),
    };
  });
}

const DOCTOR_NAMES = [
  'Dr. Priya Sharma', 'Dr. Rajesh Kumar', 'Dr. Anjali Verma', 'Dr. Vikram Singh',
  'Dr. Neha Gupta', 'Dr. Sanjay Patel', 'Dr. Kavya Reddy', 'Dr. Rohit Malhotra',
  'Dr. Divya Nair', 'Dr. Karthik Iyer', 'Dr. Meera Joshi', 'Dr. Aditya Rao',
  'Dr. Sneha Kapoor', 'Dr. Arnav Bose', 'Dr. Tanvi Desai', 'Dr. Manish Agarwal',
  'Dr. Pooja Bhat', 'Dr. Harsh Mehta', 'Dr. Ishita Jain', 'Dr. Nikhil Khanna',
  'Dr. Ritu Saxena', 'Dr. Gaurav Pillai', 'Dr. Shreya Menon', 'Dr. Devansh Trivedi',
];

const DEPARTMENTS = [
  'Emergency Medicine', 'Cardiology', 'Neurology', 'Trauma Surgery',
  'Orthopedics', 'Pediatrics', 'Oncology', 'Internal Medicine',
  'Pulmonology', 'Nephrology', 'Radiology', 'Anesthesiology',
];

const SPECIALIZATIONS: Record<string, string[]> = {
  'Emergency Medicine': ['Trauma Care', 'Critical Care', 'Disaster Medicine'],
  'Cardiology': ['Interventional Cardiology', 'Electrophysiology', 'Heart Failure'],
  'Neurology': ['Stroke Care', 'Epilepsy', 'Neurocritical Care'],
  'Trauma Surgery': ['Polytrauma', 'Abdominal Trauma', 'Orthopedic Trauma'],
  'Orthopedics': ['Joint Replacement', 'Spine Surgery', 'Sports Medicine'],
  'Pediatrics': ['Neonatology', 'Pediatric ICU', 'Pediatric Emergency'],
  'Oncology': ['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology'],
  'Internal Medicine': ['Critical Care', 'Infectious Disease', 'Geriatrics'],
  'Pulmonology': ['Critical Care', 'Sleep Medicine', 'Interventional Pulmonology'],
  'Nephrology': ['Dialysis', 'Transplant', 'Critical Care'],
  'Radiology': ['Interventional Radiology', 'Neuroradiology', 'Emergency Imaging'],
  'Anesthesiology': ['Cardiac Anesthesia', 'Trauma Anesthesia', 'Pain Medicine'],
};

const DOCTOR_STATUSES: Doctor['status'][] = [
  'available', 'busy', 'emergency', 'on_call', 'off_duty', 'in_surgery',
];
const PHOTO_COLORS = ['#33c9ff', '#4d8dff', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185', '#22d3ee'];

export function createDoctors(hospitals: Hospital[]): Doctor[] {
  const doctors: Doctor[] = [];
  hospitals.forEach((h) => {
    const count = randomInt(8, 16);
    for (let i = 0; i < count; i++) {
      const dept = pick(DEPARTMENTS);
      const spec = pick(SPECIALIZATIONS[dept]);
      const status = pick(DOCTOR_STATUSES);
      doctors.push({
        id: uid('doc'),
        name: pick(DOCTOR_NAMES),
        photoColor: pick(PHOTO_COLORS),
        hospitalId: h.id,
        department: dept,
        specialization: spec,
        status,
        queue: status === 'available' ? randomInt(0, 3) : status === 'in_surgery' ? randomInt(2, 6) : randomInt(1, 8),
        patientsToday: randomInt(4, 22),
        shiftStart: '08:00',
        shiftEnd: '20:00',
        currentLocation: status === 'in_surgery' ? 'OT-2' : status === 'available' ? `${h.code}-Ward` : pick(['ICU', 'ER', 'OPD', 'OT']),
        emergencyContact: '+91 98' + randomInt(10000000, 99999999),
        yearsExperience: randomInt(3, 28),
        rating: randomBetween(3.8, 5),
      });
    }
  });
  return doctors;
}

const AMBULANCE_CODES = ['A-101', 'A-102', 'A-103', 'A-104', 'A-105', 'A-201', 'A-202', 'A-203', 'A-301', 'A-302', 'A-401', 'A-402'];
const AMB_TYPES: Ambulance['type'][] = ['ALS', 'BLS', 'CCU', 'Air'];
const AMB_STATUSES: Ambulance['status'][] = ['available', 'en_route', 'on_scene', 'transporting', 'returning', 'offline'];
const DRIVER_NAMES = ['Ramesh Yadav', 'Suresh Kumar', 'Mahesh Singh', 'Dinesh Patel', 'Ganesh Rao', 'Naresh Verma', 'Rajesh Gupta', 'Lokesh Pillai'];

export function createAmbulances(hospitals: Hospital[]): Ambulance[] {
  return AMBULANCE_CODES.map((code, i) => {
    const hospital = hospitals[i % hospitals.length];
    const status = pick(AMB_STATUSES);
    return {
      id: `amb_${i + 1}`,
      code,
      type: pick(AMB_TYPES),
      status,
      hospitalId: hospital.id,
      lat: hospital.lat + randomBetween(-0.05, 0.05),
      lng: hospital.lng + randomBetween(-0.05, 0.05),
      speed: status === 'available' ? 0 : status === 'offline' ? 0 : randomInt(20, 80),
      heading: randomInt(0, 359),
      eta: status === 'en_route' || status === 'transporting' ? randomInt(3, 28) : 0,
      assignedCaseId: status === 'en_route' || status === 'transporting' || status === 'on_scene' ? uid('case') : undefined,
      patientPriority: status === 'transporting' ? pick(['critical', 'urgent', 'moderate'] as const) : undefined,
      driver: pick(DRIVER_NAMES),
      crew: [pick(DRIVER_NAMES), pick(DRIVER_NAMES)],
      fuel: randomInt(35, 100),
      lastUpdated: Date.now(),
    };
  });
}

const COMPLAINTS = [
  'Chest pain and shortness of breath',
  'MVA — multi-vehicle accident, suspected internal injuries',
  'Stroke symptoms — facial droop, slurred speech',
  'Severe allergic reaction, anaphylaxis',
  'Fall from height, suspected spinal injury',
  'Cardiac arrest, CPR in progress',
  'Severe burns, 40% TBSA',
  'Respiratory distress, SpO2 dropping',
  'Pregnancy complications, active labor',
  'Seizure activity, post-ictal state',
  'Industrial accident, crush injury',
  'Overdose, unresponsive',
];

const LOCATIONS = [
  'Highway NH-48, KM 24', 'Connaught Place', 'Cyber City', 'MG Road', 'Sector 14',
  'Old Town Market', 'Riverside Bridge', 'Industrial Area Phase 2', 'Airport Road', 'Central Station',
];

export function createEmergencies(hospitals: Hospital[], ambulances: Ambulance[]): EmergencyCase[] {
  const count = randomInt(6, 14);
  const cases: EmergencyCase[] = [];
  for (let i = 0; i < count; i++) {
    const severity = pick(['level1', 'level2', 'level3', 'level4'] as const);
    const status = pick(['active', 'dispatched', 'transporting', 'arrived', 'resolved'] as const);
    const hospital = pick(hospitals);
    const ambulance = pick(ambulances);
    const hr = randomInt(55, 140);
    cases.push({
      id: uid('case'),
      code: `EMG-${String(1000 + i).slice(1)}`,
      severity,
      status,
      patientName: status === 'active' ? 'Unknown' : `Patient ${randomInt(100, 999)}`,
      patientAge: randomInt(5, 85),
      patientGender: pick(['M', 'F'] as const),
      complaint: pick(COMPLAINTS),
      priority: severity === 'level1' ? 'critical' : severity === 'level2' ? 'urgent' : severity === 'level3' ? 'moderate' : 'minor',
      location: pick(LOCATIONS),
      lat: hospital.lat + randomBetween(-0.08, 0.08),
      lng: hospital.lng + randomBetween(-0.08, 0.08),
      hospitalId: status === 'arrived' || status === 'resolved' ? hospital.id : undefined,
      ambulanceId: status === 'dispatched' || status === 'transporting' ? ambulance.id : undefined,
      vitals: status !== 'active' && status !== 'resolved' ? {
        heartRate: hr,
        bloodPressure: `${randomInt(80, 140)}/${randomInt(50, 90)}`,
        temperature: randomBetween(96.5, 103.5),
        ecg: Array.from({ length: 40 }, (_, j) => Math.sin(j / 2) * 20 + randomBetween(-5, 5) + (j % 10 === 0 ? 40 : 0)),
        spo2: randomInt(82, 99),
        riskScore: severity === 'level1' ? randomInt(75, 98) : severity === 'level2' ? randomInt(50, 75) : randomInt(20, 50),
      } : undefined,
      eta: status === 'dispatched' || status === 'transporting' ? randomInt(2, 25) : undefined,
      createdAt: Date.now() - randomInt(60, 3600) * 1000,
      updatedAt: Date.now() - randomInt(10, 600) * 1000,
    });
  }
  return cases.sort((a, b) => b.createdAt - a.createdAt);
}

const TRANSFER_REASONS = [
  'ICU bed unavailable at source facility',
  'Specialized cardiac care required',
  'Trauma center transfer for polytrauma',
  'Pediatric ICU capacity exceeded',
  'Burn unit transfer — specialized care',
  'Stroke center — thrombolysis window',
  'Organ transplant coordination',
  'Neonatal intensive care required',
];

export function createTransfers(hospitals: Hospital[]): Transfer[] {
  const count = randomInt(4, 9);
  const transfers: Transfer[] = [];
  for (let i = 0; i < count; i++) {
    const from = pick(hospitals);
    let to = pick(hospitals);
    while (to.id === from.id) to = pick(hospitals);
    const status = pick(['pending', 'ai_analysis', 'hospital_ranking', 'bed_reserved', 'ambulance_assigned', 'hospital_accepted', 'in_transit', 'completed'] as const);
    const recommended = hospitals
      .filter((h) => h.id !== from.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((h) => ({
        hospitalId: h.id,
        score: randomBetween(70, 98),
        reason: pick(['Closest available ICU bed', 'Specialized department match', 'Lowest wait time', 'Highest resource availability']),
      }));
    transfers.push({
      id: uid('tx'),
      code: `TRF-${String(500 + i).slice(1)}`,
      patientName: `Patient ${randomInt(100, 999)}`,
      patientAge: randomInt(8, 82),
      fromHospitalId: from.id,
      toHospitalId: status === 'completed' || status === 'in_transit' || status === 'hospital_accepted' ? recommended[0]?.hospitalId : undefined,
      reason: pick(TRANSFER_REASONS),
      status,
      priority: pick(['critical', 'urgent', 'moderate'] as const),
      recommendedHospitals: recommended,
      createdAt: Date.now() - randomInt(120, 7200) * 1000,
      updatedAt: Date.now() - randomInt(30, 900) * 1000,
    });
  }
  return transfers.sort((a, b) => b.createdAt - a.createdAt);
}

export function createDepartments(hospital: Hospital): Department[] {
  return DEPARTMENTS.map((name, i) => {
    const beds = randomInt(12, 60);
    const available = randomInt(0, Math.floor(beds * 0.4));
    const occ = ((beds - available) / beds) * 100;
    return {
      id: `dept_${hospital.id}_${i}`,
      hospitalId: hospital.id,
      name,
      head: pick(DOCTOR_NAMES),
      doctors: randomInt(3, 18),
      nurses: randomInt(8, 40),
      beds,
      occupancy: occ,
      queue: randomInt(0, 12),
      status: occ >= 95 ? 'critical' : occ >= 80 ? 'low' : occ >= 60 ? 'adequate' : 'optimal',
      avgWaitTime: randomInt(5, 55),
    };
  });
}

export function createResources(hospital: Hospital): Resource[] {
  const resources: Omit<Resource, 'id' | 'hospitalId' | 'trend' | 'forecast' | 'lastUpdated'>[] = [
    { name: 'General Beds', category: 'bed', total: hospital.totalBeds, available: hospital.availableBeds, unit: 'beds', status: 'optimal', prediction: 'Stable for next 6h' },
    { name: 'ICU Beds', category: 'icu', total: hospital.icuBeds, available: hospital.icuAvailable, unit: 'beds', status: 'optimal', prediction: '2 beds freeing in 90m' },
    { name: 'Emergency Beds', category: 'emergency', total: hospital.emergencyBeds, available: hospital.emergencyAvailable, unit: 'beds', status: 'optimal', prediction: 'High demand expected' },
    { name: 'Ventilators', category: 'ventilator', total: hospital.ventilators, available: hospital.ventilatorsAvailable, unit: 'units', status: 'optimal', prediction: '1 unit under maintenance' },
    { name: 'MRI Scanner', category: 'imaging', total: 1, available: hospital.mriAvailable ? 1 : 0, unit: 'machine', status: 'optimal', prediction: 'Available next 2h' },
    { name: 'CT Scanner', category: 'imaging', total: 2, available: hospital.ctAvailable ? 1 : 0, unit: 'machines', status: 'optimal', prediction: '1 in use, 1 available' },
    { name: 'Ultrasound', category: 'imaging', total: 3, available: randomInt(0, 2), unit: 'machines', status: 'optimal', prediction: 'Available' },
    { name: 'X-Ray', category: 'imaging', total: 4, available: randomInt(1, 3), unit: 'machines', status: 'optimal', prediction: 'Available' },
    { name: 'Blood Bank', category: 'blood', total: 500, available: hospital.bloodBankUnits, unit: 'units', status: 'optimal', prediction: 'O-negative low — reorder' },
    { name: 'Pharmacy', category: 'supply', total: 100, available: hospital.pharmacyStock, unit: '% stock', status: 'optimal', prediction: 'Restock in 48h' },
    { name: 'Laboratory', category: 'facility', total: 30, available: 30 - hospital.labQueue, unit: 'slots', status: 'optimal', prediction: `${hospital.labQueue} in queue` },
    { name: 'Dialysis', category: 'facility', total: 12, available: hospital.dialysisSlots, unit: 'slots', status: 'optimal', prediction: '3 slots at 14:00' },
    { name: 'Oxygen Supply', category: 'supply', total: 100, available: hospital.oxygenLevel, unit: '% capacity', status: 'optimal', prediction: 'Resupply at 60%' },
    { name: 'Power Backup', category: 'facility', total: 100, available: hospital.powerBackup, unit: '% charge', status: 'optimal', prediction: 'Generator OK' },
  ];
  return resources.map((r) => {
    const occ = r.total > 0 ? ((r.total - r.available) / r.total) * 100 : 0;
    const status: Resource['status'] = r.available === 0 ? 'offline' : occ >= 95 ? 'critical' : occ >= 80 ? 'low' : occ >= 50 ? 'adequate' : 'optimal';
    const trend = Array.from({ length: 12 }, () => r.available + randomBetween(-r.total * 0.08, r.total * 0.08));
    const forecast = Array.from({ length: 6 }, (_, j) => Math.max(0, r.available + randomBetween(-r.total * 0.1, r.total * 0.05) - j * r.total * 0.02));
    return {
      ...r,
      status,
      id: uid('res'),
      hospitalId: hospital.id,
      trend: trend.map((v) => Math.max(0, Math.round(v))),
      forecast: forecast.map((v) => Math.max(0, Math.round(v))),
      lastUpdated: Date.now(),
    };
  });
}

const AI_RECS: Omit<AIRecommendation, 'id' | 'createdAt'>[] = [
  { type: 'overload', title: 'ICU Overload Predicted — MGH', description: 'ICU occupancy at MGH will exceed 95% within 90 minutes based on current admission rate and inbound ambulances.', confidence: 92, impact: 'critical', action: 'Redistribute 2 critical patients to MUH', actionable: true, hospitalId: 'hosp_1' },
  { type: 'resource', title: 'O-Negative Blood Shortage — MTC', description: 'O-negative blood bank at MTC below 15% threshold. 3 active trauma cases consuming supply.', confidence: 88, impact: 'high', action: 'Request transfer from MGH blood bank', actionable: true, hospitalId: 'hosp_2' },
  { type: 'doctor', title: 'Cardiologist Reassignment', description: 'Dr. Priya Sharma available at MGH while MCI reports 4 cardiac emergencies in queue.', confidence: 85, impact: 'high', action: 'Redirect Dr. Sharma to MCI', actionable: true },
  { type: 'ambulance', title: 'Ambulance Demand Surge — Central', description: 'Predicted 40% increase in ambulance demand in Central Region between 14:00-17:00.', confidence: 79, impact: 'medium', action: 'Pre-position 3 ALS units', actionable: true },
  { type: 'waittime', title: 'ER Wait Time Optimization — MEH', description: 'ER wait time at MEH averaging 52 minutes. AI suggests opening 2 additional triage bays.', confidence: 81, impact: 'medium', action: 'Activate triage bay 3 & 4', actionable: true, hospitalId: 'hosp_6' },
  { type: 'transfer', title: 'Optimal Transfer Route', description: 'Patient TRF-501 can reach MUH 8 minutes faster via Route B avoiding traffic on Highway NH-48.', confidence: 94, impact: 'high', action: 'Reroute ambulance A-203', actionable: true },
  { type: 'optimization', title: 'Resource Balancing — Network', description: '3 hospitals reporting ventilator strain while 2 have surplus. AI recommends load balancing.', confidence: 87, impact: 'high', action: 'View balancing plan', actionable: true },
  { type: 'icu', title: 'ICU Bed Forecast — MRM', description: 'MRM ICU will have 0 available beds in 2h. Nearest capacity: MUH (4 beds), MGH (2 beds).', confidence: 90, impact: 'critical', action: 'Initiate proactive transfer', actionable: true, hospitalId: 'hosp_5' },
];

export function createAIRecommendations(): AIRecommendation[] {
  return AI_RECS.map((r) => ({ ...r, id: uid('rec'), createdAt: Date.now() - randomInt(30, 1800) * 1000 }));
}

const ACTIVITY_TEMPLATES: { type: ActivityItem['type']; message: string; detail?: string; severity?: ActivityItem['severity'] }[] = [
  { type: 'emergency', message: 'New emergency case — Level 1', detail: 'MVA reported on Highway NH-48', severity: 'critical' },
  { type: 'transfer', message: 'Transfer completed — TRF-501', detail: 'Patient arrived at MUH ICU', severity: 'success' },
  { type: 'admission', message: 'ICU admission — MGH', detail: 'Bed 14 occupied, 2 remaining', severity: 'info' },
  { type: 'discharge', message: 'Patient discharged — MCH', detail: 'Pediatric ward, bed freed', severity: 'success' },
  { type: 'resource', message: 'Ventilator maintenance — MTC', detail: 'Unit V-12 offline for 2h', severity: 'warning' },
  { type: 'staff', message: 'Doctor status change — Dr. Sharma', detail: 'Available → In Surgery', severity: 'info' },
  { type: 'ai', message: 'AI recommendation generated', detail: 'ICU overload prediction for MGH', severity: 'info' },
  { type: 'alert', message: 'Oxygen supply below threshold', detail: 'MEH at 58% capacity', severity: 'warning' },
  { type: 'system', message: 'System health check passed', detail: 'All nodes responding', severity: 'success' },
  { type: 'emergency', message: 'Ambulance dispatched — A-203', detail: 'En route to stroke case', severity: 'critical' },
];

export function createActivityFeed(count = 20): ActivityItem[] {
  return Array.from({ length: count }, (_, i) => {
    const t = pick(ACTIVITY_TEMPLATES);
    return {
      id: uid('act'),
      type: t.type,
      message: t.message,
      detail: t.detail,
      severity: t.severity,
      hospitalId: `hosp_${randomInt(1, 8)}`,
      timestamp: Date.now() - i * randomInt(20, 120) * 1000,
    };
  });
}

export function createAlerts(): AlertItem[] {
  return [
    { id: uid('alert'), severity: 'critical', title: 'ICU Capacity Critical', message: 'MGH ICU at 96% occupancy — 2 beds remaining', source: 'Resource Monitor', hospitalId: 'hosp_1', acknowledged: false, createdAt: Date.now() - 120000 },
    { id: uid('alert'), severity: 'critical', title: 'Level 1 Emergency Active', message: 'Cardiac arrest — CPR in progress, ETA 8 min', source: 'Emergency Dispatch', acknowledged: false, createdAt: Date.now() - 60000 },
    { id: uid('alert'), severity: 'warning', title: 'Blood Bank Low', message: 'MTC O-negative below 15% threshold', source: 'Blood Bank System', hospitalId: 'hosp_2', acknowledged: false, createdAt: Date.now() - 300000 },
    { id: uid('alert'), severity: 'warning', title: 'Ventilator Offline', message: 'MCI ventilator V-08 under maintenance', source: 'Equipment Monitor', hospitalId: 'hosp_4', acknowledged: true, createdAt: Date.now() - 600000 },
    { id: uid('alert'), severity: 'info', title: 'AI Forecast Updated', message: 'Ambulance demand surge predicted 14:00-17:00', source: 'AI Command Center', acknowledged: false, createdAt: Date.now() - 900000 },
    { id: uid('alert'), severity: 'success', title: 'Transfer Completed', message: 'TRF-501 patient arrived at MUH ICU', source: 'Transfer Center', acknowledged: true, createdAt: Date.now() - 1200000 },
  ];
}

export function createAuditLogs(count = 30): import('@/types').AuditLog[] {
  const actions = [
    { action: 'VIEW', resource: 'Hospital', details: 'Viewed MGH dashboard' },
    { action: 'UPDATE', resource: 'Resource', details: 'Updated ventilator count at MTC' },
    { action: 'CREATE', resource: 'Transfer', details: 'Created transfer TRF-503' },
    { action: 'APPROVE', resource: 'Transfer', details: 'Approved transfer to MUH' },
    { action: 'DISPATCH', resource: 'Ambulance', details: 'Dispatched A-203 to EMG-003' },
    { action: 'ACKNOWLEDGE', resource: 'Alert', details: 'Acknowledged ICU capacity alert' },
    { action: 'LOGIN', resource: 'Auth', details: 'User logged in' },
    { action: 'EXPORT', resource: 'Report', details: 'Exported analytics report' },
    { action: 'UPDATE', resource: 'Doctor', details: 'Updated Dr. Sharma status' },
    { action: 'CONFIG', resource: 'Settings', details: 'Updated notification preferences' },
  ];
  const names = ['Dr. Arjun Mehta', 'Dr. Priya Sharma', 'Admin Rajesh Kumar', 'Nurse Neha Gupta', 'Crew Sanjay Patel'];
  const roles = ['system_admin', 'hospital_admin', 'ambulance_crew'] as const;
  return Array.from({ length: count }, (_, i) => {
    const a = pick(actions);
    return {
      id: uid('log'),
      userId: `user_${randomInt(1, 5)}`,
      userName: pick(names),
      userRole: pick(roles as unknown as string[]) as import('@/types').UserRole,
      action: a.action,
      resource: a.resource,
      resourceId: uid('r'),
      details: a.details,
      ipAddress: `10.0.${randomInt(1, 50)}.${randomInt(1, 200)}`,
      timestamp: Date.now() - i * randomInt(60, 600) * 1000,
    };
  });
}
