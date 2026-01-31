import React, { useRef, useState, useEffect } from 'react';
import { Camera, Mic, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/client';

const MedicalStaffLogin = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [stream, setStream] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('credentials'); // credentials, biometric, verify
  const [errors, setErrors] = useState({});

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

  // Step 1: Verify Credentials
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await api.post('/medical-staff/verify-credentials', formData);
      setMessage('✓ Credentials verified. Please proceed to biometric verification.');
      setStep('biometric');
    } catch (err) {
      setMessage(`Login failed: ${err.response?.data?.detail || 'Invalid credentials'}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Biometric Verification
  const handleBiometricVerification = async (e) => {
    e.preventDefault();
    
    if (!faceImage || !recordedAudio) {
      setMessage('Please capture face and record voice');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('face_image', faceImage);
      formDataToSend.append('voice_recording', recordedAudio);

      const response = await api.post('/medical-staff/verify-biometric', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('✓ Biometric verification successful!');
      setTimeout(() => {
        window.location.href = '/medical-staff-dashboard';
      }, 2000);
    } catch (err) {
      setMessage(`Verification failed: ${err.response?.data?.detail || 'Biometric mismatch'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Medical Staff Login</h1>
            <p className="opacity-90">Secure two-factor authentication with biometric verification</p>
          </div>

          <div className="p-8">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className={`flex items-center ${step === 'credentials' || step === 'biometric' ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === 'credentials' || step === 'biometric' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}>1</div>
                <span className="ml-2 font-semibold">Credentials</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
              <div className={`flex items-center ${step === 'biometric' ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === 'biometric' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
                }`}>2</div>
                <span className="ml-2 font-semibold">Biometric</span>
              </div>
            </div>

            {/* Step 1: Credentials */}
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Login Credentials</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your registered email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                {message && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.includes('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message.includes('✓') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <LogIn size={20} /> {loading ? 'Verifying...' : 'Proceed to Biometric Verification'}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  Don't have an account? <a href="/medical-staff-signup" className="text-indigo-600 font-semibold hover:underline">Sign up here</a>
                </p>
              </form>
            )}

            {/* Step 2: Biometric Verification */}
            {step === 'biometric' && (
              <form onSubmit={handleBiometricVerification} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Biometric Verification</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Face Capture */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Camera className="text-indigo-600" /> Face Verification
                    </h3>

                    {!faceImage ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg bg-black mb-4 aspect-video"
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
                  </div>

                  {/* Voice Recording */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Mic className="text-indigo-600" /> Voice Verification
                    </h3>

                    {!recordedAudio ? (
                      <div className="space-y-3">
                        {!isRecordingVoice ? (
                          <>
                            <p className="text-sm text-gray-600 mb-4">Record your voice: "I am a medical professional"</p>
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
                              <p className="text-3xl font-bold text-red-600 animate-pulse">{recordingTime}s</p>
                              <p className="text-gray-600 text-sm mt-2">Recording in progress...</p>
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
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    message.includes('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message.includes('✓') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setFaceImage(null);
                      setRecordedAudio(null);
                      setMessage('');
                    }}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} /> {loading ? 'Verifying...' : 'Complete Login'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalStaffLogin;
