import React, { useState } from 'react';
import { Edit2, Save, X, User, Mail, Phone, Calendar, Droplet, MapPin } from 'lucide-react';
import api from '../../api/client';

const ProfileSection = ({ patientData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(patientData || {});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.post('/patient/update-profile', formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Patient Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            isEditing
              ? 'bg-gray-300 text-gray-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isEditing ? <X size={18} /> : <Edit2 size={18} />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Avatar */}
        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-80">
          <div className="bg-indigo-600 rounded-full p-6 mb-4">
            <User className="text-white" size={64} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{formData.name}</h3>
          <p className="text-gray-600 text-lg">{formData.id}</p>
          <p className="text-sm text-gray-500 mt-2">Patient ID: {formData.id}</p>
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              ) : (
                <p className="px-4 py-2 text-gray-700">{formData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              ) : (
                <p className="px-4 py-2 text-gray-700">{formData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} /> Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              ) : (
                <p className="px-4 py-2 text-gray-700">{formData.phone}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} /> Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              ) : (
                <p className="px-4 py-2 text-gray-700">{formData.age} years</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              ) : (
                <p className="px-4 py-2 text-gray-700">{formData.gender}</p>
              )}
            </div>

            {/* Blood Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Droplet size={16} /> Blood Type
              </label>
              {isEditing ? (
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              ) : (
                <p className="px-4 py-2 text-gray-700">{formData.blood_type}</p>
              )}
            </div>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
