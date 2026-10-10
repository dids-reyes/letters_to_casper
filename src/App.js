import React, { lazy, Suspense } from 'react';
import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import {AuthProvider} from './AuthContext';
import {CrisisSupportProvider, useCrisisSupport} from './context/CrisisSupportContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/App.css';

const Sky = lazy(() => import('./components/sky/Sky'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./components/TermsConditions'));
const DeveloperPortal = lazy(() => import('./components/DeveloperPortal'));
const AboutUs = lazy(() => import('./components/AboutUs'));
const Admin = lazy(() => import('./components/Admin'));
const AdminPortal = lazy(() => import('./components/AdminPortal'));
const SeekHelp = lazy(() => import('./components/SeekHelp'));
const StatusPage = lazy(() => import('./components/StatusPage'));
const MentalHealthTest = lazy(() => import('./components/MentalHealthTest'));
const CrisisSupportDialog = lazy(() => import('./components/CrisisSupportDialog'));

function DeferredCrisisSupportDialog() {
  const { isCrisisModalOpen } = useCrisisSupport();
  if (!isCrisisModalOpen) return null;
  return (
    <Suspense fallback={null}>
      <CrisisSupportDialog />
    </Suspense>
  );
}

function App() {
  return (
    <div className="container-fluid d-flex justify-content-center app-container">
      <AuthProvider>
        <CrisisSupportProvider>
          <DeferredCrisisSupportDialog />
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/sky" element={<Suspense fallback={<div role="status">Opening Sky…</div>}><Sky /></Suspense>} />
                <Route path="/" element={<Home />} />
                <Route path="/letters/:messageId" element={<Home />} />
                <Route path="/letter/:messageId" element={<Home />} />
                <Route path="/privacy_policy" element={<PrivacyPolicy />} />
                <Route
                  path="/terms_and_conditions"
                  element={<TermsAndConditions />}
                />
                <Route path="/developer_portal" element={<DeveloperPortal />} />
                <Route path="/about_us" element={<AboutUs />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin_portal" element={<AdminPortal />} />
                <Route path="/seek_help" element={<SeekHelp />} />
                <Route path="/status" element={<StatusPage />} />
                <Route path="/mental_health_test" element={<MentalHealthTest />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </CrisisSupportProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
