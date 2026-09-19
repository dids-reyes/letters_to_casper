import React, { lazy, Suspense } from 'react';
import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsConditions';
import DeveloperPortal from './components/DeveloperPortal';
import AboutUs from './components/AboutUs';
import Admin from './components/Admin';
import AdminPortal from './components/AdminPortal';
import SeekHelp from './components/SeekHelp';
import StatusPage from './components/StatusPage';
import {AuthProvider} from './AuthContext';
import {CrisisSupportProvider} from './context/CrisisSupportContext';
import CrisisSupportDialog from './components/CrisisSupportDialog';
import './styles/App.css';

const Sky = lazy(() => import('./components/sky/Sky'));

function App() {
  return (
    <div className="container-fluid d-flex justify-content-center app-container">
      <AuthProvider>
        <CrisisSupportProvider>
          <CrisisSupportDialog />
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
          </Routes>
        </CrisisSupportProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
