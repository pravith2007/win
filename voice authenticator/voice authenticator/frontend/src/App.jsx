import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'; // Indha line dhaan login-ukku mukkiyam
import RoleSelection from './pages/RoleSelection';
import AdminBiometric from './pages/AdminBiometric';
import TwoFactorAuth from './pages/TwoFactorAuth';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './components/PatientDashboard';
import MedicalStaffSignup from './pages/MedicalStaffSignup';
import MedicalStaffLogin from './pages/MedicalStaffLogin';
import MedicalStaffDashboard from './pages/MedicalStaffDashboard';

function App() {
  return (
    <Routes>
      {/* Starting point: Login Page */}
      <Route path="/" element={<Login />} />
      
      {/* Other Pages */}
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/admin-biometric" element={<AdminBiometric />} />
      <Route path="/setup-2fa" element={<TwoFactorAuth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      
      {/* Medical Staff Routes */}
      <Route path="/medical-staff-signup" element={<MedicalStaffSignup />} />
      <Route path="/medical-staff-login" element={<MedicalStaffLogin />} />
      <Route path="/medical-staff-dashboard" element={<MedicalStaffDashboard />} />

      {/* Redirect unknown URLs to Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; // Idhu orey oru thadava dhaan irukkanum