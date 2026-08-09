import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import { SkeletonCard } from '@/components/ui/Skeleton';

// Lazy load Pages
const LandingPage = lazy(() => import('@/app/pages/LandingPage'));
const RoleSelectionPage = lazy(() => import('@/app/pages/RoleSelectionPage'));
const LoginPage = lazy(() => import('@/app/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/app/pages/DashboardPage'));
const HospitalsPage = lazy(() => import('@/app/pages/HospitalsPage'));
const DoctorsPage = lazy(() => import('@/app/pages/DoctorsPage'));
const DepartmentsPage = lazy(() => import('@/app/pages/DepartmentsPage'));
const ResourcesPage = lazy(() => import('@/app/pages/ResourcesPage'));
const AmbulancesPage = lazy(() => import('@/app/pages/AmbulancesPage'));
const AmbulanceCrewDashboard = lazy(() => import('@/app/pages/AmbulanceCrewDashboard'));
const EmergencyPage = lazy(() => import('@/app/pages/EmergencyPage'));
const TransfersPage = lazy(() => import('@/app/pages/TransfersPage'));
const AnalyticsPage = lazy(() => import('@/app/pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('@/app/pages/ReportsPage'));
const AIPage = lazy(() => import('@/app/pages/AIPage'));
const AuditPage = lazy(() => import('@/app/pages/AuditPage'));
const SettingsPage = lazy(() => import('@/app/pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-12 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

function ProtectedRoute({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/landing" replace />;
  }
  
  if (!roles.includes(user.role)) {
    if (user.role === 'ambulance_crew') {
      return <Navigate to="/ambulances" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Free Landing & SSO Flow */}
        <Route path="/landing" element={
          <Suspense fallback={<div className="h-screen bg-base-950 flex items-center justify-center"><PageLoader /></div>}>
            <LandingPage />
          </Suspense>
        } />
        <Route path="/roles" element={
          <Suspense fallback={<div className="h-screen bg-base-950 flex items-center justify-center"><PageLoader /></div>}>
            <RoleSelectionPage />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<div className="h-screen bg-base-950 flex items-center justify-center"><PageLoader /></div>}>
            <LoginPage />
          </Suspense>
        } />

        {/* Protected Application Workspace */}
        <Route element={<AppLayout />}>
          
          <Route path="/" element={
            !isAuthenticated ? <Navigate to="/landing" replace /> :
            user?.role === 'ambulance_crew' ? <Navigate to="/ambulances" replace /> :
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/hospitals" element={
            <ProtectedRoute roles={['system_admin']}>
              <Suspense fallback={<PageLoader />}><HospitalsPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/doctors" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><DoctorsPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/departments" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><DepartmentsPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/resources" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><ResourcesPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/ambulances" element={
            <ProtectedRoute roles={['system_admin', 'ambulance_crew']}>
              <Suspense fallback={<PageLoader />}>
                {user?.role === 'ambulance_crew' ? <AmbulanceCrewDashboard /> : <AmbulancesPage />}
              </Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/emergency" element={
            <ProtectedRoute roles={['system_admin']}>
              <Suspense fallback={<PageLoader />}><EmergencyPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/transfers" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><TransfersPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/ai" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin']}>
              <Suspense fallback={<PageLoader />}><AIPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/audit" element={
            <ProtectedRoute roles={['system_admin']}>
              <Suspense fallback={<PageLoader />}><AuditPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute roles={['system_admin', 'hospital_admin', 'ambulance_crew']}>
              <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
