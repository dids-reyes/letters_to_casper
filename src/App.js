import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsConditions';
import AboutUs from './components/AboutUs';
import './App.css';

function App() {
  return (
    <div className="container-fluid d-flex justify-content-center app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy_policy" element={<PrivacyPolicy />} />
        <Route path="/terms_and_conditions" element={<TermsAndConditions />} />
        <Route path="/about_us" element={<AboutUs />} />
      </Routes>
    </div>
  );
}

export default App;
