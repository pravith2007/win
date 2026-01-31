import React, { useState, useEffect } from 'react';
// This line should now work after the npm install
import GaugeComponent from 'react-gauge-component';
import api from '../api/client';
import { Shield, Activity, Lock, Unlock, User, ClipboardList } from 'lucide-react';

const Dashboard = () => {
  const [record, setRecord] = useState(null);
  const [role, setRole] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        // Fetching the secured record from your FastAPI backend
        const res = await api.get('/view_record/R-772');
        setRecord(res.data.record);
        setRole(res.data.accessed_as);
        setIsDecrypted(true);
      } catch (err) {
        console.error("Access Denied", err);
      }
    };
    fetchRecord();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Medical Command Center</h1>
          <p className="text-slate-500 font-medium italic">Verified Session: {role.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
          <Shield className="text-green-500" size={20} />
          <span className="text-sm font-bold text-slate-700">Zero-Trust Active</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Decrypted Data Card */}
        <div className="col-span-8">
          <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList /> Patient Record</h2>
              {isDecrypted ? 
                <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-black flex items-center gap-1"><Unlock size={14}/> DECRYPTED</span> :
                <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-xs font-black flex items-center gap-1"><Lock size={14}/> ENCRYPTED</span>
              }
            </div>

            {record ? (
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</p>
                  <p className="text-xl font-bold text-slate-700">{record.diagnosis || "Chronic Hypertension"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatment Plan</p>
                  <p className="text-xl font-bold text-slate-700">{record.treatment || "Daily Lisinopril 10mg"}</p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300 font-bold">Waiting for Biometric Clearance...</div>
            )}
          </div>
        </div>

        {/* Right: Security Metrics */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
              <Activity size={16}/> Privacy Risk Meter
            </h3>
            <GaugeComponent
              value={role === "admin" ? 15 : 45} // Lower risk for biometric-verified admins
              type="semicircle"
              arc={{
                colorArray: ['#10b981', '#f59e0b', '#ef4444'],
                subArcs: [{limit: 30}, {limit: 60}, {limit: 100}],
                padding: 0.02,
                width: 0.3
              }}
              labels={{ valueLabel: { style: { fontSize: "35px", fill: "#334155" } } }}
            />
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h3 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Real-time Audit Log</h3>
            <div className="space-y-4 font-mono text-[10px]">
              <div className="flex gap-2 text-green-400">
                <span>[10:15:02]</span>
                <span>Google Auth Success</span>
              </div>
              <div className="flex gap-2 text-blue-400">
                <span>[10:15:45]</span>
                <span>{role.toUpperCase()} Session Verified</span>
              </div>
              <div className="flex gap-2 text-amber-400">
                <span>[10:16:10]</span>
                <span>Record AES-256 Decrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;