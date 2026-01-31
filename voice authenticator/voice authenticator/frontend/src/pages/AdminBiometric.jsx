import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Mic, ShieldAlert, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminBiometric = () => {
  const [phrase, setPhrase] = useState("Loading challenge...");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // 1. Fetch the 2-minute dynamic phrase
  const fetchChallenge = async () => {
    try {
      const res = await axios.get('http://localhost:8000/get-challenge-phrase', { withCredentials: true });
      setPhrase(res.data.phrase);
      setTimeLeft(res.data.expires_in);
    } catch (err) {
      console.error("Challenge fetch failed", err);
    }
  };

  // 2. Start Camera & Mic Stream
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  useEffect(() => {
    fetchChallenge();
    startCamera();
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 120), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Capture Combined Face + Voice Video
  const handleCapture = async () => {
    setIsRecording(true);
    const stream = videoRef.current.srcObject;
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append("video", blob); // Sending the sync data to FastAPI
      
      try {
        await axios.post('http://localhost:8000/verify-admin-bio', formData, { withCredentials: true });
        alert("Verification Success!");
      } catch (err) {
        alert("Verification Mismatch. Try again.");
      }
      setIsRecording(false);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 4000); // 4-second biometric window
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-800 rounded-[3rem] p-10 border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
          <ShieldAlert /> High-Security Biometric Sync
        </h2>

        {/* Camera Preview */}
        <div className="relative rounded-3xl overflow-hidden bg-black mb-8 border-4 border-slate-700">
          <video ref={videoRef} autoPlay muted className="w-full h-64 object-cover scale-x-[-1]" />
          {isRecording && <div className="absolute top-4 right-4 w-4 h-4 bg-red-600 rounded-full animate-pulse" />}
        </div>

        {/* 2-Minute Rotating Phrase */}
        <div className="bg-slate-900 p-8 rounded-3xl text-center border-2 border-dashed border-blue-500/30 mb-8">
          <span className="text-[10px] uppercase font-black text-blue-500 tracking-widest">Challenge Phrase</span>
          <p className="text-2xl font-mono mt-2 text-blue-100">"{phrase}"</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw size={12} className="animate-spin" /> Rotates in {timeLeft}s
          </div>
        </div>

        <button 
          onClick={handleCapture}
          disabled={isRecording}
          className="w-full bg-blue-600 py-5 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
        >
          {isRecording ? "ANALYZING BIOMETRICS..." : "RECORD & VERIFY"}
        </button>
      </div>
    </div>
  );
};

export default AdminBiometric;