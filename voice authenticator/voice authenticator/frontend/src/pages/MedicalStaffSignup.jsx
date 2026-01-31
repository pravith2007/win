import React, { useRef, useState, useEffect } from 'react';
import { Camera, Mic, Send, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/client';

const MedicalStaffSignup = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    license_number: '',
    department: 'General Medicine',
    password: '',
    confirmPassword: ''
  });

  const [stream, setStream] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'General Medicine',
    'Dermatology',
    'Psychiatry',
    'Emergency Medicine'
  ];

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setMessage('Camera access denied. Please allow camera permissions.');
    }
  };

  // Capture Face
  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setFaceImage(imageData);
      setMessage('✓ Face captured successfully');
    }
  };

  // Start Voice Recording
  const startVoiceRecording = async () => {
    try {
      if (!stream) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
        mediaRecorderRef.current = new MediaRecorder(audioStream);
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        setMessage('✓ Voice recorded successfully');
      };

      mediaRecorderRef.current.start();
      setIsRecordingVoice(true);
      setRecordingTime(0);

      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 10) {
            stopVoiceRecording();
            clearInterval(timer);
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setMessage('Microphone access denied. Please allow audio permissions.');
    }
  };

  // Stop Voice Recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.license_number) newErrors.license_number = 'License number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!faceImage) newErrors.face = 'Face capture is required';
    if (!recordedAudio) newErrors.voice = 'Voice recording is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fill all required fields and capture face & voice');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('license_number', formData.license_number);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('face_image', faceImage);
      formDataToSend.append('voice_recording', recordedAudio);

      await api.post('/medical-staff/signup', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('✓ Signup successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/medical-staff-login';
      }, 2000);
    } catch (err) {
      setMessage(`Signup failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Medical Staff Registration</h1>
        <p className="text-gray-600 text-center mb-8">Secure biometric signup with face and voice verification</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Biometric Section */}
          <div className="space-y-6">
            {/* Face Capture */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="text-indigo-600" /> Face Capture
              </h2>
              
              {!faceImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg bg-black mb-4"
                  />
                  <canvas ref={canvasRef} className="hidden" width={640} height={480} />
                  
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Start Camera
                    </button>
                    <button
                      type="button"
                      onClick={captureFace}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                    >
                      Capture Face
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <img
                    src={faceImage}
                    alt="Captured face"
                    className="w-full rounded-lg border-2 border-green-500"
                  />
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle size={20} /> Face Captured
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaceImage(null)}
                    className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Retake
                  </button>
                </div>
              )}
              {errors.face && <p className="text-red-600 text-sm mt-2">⚠ {errors.face}</p>}
            </div>

            {/* Voice Recording */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Mic className="text-indigo-600" /> Voice Recording
              </h2>
              
              {!recordedAudio ? (
                <div className="space-y-3">
                  {!isRecordingVoice ? (
                    <>
                      <p className="text-sm text-gray-600 mb-4">Record a 10-second voice sample saying: "I am a medical professional"</p>
                      <button
                        type="button"
                        onClick={startVoiceRecording}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                      >
                        Start Recording
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600 animate-pulse">{recordingTime}s</p>
                        <p className="text-gray-600 text-sm mt-2">Recording... speak clearly</p>
                      </div>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
                      >
                        Stop Recording
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle size={20} /> Voice Recorded
                  </div>
                  <audio
                    ref={audioRef}
                    src={URL.createObjectURL(recordedAudio)}
                    controls
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setRecordedAudio(null)}
                    className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Re-record
                  </button>
                </div>
              )}
              {errors.voice && <p className="text-red-600 text-sm mt-2">⚠ {errors.voice}</p>}
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* License ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Number *</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  placeholder="Enter your medical license number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.license_number && <p className="text-red-600 text-sm mt-1">{errors.license_number}</p>}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  message.includes('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.includes('✓') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span className="text-sm">{message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Send size={20} /> {loading ? 'Registering...' : 'Complete Registration'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                Already registered? <a href="/medical-staff-login" className="text-indigo-600 font-semibold hover:underline">Login here</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalStaffSignup;
