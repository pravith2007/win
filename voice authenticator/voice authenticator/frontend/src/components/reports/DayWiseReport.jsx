import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Download, Filter } from 'lucide-react';
import api from '../../api/client';

const DayWiseReport = ({ patientId }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(false);

  const chartData = [
    { date: 'Mon', activity: 65, health: 78, medication: 85 },
    { date: 'Tue', activity: 59, health: 82, medication: 90 },
    { date: 'Wed', activity: 80, health: 75, medication: 85 },
    { date: 'Thu', activity: 81, health: 88, medication: 92 },
    { date: 'Fri', activity: 56, health: 85, medication: 88 },
    { date: 'Sat', activity: 55, health: 80, medication: 80 },
    { date: 'Sun', activity: 40, health: 72, medication: 85 },
  ];

  const detailedReports = [
    {
      id: 1,
      date: '2026-01-28',
      day: 'Monday',
      steps: 8234,
      water: 2.5,
      calories: 2100,
      sleep: 7.5,
      mood: 'Good',
      notes: 'Feeling energetic after morning jog'
    },
    {
      id: 2,
      date: '2026-01-29',
      day: 'Tuesday',
      steps: 7891,
      water: 2.2,
      calories: 1950,
      sleep: 7.0,
      mood: 'Excellent',
      notes: 'Great day at work, completed all tasks'
    },
    {
      id: 3,
      date: '2026-01-30',
      day: 'Wednesday',
      steps: 9234,
      water: 3.0,
      calories: 2200,
      sleep: 7.8,
      mood: 'Good',
      notes: 'Attended gym session in evening'
    },
  ];

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patient/reports/${patientId}?period=${selectedPeriod}`);
      setReports(res.data.reports || detailedReports);
      setFilteredReports(res.data.reports || detailedReports);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setReports(detailedReports);
      setFilteredReports(detailedReports);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const csv = [
      ['Date', 'Steps', 'Water (L)', 'Calories', 'Sleep (hours)', 'Mood', 'Notes'],
      ...filteredReports.map(r => [
        r.date,
        r.steps,
        r.water,
        r.calories,
        r.sleep,
        r.mood,
        r.notes
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getMoodColor = (mood) => {
    const colors = {
      'Excellent': 'text-green-600 bg-green-50',
      'Good': 'text-blue-600 bg-blue-50',
      'Fair': 'text-yellow-600 bg-yellow-50',
      'Poor': 'text-red-600 bg-red-50'
    };
    return colors[mood] || colors.Fair;
  };

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Day-wise Health Report</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Download size={18} /> Download
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Activity & Health Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activity" fill="#8b5cf6" name="Activity %" />
              <Bar dataKey="health" fill="#10b981" name="Health %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Medication Adherence */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Medication Adherence</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="medication" stroke="#f59e0b" strokeWidth={2} name="Adherence %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Daily Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Steps</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Water (L)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Calories</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sleep (hrs)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mood</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Loading reports...
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-indigo-600" />
                        {report.date}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{report.steps.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{report.water} L</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{report.calories} kcal</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{report.sleep} hrs</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMoodColor(report.mood)}`}>
                        {report.mood}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{report.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <p className="text-sm text-gray-600 font-semibold mb-2">Avg Daily Steps</p>
          <p className="text-3xl font-bold text-blue-600">8,120</p>
          <p className="text-xs text-gray-600 mt-2">↑ 12% from last week</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <p className="text-sm text-gray-600 font-semibold mb-2">Avg Sleep</p>
          <p className="text-3xl font-bold text-green-600">7.4 hrs</p>
          <p className="text-xs text-gray-600 mt-2">↑ 0.2 hours</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <p className="text-sm text-gray-600 font-semibold mb-2">Avg Water Intake</p>
          <p className="text-3xl font-bold text-orange-600">2.7 L</p>
          <p className="text-xs text-gray-600 mt-2">Excellent hydration</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <p className="text-sm text-gray-600 font-semibold mb-2">Medication Adherence</p>
          <p className="text-3xl font-bold text-purple-600">87%</p>
          <p className="text-xs text-gray-600 mt-2">↑ 5% improvement</p>
        </div>
      </div>
    </div>
  );
};

export default DayWiseReport;
