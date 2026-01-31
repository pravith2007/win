import React, { useState, useEffect } from 'react';
import { User, Calendar, MessageCircle, TrendingUp, Heart, Activity, LogOut, Menu, X } from 'lucide-react';
import api from '../api/client';
import ProfileSection from './profile/ProfileSection';
import BMICalculator from './health/BMICalculator';
import AppointmentBooking from './appointment/AppointmentBooking';
import ChatBot from './chatbot/ChatBot';
import DayWiseReport from './reports/DayWiseReport';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [patientData, setPatientData] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patient/profile');
      setPatientData(res.data);
      
      const healthRes = await api.get('/patient/health-status');
      setHealthStatus(healthRes.data);
    } catch (err) {
      console.error("Failed to fetch patient data:", err);
      // Set mock data for demo
      setPatientData({
        name: 'John Doe',
        id: 'PAT-2026-001',
        email: 'john@kongu.edu',
        age: 32,
        gender: 'Male',
        blood_type: 'O+',
        phone: '+91-9876543210',
        joined_date: '2024-01-15'
      });
      setHealthStatus({
        current_status: 'Stable',
        blood_pressure: '120/80',
        heart_rate: 72,
        temperature: 98.6,
        last_checkup: '2026-01-28'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get('/logout');
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bmi', label: 'BMI Calculator', icon: TrendingUp },
    { id: 'appointment', label: 'Appointments', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: Heart },
    { id: 'chatbot', label: 'Chat Support', icon: MessageCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Patient Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Heart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">HealthCare Secure</h1>
              <p className="text-sm text-gray-600">Patient Dashboard</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{patientData?.name}</p>
              <p className="text-xs text-gray-600">{patientData?.id}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-gray-50 text-red-600"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Health Status</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{healthStatus?.current_status}</p>
                </div>
                <Heart className="text-red-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Last Checkup</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{healthStatus?.last_checkup}</p>
                </div>
                <Activity className="text-green-500" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 md:flex-none px-4 py-4 font-semibold transition flex items-center justify-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome, {patientData?.name}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Patient Information</h3>
              <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>ID:</strong> {patientData?.id}</p>
                    <p><strong>Age:</strong> {patientData?.age} years</p>
                    <p><strong>Gender:</strong> {patientData?.gender}</p>
                    <p><strong>Blood Type:</strong> {patientData?.blood_type}</p>
                    <p><strong>Member Since:</strong> {patientData?.joined_date}</p>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Email:</strong> {patientData?.email}</p>
                    <p><strong>Phone:</strong> {patientData?.phone}</p>
                    <p><strong>Last Checkup:</strong> {healthStatus?.last_checkup}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && <ProfileSection patientData={patientData} />}
          {activeTab === 'bmi' && <BMICalculator />}
          {activeTab === 'appointment' && <AppointmentBooking patientId={patientData?.id} />}
          {activeTab === 'reports' && <DayWiseReport patientId={patientData?.id} />}
          {activeTab === 'chatbot' && <ChatBot />}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
