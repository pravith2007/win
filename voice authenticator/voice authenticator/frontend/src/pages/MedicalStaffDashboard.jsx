import React, { useState, useEffect } from 'react';
import { LogOut, Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '../api/client';

const MedicalStaffDashboard = () => {
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/medical-staff/dashboard');
        setStaffData(response.data);
      } catch (err) {
        setMessage('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/medical-staff/logout');
      window.location.href = '/select-role';
    } catch (err) {
      setMessage('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Medical Staff Dashboard</h1>
            <p className="opacity-90">
              Welcome, {staffData?.name} • {staffData?.department} Department
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {message && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle size={20} />
            {message}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Patients Today */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Patients Today</p>
                <p className="text-4xl font-bold text-indigo-600 mt-2">{staffData?.patients_today || 0}</p>
              </div>
              <Users className="text-indigo-600 opacity-30" size={40} />
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Appointments</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{staffData?.appointments || 0}</p>
              </div>
              <Calendar className="text-green-600 opacity-30" size={40} />
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending Tasks</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{staffData?.pending_tasks || 0}</p>
              </div>
              <Clock className="text-orange-600 opacity-30" size={40} />
            </div>
          </div>
        </div>

        {/* Staff Information Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Full Name</p>
              <p className="text-gray-800 font-semibold mt-1">{staffData?.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Email</p>
              <p className="text-gray-800 font-semibold mt-1">{staffData?.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Department</p>
              <p className="text-gray-800 font-semibold mt-1">{staffData?.department}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">License Number</p>
              <p className="text-gray-800 font-semibold mt-1">{staffData?.license_number}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              View Patient Records
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Add Patient Notes
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Schedule Appointments
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Generate Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalStaffDashboard;
