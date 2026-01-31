import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = async (role) => {
    try {
      // Send role to FastAPI backend
      await axios.post('http://127.0.0.1:8000/select-role', 
        { role }, 
        { withCredentials: true }
      );

      // Navigate based on backend logic
      if (role === 'admin') {
        navigate('/medical-staff-signup'); // Medical staff biometric path
      } else {
        navigate('/setup-2fa'); // Standard 2FA path for patients
      }
    } catch (error) {
      console.error("Role selection failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <h1 className="text-3xl font-black text-slate-800 mb-2 text-center">Identity Portal</h1>
      <p className="text-slate-500 mb-10 text-center">Choose your access level to proceed</p>
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Admin / Doctor Card */}
        <div 
          onClick={() => handleRoleSelect('admin')}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer group text-center"
        >
          <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-blue-600" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Medical Staff</h2>
          <p className="text-slate-400 text-sm">Face + Voice Biometric Gate</p>
        </div>

        {/* Patient Card */}
        <div 
          onClick={() => handleRoleSelect('patient')}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-green-500 transition-all cursor-pointer group text-center"
        >
          <div className="bg-green-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <User className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Patient</h2>
          <p className="text-slate-400 text-sm">Standard Google 2FA</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;