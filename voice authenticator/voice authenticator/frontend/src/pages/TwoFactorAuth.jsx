import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client'; // Using the Axios instance we created
import { ShieldCheck, Smartphone, Lock, ArrowRight } from 'lucide-react';

const TwoFactorAuth = () => {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  // 1. Fetch QR Code for Google Authenticator
  useEffect(() => {
    const getQR = async () => {
      try {
        const res = await api.get('/setup-2fa');
        setQrCode(res.data.qr_code);
      } catch (err) {
        console.error("Failed to load QR code", err);
      }
    };
    getQR();
  }, []);

  // 2. Verify the 6-digit OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/verify-2fa', { code });
      if (res.data.status === "Success") {
        navigate('/patient-dashboard'); // Redirect to patient dashboard
      }
    } catch (err) {
      alert("Invalid Code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-green-600 font-bold uppercase tracking-widest text-xs mb-2">
          <ShieldCheck size={16} /> Patient Security Step
        </div>
        <h1 className="text-3xl font-black text-slate-800">2FA Verification</h1>
      </div>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl p-10 border border-slate-100 text-center">
        {qrCode && (
          <div className="mb-8 flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl border-2 border-dashed border-slate-200 mb-4">
              <img src={`data:image/png;base64,${qrCode}`} alt="2FA QR" className="w-48 h-48" />
            </div>
            <p className="text-xs text-slate-400 px-4">Scan this once in Google Authenticator</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Authenticator Code</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="000 000"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl tracking-[0.3em] font-bold"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength="6"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
            Verify & Enter Dashboard <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuth;