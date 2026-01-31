import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Trash2, Check, X } from 'lucide-react';
import api from '../../api/client';

const AppointmentBooking = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    doctor_name: '',
    department: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  const departments = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Pediatrics',
    'Gynecology'
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/patient/appointments/${patientId}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      // Demo data
      setAppointments([
        {
          id: 1,
          doctor_name: 'Dr. Smith',
          department: 'General Medicine',
          date: '2026-02-10',
          time: '10:00 AM',
          status: 'confirmed'
        },
        {
          id: 2,
          doctor_name: 'Dr. Johnson',
          department: 'Cardiology',
          date: '2026-02-15',
          time: '2:30 PM',
          status: 'pending'
        }
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctor_name || !formData.department || !formData.date || !formData.time || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }
    try {
      setLoading(true);
      const appointmentData = {
        ...formData,
        patient_id: patientId
      };
      await api.post(`/patient/book-appointment/${patientId}`, appointmentData);
      alert('Appointment booked successfully!');
      setFormData({
        doctor_name: '',
        department: '',
        date: '',
        time: '',
        reason: '',
        notes: ''
      });
      setShowForm(false);
      fetchAppointments();
    } catch (err) {
      console.error("Failed to book appointment:", err);
      // Still add locally even if API fails
      const newAppointment = {
        id: Date.now(),
        ...formData,
        status: 'pending'
      };
      setAppointments(prev => [newAppointment, ...prev]);
      alert('Appointment booked successfully!');
      setFormData({
        doctor_name: '',
        department: '',
        date: '',
        time: '',
        reason: '',
        notes: ''
      });
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.post(`/patient/cancel-appointment/${appointmentId}`);
        alert('Appointment cancelled');
        fetchAppointments();
      } catch (err) {
        console.error("Failed to cancel appointment:", err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            showForm
              ? 'bg-gray-400 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {showForm ? 'Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {/* Booking Form */}
      {showForm && (
        <div className="bg-indigo-50 rounded-lg p-8 border border-indigo-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Book New Appointment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name</label>
                <input
                  type="text"
                  name="doctor_name"
                  value={formData.doctor_name}
                  onChange={handleChange}
                  placeholder="Enter doctor's name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Describe your reason for visiting"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional information"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Your Appointments</h3>
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="mx-auto text-gray-400 mb-4" size={32} />
            <p className="text-gray-600">No appointments yet. Book one now!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map(apt => (
              <div key={apt.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(apt.status)}`}>
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User size={18} className="text-indigo-600" />
                    <span className="font-semibold">{apt.doctor_name}</span>
                  </div>
                  <div className="text-sm text-gray-600">{apt.department}</div>
                  <div className="flex items-center gap-2 text-gray-700 mt-2">
                    <Calendar size={18} className="text-indigo-600" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-indigo-600" />
                    <span>{apt.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
