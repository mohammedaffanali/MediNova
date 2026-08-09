import { useState, useEffect, useRef } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PageHeader } from '@/components/ui/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SmartTable, type Column } from '@/components/ui/SmartTable';
import NetworkMap from '@/components/ui/NetworkMap';
import {
  Ambulance, Siren, Heart, Wind, Thermometer, Activity, Navigation, MapPin, CheckCircle2,
  AlertCircle, ShieldAlert, Zap, User, Clock, Phone, ArrowRight, Save, Send, Eye, LogOut
} from 'lucide-react';
import type { EmergencyCase, Hospital, Ambulance as AmbType } from '@/types';
import { cn, timeAgo } from '@/utils';

export default function AmbulanceCrewDashboard() {
  const { user, logout } = useAuthStore();
  const { pushToast } = useUIStore();
  const { emergencies, ambulances, hospitals, resolveEmergency, dispatchAmbulance } = useRealtimeData();

  // Find this crew's ambulance (A-101, which is amb_1)
  const myAmbulance = ambulances.find((a) => a.hospitalId === user?.hospitalId) || ambulances[0];

  // Find case assigned to this ambulance
  const assignedCase = emergencies.find(
    (e) => e.ambulanceId === myAmbulance.id && e.status !== 'resolved'
  );

  // If no case assigned, find any unassigned active emergency case to accept
  const unassignedCase = emergencies.find((e) => e.status === 'active' && !e.ambulanceId);

  // Vitals inputs states (initialized from assignedCase or default)
  const [heartRate, setHeartRate] = useState(80);
  const [spo2, setSpo2] = useState(96);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [temperature, setTemperature] = useState(98.6);
  const [riskScore, setRiskScore] = useState(35);
  const [savingVitals, setSavingVitals] = useState(false);
  const [admissionStatus, setAdmissionStatus] = useState<'idle' | 'requesting' | 'reserved'>('idle');
  const [selectedHospitalForAdmission, setSelectedHospitalForAdmission] = useState<string | null>(null);

  // For drawing routing polyline on the map
  const [mapDestinationHospital, setMapDestinationHospital] = useState<Hospital | null>(null);

  // Sync state with assigned case when it changes
  useEffect(() => {
    if (assignedCase?.vitals) {
      setHeartRate(assignedCase.vitals.heartRate);
      setSpo2(assignedCase.vitals.spo2);
      setBloodPressure(assignedCase.vitals.bloodPressure);
      setTemperature(assignedCase.vitals.temperature);
      setRiskScore(assignedCase.vitals.riskScore);
    }
  }, [assignedCase]);

  // Live Risk Score Recalculator based on vitals
  useEffect(() => {
    let score = 20;
    if (heartRate > 100 || heartRate < 60) score += 20;
    if (spo2 < 95) score += 25;
    if (spo2 < 90) score += 20;
    const tempF = parseFloat(temperature.toString());
    if (tempF > 100.4 || tempF < 96) score += 15;
    
    // BP check
    try {
      const sys = parseInt(bloodPressure.split('/')[0]);
      if (sys > 140 || sys < 90) score += 15;
    } catch(e) {}

    setRiskScore(Math.min(99, Math.max(5, score)));
  }, [heartRate, spo2, bloodPressure, temperature]);

  const handleAcceptDispatch = (caseId: string) => {
    dispatchAmbulance(caseId, myAmbulance.id);
    pushToast('Dispatch Accepted', `En route to emergency case location.`, 'success');
  };

  const handleSaveVitals = () => {
    setSavingVitals(true);
    setTimeout(() => {
      setSavingVitals(false);
      pushToast('Telemetry Synced', 'Patient vitals successfully broadcasted to receiving hospital network.', 'success');
    }, 800);
  };

  const handleRequestAdmission = (hosp: Hospital) => {
    setSelectedHospitalForAdmission(hosp.id);
    setAdmissionStatus('requesting');
    
    setTimeout(() => {
      setAdmissionStatus('reserved');
      setMapDestinationHospital(hosp);
      pushToast(
        'Admission Confirmed',
        `ICU bed reserved at ${hosp.name}. Hospital emergency department notified.`,
        'success'
      );
    }, 1500);
  };

  const handleArriveAtHospital = () => {
    if (assignedCase) {
      resolveEmergency(assignedCase.id);
      setAdmissionStatus('idle');
      setSelectedHospitalForAdmission(null);
      setMapDestinationHospital(null);
      pushToast('Case Resolved', 'Patient safely admitted. Ambulance returning to base.', 'success');
    }
  };

  // AI Hospital Recommendations Logic (ranks top 3 hospitals based on scores)
  const recommendedHospitals = hospitals
    .map((h) => {
      let score = 95;
      
      // ICU bed constraint
      if (h.icuAvailable === 0) score -= 35;
      else if (h.icuAvailable < 3) score -= 10;
      
      // Specialist constraint (Cardiac Case -> Cardiologist availability check)
      const isCardiac = assignedCase?.complaint.toLowerCase().includes('cardiac') || assignedCase?.complaint.toLowerCase().includes('chest pain');
      if (isCardiac) {
        const hasCardiologist = h.healthScore > 65; // Mock: higher healthScore hospitals have cardiologist available
        if (!hasCardiologist) score -= 25;
      }
      
      // Queue & wait times
      if (h.emergencyQueue > 12) score -= 15;
      if (h.avgWaitTime > 40) score -= 10;
      
      // Distance factor (approximate Euclidean distance mapped to 0-20 score)
      const dist = Math.sqrt(Math.pow(h.lat - myAmbulance.lat, 2) + Math.pow(h.lng - myAmbulance.lng, 2)) * 100;
      score -= Math.min(20, Math.round(dist * 2));
      
      return {
        hospital: h,
        score: Math.max(10, Math.min(99, score)),
        distance: (dist / 10).toFixed(1),
        eta: Math.round(dist * 1.5 + (h.avgWaitTime * 0.1)),
        traffic: dist > 1.5 ? 'Medium' : 'Low',
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Render SVG Heartbeat Animation based on current Heart Rate
  const HeartbeatSVG = () => {
    const pulseDuration = heartRate > 100 ? '0.6s' : heartRate < 60 ? '1.5s' : '1s';
    return (
      <svg className="w-16 h-10 text-critical-400" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,15 H35 L40,5 L45,25 L50,15 L53,10 L56,17 L60,15 H100"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[shimmer_2s_linear_infinite]"
          style={{
            strokeDasharray: '200',
            strokeDashoffset: '0',
            animation: `pulse ${pulseDuration} linear infinite`,
          }}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ambulance Dispatch Command"
        subtitle={`Vehicle ${myAmbulance.code} · ${myAmbulance.type} Unit · Active Dispatch`}
        icon={<Ambulance className="h-6 w-6 text-warning-400" />}
        badge={
          assignedCase ? (
            <StatusBadge variant="warning" dot pulse>
              En Route (ETA {assignedCase.eta || 8}m)
            </StatusBadge>
          ) : (
            <StatusBadge variant="success" dot>
              Awaiting Case
            </StatusBadge>
          )
        }
        actions={
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg bg-critical-500/10 hover:bg-critical-500/20 text-critical-400 border border-critical-500/30 px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer font-sans"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        }
      />

      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Vehicle Status" value={myAmbulance.status.replace('_', ' ').toUpperCase()} icon={<Ambulance className="h-5 w-5" />} accent={myAmbulance.status === 'offline' ? 'danger' : 'success'} live />
        <MetricCard label="Remaining Fuel" value={Math.round(myAmbulance.fuel)} unit="%" icon={<Zap className="h-5 w-5" />} accent={myAmbulance.fuel < 25 ? 'danger' : 'brand'} />
        <MetricCard label="Simulated Speed" value={myAmbulance.speed} unit="km/h" icon={<Navigation className="h-5 w-5" />} accent="accent" live />
        <MetricCard label="Assigned Base" value="MGH Network" icon={<MapPin className="h-5 w-5" />} accent="brand" />
      </div>

      {/* Main Grid: Telemetry & Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Case Details & Telemetry Form */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Active Case Summary Card */}
          <div className="glass p-5 border-l-4 border-warning-500/50">
            <SectionHeader
              title={assignedCase ? `Active Case: ${assignedCase.code}` : 'No Active Cases'}
              subtitle={assignedCase ? `Reported: ${timeAgo(assignedCase.createdAt)}` : 'Ambulance is available for dispatch'}
              icon={<Siren className="h-5 w-5 text-critical-400" />}
              action={assignedCase && <StatusBadge variant="critical" size="sm">LEVEL {assignedCase.severity.replace('level', '')}</StatusBadge>}
            />
            
            {assignedCase ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-base-850/60 p-3">
                    <p className="text-[10px] text-ink-400 uppercase font-semibold">Patient Information</p>
                    <p className="text-sm font-bold text-ink-100 mt-1">{assignedCase.patientName}</p>
                    <p className="text-xs text-ink-300">{assignedCase.patientAge} Year Old · {assignedCase.patientGender === 'M' ? 'Male' : 'Female'}</p>
                  </div>
                  <div className="rounded-lg bg-base-850/60 p-3">
                    <p className="text-[10px] text-ink-400 uppercase font-semibold">Dispatch Address</p>
                    <p className="text-sm font-bold text-ink-100 truncate mt-1">{assignedCase.location}</p>
                    <p className="text-xs text-ink-300">Region: Central Hub</p>
                  </div>
                </div>

                <div className="rounded-lg bg-base-850/60 p-3">
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">Chief Complaint</p>
                  <p className="text-xs font-semibold text-warning-400 mt-1 leading-relaxed">{assignedCase.complaint}</p>
                </div>
              </div>
            ) : unassignedCase ? (
              <div className="mt-4 p-4 rounded-lg bg-brand-500/5 border border-brand-500/10 text-center">
                <ShieldAlert className="h-8 w-8 text-brand-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-sm font-bold text-ink-100">Emergency Dispatch Request</h4>
                <p className="text-xs text-ink-400 mt-1 mb-4 leading-relaxed">
                  Incoming case {unassignedCase.code} in queue: {unassignedCase.complaint} at {unassignedCase.location}.
                </p>
                <button
                  onClick={() => handleAcceptDispatch(unassignedCase.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-400 py-2 text-xs font-semibold text-base-950 transition-colors cursor-pointer"
                >
                  Accept Dispatch Case
                </button>
              </div>
            ) : (
              <div className="mt-4 p-6 text-center text-xs text-ink-400">
                Awaiting emergency calls. Fleet position optimized.
              </div>
            )}
          </div>

          {/* Vitals Telemetry Entry Module */}
          {assignedCase && (
            <div className="glass p-5">
              <div className="flex items-center justify-between border-b border-base-700/40 pb-3 mb-4">
                <SectionHeader title="Patient Telemetry Feed" subtitle="Capture patient vital signs in transit" icon={<Activity className="h-4 w-4 text-brand-300" />} />
                <HeartbeatSVG />
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* Heart Rate */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-ink-400 uppercase font-semibold flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-critical-400" /> Heart Rate (BPM)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={40}
                      max={180}
                      value={heartRate}
                      onChange={(e) => setHeartRate(parseInt(e.target.value))}
                      className="flex-1 accent-critical-500"
                    />
                    <span className="text-sm font-bold font-mono text-ink-100 w-8 text-right">{heartRate}</span>
                  </div>
                </div>

                {/* SpO2 */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-ink-400 uppercase font-semibold flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-brand-300" /> Oxygen (SpO2 %)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={70}
                      max={100}
                      value={spo2}
                      onChange={(e) => setSpo2(parseInt(e.target.value))}
                      className="flex-1 accent-brand-500"
                    />
                    <span className="text-sm font-bold font-mono text-ink-100 w-8 text-right">{spo2}%</span>
                  </div>
                </div>

                {/* Blood Pressure */}
                <div>
                  <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1.5 block">Blood Pressure (SYS/DIA)</label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="120/80"
                    className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-1.5 text-xs text-ink-100 focus:outline-none focus:border-brand-500/40"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="text-[10px] text-ink-400 uppercase font-semibold mb-1.5 block">Temperature (°F)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    placeholder="98.6"
                    className="w-full rounded-lg bg-base-850/60 border border-base-700/50 px-3 py-1.5 text-xs text-ink-100 focus:outline-none focus:border-brand-500/40"
                  />
                </div>

              </div>

              {/* Dynamic Risk Score */}
              <div className="mt-5 rounded-lg bg-base-850/40 border border-base-700/40 p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ink-100">AI Patient Risk Index</h4>
                  <p className="text-[10px] text-ink-400 mt-0.5">Calculated in real time via telemetry vector</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-lg font-bold font-mono px-3 py-1 rounded border',
                    riskScore > 75 
                      ? 'bg-critical-500/10 text-critical-400 border-critical-500/20' 
                      : riskScore > 45 
                        ? 'bg-warning-500/10 text-warning-400 border-warning-500/20' 
                        : 'bg-success-500/10 text-success-400 border-success-500/20'
                  )}>
                    {riskScore} / 100
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleSaveVitals}
                  disabled={savingVitals}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-base-850 hover:bg-base-800 border border-base-750 px-4 py-2 text-xs font-semibold text-ink-200 transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5 text-brand-300" />
                  {savingVitals ? 'Syncing...' : 'Sync Telemetry'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: AI Hospital Recommendations & Live Map */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Google Maps / GPS Routing */}
          <div className="glass p-5">
            <SectionHeader
              title="GPS Operational Routing Map"
              subtitle={mapDestinationHospital ? `Destination: ${mapDestinationHospital.name}` : 'Awaiting emergency details'}
              icon={<Navigation className="h-4 w-4 text-accent-400" />}
              action={assignedCase && <StatusBadge variant="accent" dot pulse size="sm">Routing Active</StatusBadge>}
            />
            <div className="h-[240px] rounded-xl overflow-hidden border border-base-700/60 mt-4 relative">
              <NetworkMap
                center={[myAmbulance.lat, myAmbulance.lng]}
                zoom={13}
                routingFrom={[myAmbulance.lat, myAmbulance.lng]}
                routingTo={mapDestinationHospital ? [mapDestinationHospital.lat, mapDestinationHospital.lng] : undefined}
                interactive={false}
              />
            </div>
            {mapDestinationHospital && (
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-ink-300">
                  <Clock className="h-3.5 w-3.5 text-brand-300" />
                  <span>ETA: <strong className="text-ink-100">8 minutes</strong></span>
                  <span className="text-ink-500">·</span>
                  <span>Distance: <strong className="text-ink-100">6.2 km</strong></span>
                </div>
                <button
                  onClick={handleArriveAtHospital}
                  className="rounded-lg bg-success-500/20 text-success-300 border border-success-500/30 px-3 py-1.5 text-xs font-semibold hover:bg-success-500/30 transition-all cursor-pointer"
                >
                  Complete Handover / Admit
                </button>
              </div>
            )}
          </div>

          {/* AI Recommended Target Facilities */}
          {assignedCase && (
            <div className="glass p-5">
              <SectionHeader
                title="AI Hospital Recommendations"
                subtitle="Weighted by distance, specialty availability, and occupancy"
                icon={<Zap className="h-4 w-4 text-brand-300" />}
                action={<StatusBadge variant="accent" dot size="sm">AI Ranked</StatusBadge>}
              />

              <div className="mt-4 space-y-3">
                {recommendedHospitals.map(({ hospital: hosp, score, distance, eta, traffic }) => {
                  const isReserved = selectedHospitalForAdmission === hosp.id && admissionStatus === 'reserved';
                  const isRequesting = selectedHospitalForAdmission === hosp.id && admissionStatus === 'requesting';
                  
                  return (
                    <div
                      key={hosp.id}
                      className={cn(
                        'glass-flat p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border transition-colors',
                        isReserved ? 'border-success-500/40 bg-success-500/5' : 'hover:border-base-600'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-ink-100 truncate">{hosp.name}</h4>
                          <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                            score >= 90
                              ? 'bg-success-500/10 text-success-400 border-success-500/20'
                              : 'bg-warning-500/10 text-warning-400 border-warning-500/20'
                          )}>
                            Score: {score}%
                          </span>
                        </div>
                        <p className="text-xs text-ink-400 mt-1 flex items-center gap-2 flex-wrap">
                          <span>Dist: <strong className="text-ink-200">{distance} km</strong></span>
                          <span className="text-ink-500">·</span>
                          <span>ETA: <strong className="text-ink-200">{eta} min</strong></span>
                          <span className="text-ink-500">·</span>
                          <span>Traffic: <strong className="text-warning-400">{traffic}</strong></span>
                        </p>
                        <p className="text-[10px] text-brand-300 mt-1">
                          {hosp.icuAvailable} ICU Available · Specialty Cardiologist Ready
                        </p>
                      </div>

                      <div className="shrink-0 w-full md:w-auto">
                        {isReserved ? (
                          <span className="flex items-center justify-center gap-1 text-xs font-semibold text-success-400 border border-success-500/20 bg-success-500/10 px-3 py-1.5 rounded-lg w-full">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Bed Reserved
                          </span>
                        ) : (
                          <button
                            disabled={admissionStatus !== 'idle'}
                            onClick={() => handleRequestAdmission(hosp)}
                            className="w-full rounded-lg bg-brand-500/15 text-brand-300 border border-brand-500/25 hover:bg-brand-500/25 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {isRequesting ? 'Reserving...' : 'Request Reservation'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
