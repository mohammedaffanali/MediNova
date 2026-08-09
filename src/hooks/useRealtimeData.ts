import { useDataStore } from '@/store/dataStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import type { Hospital, Doctor, Ambulance, EmergencyCase, Transfer, Resource, Department } from '@/types';
import { createDepartments, createResources } from '@/mock/data';
import { useMemo } from 'react';

export function useRealtimeData() {
  const data = useDataStore();
  const { selectedHospitalId } = useUIStore();
  const user = useAuthStore((s) => s.user);

  const scopedHospitals: Hospital[] = useMemo(() => {
    if (user?.role === 'hospital_admin' && user.hospitalId) {
      return data.hospitals.filter((h) => h.id === user.hospitalId);
    }
    if (selectedHospitalId) {
      return data.hospitals.filter((h) => h.id === selectedHospitalId);
    }
    return data.hospitals;
  }, [data.hospitals, user, selectedHospitalId]);

  const scopedDoctors: Doctor[] = useMemo(() => {
    if (user?.role === 'hospital_admin' && user.hospitalId) {
      return data.doctors.filter((d) => d.hospitalId === user.hospitalId);
    }
    if (selectedHospitalId) {
      return data.doctors.filter((d) => d.hospitalId === selectedHospitalId);
    }
    return data.doctors;
  }, [data.doctors, user, selectedHospitalId]);

  const scopedAmbulances: Ambulance[] = useMemo(() => {
    if (user?.role === 'ambulance_crew' && user.hospitalId) {
      return data.ambulances.filter((a) => a.hospitalId === user.hospitalId);
    }
    if (selectedHospitalId) {
      return data.ambulances.filter((a) => a.hospitalId === selectedHospitalId);
    }
    return data.ambulances;
  }, [data.ambulances, user, selectedHospitalId]);

  const departments: Department[] = useMemo(() => {
    const target = scopedHospitals[0];
    return target ? createDepartments(target) : [];
  }, [scopedHospitals]);

  const resources: Resource[] = useMemo(() => {
    const target = scopedHospitals[0];
    return target ? createResources(target) : [];
  }, [scopedHospitals]);

  return {
    ...data,
    scopedHospitals,
    scopedDoctors,
    scopedAmbulances,
    departments,
    resources,
    isNetworkView: !selectedHospitalId && user?.role === 'system_admin',
  };
}
