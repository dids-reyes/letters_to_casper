import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsConditions';
import DeveloperPortal from './components/DeveloperPortal';
import AboutUs from './components/AboutUs';
import Admin from './components/Admin';
import AdminPortal from './components/AdminPortal';
import {AuthProvider} from './AuthContext';
import './App.css';

function App() {
  return (
    <div className="container-fluid d-flex justify-content-center app-container">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy_policy" element={<PrivacyPolicy />} />
          <Route
            path="/terms_and_conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/developer_portal" element={<DeveloperPortal />} />
          <Route path="/about_us" element={<AboutUs />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin_portal" element={<AdminPortal />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
