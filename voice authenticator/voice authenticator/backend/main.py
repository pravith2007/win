import os
import io
import base64
import pyotp
import qrcode
import random
import time
from fastapi import FastAPI, Request, HTTPException, File, UploadFile, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv

# Internal project imports
from crypto import decrypt_data
from database import get_record

# MANDATORY: Allows OAuth to work over HTTP for local development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

load_dotenv()
app = FastAPI(title="Secure Healthcare Backend")

# CORS Setup for React Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. SETUP SESSION MIDDLEWARE
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

# 2. SETUP GOOGLE OAUTH
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# Constants
SHARED_2FA_SECRET = "JBSWY3DPEHPK3PXP" 
MEDICAL_PHRASES = [
    "Verify Medical Access 782", 
    "Emergency Heart Rate Stable", 
    "Decrypt Patient Record Alpha",
    "Secure Bio Sync Active",
    "Confirm Identity Now 404"
]

# -------------------------------
# AUTHENTICATION & ROLE SELECTION
# -------------------------------

@app.get("/login")
async def login(request: Request):
    """Starts the Google Login process."""
    # Use explicit REDIRECT_URI (if provided) to ensure exact match with Google Cloud Console
    redirect_uri = os.getenv("REDIRECT_URI") or request.url_for('auth_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    """Processes Google return and forces Role Selection."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get('userinfo')
        
        # Reset security status for a new session
        request.session.clear() 
        request.session['user'] = dict(user)
        
        # Redirect to React Role Selection Page
        return RedirectResponse(url="http://localhost:3000/select-role")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auth failed: {str(e)}")

@app.post("/select-role")
async def select_role(request: Request):
    """Saves user role and directs to correct security gate."""
    data = await request.json()
    role = data.get("role") # 'admin' or 'patient'
    
    if role not in ["admin", "patient"]:
        raise HTTPException(status_code=400, detail="Invalid role selection")
        
    request.session["role"] = role
    
    # Redirect logic based on role
    if role == "admin":
        return {"redirect": "http://localhost:3000/admin-biometric"}
    return {"redirect": "http://localhost:3000/setup-2fa"}

# -------------------------------
# ADMIN BIOMETRIC GATE (FACE + VOICE)
# -------------------------------

@app.get("/get-challenge-phrase")
async def get_challenge(request: Request):
    """Generates a random phrase rotating every 120 seconds."""
    if request.session.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized role")

    # Group time into 2-minute windows
    window = int(time.time() / 120) 
    random.seed(window)
    phrase = random.choice(MEDICAL_PHRASES)
    
    request.session['current_challenge'] = phrase
    return {
        "phrase": phrase, 
        "expires_in": 120 - (int(time.time()) % 120)
    }

@app.post("/verify-admin-bio")
async def verify_admin_bio(request: Request, video: UploadFile = File(...)):
    """Verifies combined Face + Voice sync for Admins."""
    if request.session.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    # --- INTEGRATION POINT FOR YOUR AI MODELS ---
    # 1. Extract frames from 'video' for Face Recognition
    # 2. Extract audio from 'video' for Voice Recognition
    # 3. Match against request.session['current_challenge']
    
    # Placeholder: Assuming AI logic returns True
    biometric_match = True 
    
    if biometric_match:
        request.session['admin_verified'] = True
        return {"status": "Success", "message": "Admin Identity Confirmed"}
    
    raise HTTPException(status_code=403, detail="Biometric Verification Failed")

# -------------------------------
# PATIENT 2FA (GOOGLE AUTHENTICATOR)
# -------------------------------

@app.get("/setup-2fa")
async def setup_2fa(request: Request):
    """QR Code setup for Patients only."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Access Denied")

    totp = pyotp.TOTP(SHARED_2FA_SECRET)
    auth_url = totp.provisioning_uri(name=user['email'], issuer_name="HealthcareSecure")

    img = qrcode.make(auth_url)
    buf = io.BytesIO()
    img.save(buf)
    img_base64 = base64.b64encode(buf.getvalue()).decode()

    return {"qr_code": img_base64}

@app.post("/verify-2fa")
async def verify_2fa(request: Request):
    """Validates 6-digit OTP for Patients."""
    data = await request.json()
    code = data.get("code")
    
    totp = pyotp.TOTP(SHARED_2FA_SECRET)
    if totp.verify(code):
        request.session['2fa_verified'] = True
        return {"status": "Success", "redirect": "http://localhost:3000/dashboard"}
    
    raise HTTPException(status_code=400, detail="Invalid 2FA code")

# -------------------------------
# SECURED DATA ACCESS
# -------------------------------

@app.get("/view_record/{record_id}")
def view_record(record_id: str, request: Request):
    """Final gate: Checks role-specific verification flags."""
    user = request.session.get('user')
    role = request.session.get('role')

    if not user:
        raise HTTPException(status_code=401, detail="Login required")

    # Enforce role-based security paths
    if role == "admin" and not request.session.get('admin_verified'):
        raise HTTPException(status_code=403, detail="Biometric verification required for Admins")
    
    if role == "patient" and not request.session.get('2fa_verified'):
        raise HTTPException(status_code=403, detail="2FA required for Patients")

    # Fetch and Decrypt Data
    encrypted = get_record(record_id)
    decrypted = decrypt_data(encrypted)
    
    return {
        "record": decrypted, 
        "audit": f"Accessed by {user['email']} as {role}"
    }

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}

# ========================
# PATIENT DASHBOARD ENDPOINTS
# ========================

@app.get("/patient/profile")
async def get_patient_profile(request: Request):
    """Get patient profile information."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    
    # Return patient data (in real app, fetch from database)
    return {
        "name": user.get('name', 'Patient Name'),
        "id": "PAT-2026-001",
        "email": user.get('email'),
        "age": 32,
        "gender": "Male",
        "blood_type": "O+",
        "phone": "+91-9876543210",
        "joined_date": "2024-01-15"
    }

@app.post("/patient/update-profile")
async def update_patient_profile(request: Request):
    """Update patient profile information."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    
    data = await request.json()
    # In real app, update database
    return {"status": "Profile updated successfully"}

@app.get("/patient/health-status")
async def get_health_status(request: Request):
    """Get current health status."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    
    return {
        "current_status": "Stable",
        "blood_pressure": "120/80",
        "heart_rate": 72,
        "temperature": 98.6,
        "last_checkup": "2026-01-28"
    }

@app.post("/patient/bmi-calculate")
async def calculate_bmi(request: Request):
    """Calculate and save BMI."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    
    data = await request.json()
    height = data.get('height')
    weight = data.get('weight')
    
    bmi = round(weight / ((height / 100) ** 2), 1)
    
    return {
        "bmi": bmi,
        "category": "Normal Weight" if 18.5 <= bmi < 25 else "Overweight"
    }

@app.get("/patient/appointments/{patient_id}")
async def get_appointments(patient_id: str, request: Request):
    """Get patient appointments."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    
    # Return demo appointments
    return {
        "appointments": [
            {
                "id": 1,
                "doctor_name": "Dr. Smith",
                "department": "General Medicine",
                "date": "2026-02-10",
                "time": "10:00 AM",
                "status": "confirmed"
            }
        ]
    }

@app.post("/patient/book-appointment/{patient_id}")
async def book_appointment(patient_id: str, request: Request):
    """Book new appointment."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    
    try:
        data = await request.json()
        # In real app, save to database
        appointment = {
            "id": int(time.time()),
            "patient_id": patient_id,
            "doctor_name": data.get('doctor_name'),
            "department": data.get('department'),
            "date": data.get('date'),
            "time": data.get('time'),
            "reason": data.get('reason'),
            "notes": data.get('notes', ''),
            "status": "confirmed",
            "created_at": time.time()
        }
        return {
            "status": "Appointment booked successfully",
            "appointment": appointment,
            "appointment_id": appointment['id']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error booking appointment: {str(e)}")

@app.post("/patient/cancel-appointment/{appointment_id}")
async def cancel_appointment(appointment_id: str, request: Request):
    """Cancel appointment."""
    user = request.session.get('user')
    if not user or request.session.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Patient access only")
    
    return {"status": "Appointment cancelled successfully"}

@app.get("/patient/reports/{patient_id}")
async def get_reports(patient_id: str, period: str = "week", request: Request = None):
    """Get day-wise health reports."""
    # Return demo reports
    return {
        "reports": [
            {
                "id": 1,
                "date": "2026-01-28",
                "day": "Monday",
                "steps": 8234,
                "water": 2.5,
                "calories": 2100,
                "sleep": 7.5,
                "mood": "Good",
                "notes": "Feeling energetic after morning jog"
            },
            {
                "id": 2,
                "date": "2026-01-29",
                "day": "Tuesday",
                "steps": 7891,
                "water": 2.2,
                "calories": 1950,
                "sleep": 7.0,
                "mood": "Excellent",
                "notes": "Great day at work"
            }
        ]
    }

@app.post("/chatbot/message")
async def chatbot_message(request: Request):
    """Handle chatbot messages with FAQ support."""
    data = await request.json()
    message = data.get('message', '').lower()
    
    # FAQ Knowledge Base
    faq_database = {
        'appointment': 'You can book appointments through the "Appointments" tab in your dashboard. Click "+ Book Appointment", fill in the doctor name, select department, choose date and time, and provide reason for visit.',
        'hours': 'Our clinic operates Monday to Friday 9:00 AM to 6:00 PM, and Saturday 10:00 AM to 4:00 PM. Closed on Sundays and public holidays. Emergency services available 24/7.',
        'records': 'Access your medical records from the "Reports" section. All data is securely encrypted. You can download reports as CSV files.',
        'bmi': 'Use the BMI Calculator tab to track your weight. Enter height and weight to get your BMI score and health recommendations.',
        'emergency': 'Call 911 or visit nearest emergency room immediately. Our emergency team is available 24/7.',
        'prescription': 'Contact your doctor for prescription refills. Refills take 24-48 hours. Your pharmacist will notify you when ready.',
        'privacy': 'Your data is protected with advanced encryption. We follow HIPAA compliance. Your information is never shared without consent.',
        'reschedule': 'Reschedule from the Appointments tab by selecting your appointment and choosing a new date/time. Or cancel and book a new one.'
    }
    
    # Check for keyword matches
    for keyword, response in faq_database.items():
        if keyword in message:
            return {"reply": response}
    
    # General responses
    if any(word in message for word in ['thanks', 'thank', 'thanks!', 'ty', 'thanks you']):
        return {"reply": "You're welcome! Is there anything else I can help you with? Feel free to ask me any questions about our healthcare services."}
    
    if any(word in message for word in ['hello', 'hi', 'hey', 'hi!', 'hello!']):
        return {"reply": "Hello! Welcome to our healthcare support. I'm here to help you with appointments, health information, and general inquiries. How can I assist you today?"}
    
    if any(word in message for word in ['help', 'support', 'assist']):
        return {"reply": "I'm happy to help! You can ask me about: booking appointments, clinic hours, medical records, BMI calculation, emergency services, prescription refills, privacy & security, or appointment rescheduling. What would you like to know?"}
    
    # Default response
    return {
        "reply": "Thank you for your question! I'm here to assist you with healthcare services. You can ask me about appointments, medical records, clinic hours, emergency services, or any other health-related questions. For specific concerns, please contact our helpline at +1-800-HEALTH-1."
    }

# ============ MEDICAL STAFF ENDPOINTS ============

# In-memory medical staff database (for demo)
medical_staff_db = {}

@app.post("/medical-staff/signup")
async def medical_staff_signup(
    name: str = Form(...),
    email: str = Form(...),
    license_number: str = Form(...),
    department: str = Form(...),
    password: str = Form(...),
    face_image: UploadFile = File(...),
    voice_recording: UploadFile = File(...)
):
    """Register medical staff with biometric verification (face + voice)."""
    try:
        # Check if email already exists
        if any(staff['email'] == email for staff in medical_staff_db.values()):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Store biometric data in base64
        face_data = base64.b64encode(await face_image.read()).decode()
        voice_data = base64.b64encode(await voice_recording.read()).decode()
        
        # Create staff record
        staff_id = f"STAFF_{int(time.time())}"
        medical_staff_db[staff_id] = {
            'name': name,
            'email': email,
            'license_number': license_number,
            'department': department,
            'password': password,  # In production, hash this!
            'face_image': face_data,
            'voice_recording': voice_data,
            'created_at': time.time()
        }
        
        return {
            "status": "success",
            "message": "Medical staff account created successfully",
            "staff_id": staff_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/medical-staff/verify-credentials")
async def verify_credentials(request: Request):
    """Verify email and password for medical staff login."""
    try:
        data = await request.json()
        email = data.get('email')
        password = data.get('password')
        
        # Find staff by email and password
        for staff_id, staff in medical_staff_db.items():
            if staff['email'] == email and staff['password'] == password:
                request.session['medical_staff_id'] = staff_id
                request.session['medical_staff_email'] = email
                return {"status": "success", "message": "Credentials verified"}
        
        raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/medical-staff/verify-biometric")
async def verify_biometric(
    request: Request,
    email: str = Form(...),
    face_image: UploadFile = File(...),
    voice_recording: UploadFile = File(...)
):
    """Verify medical staff using biometric (face + voice comparison)."""
    try:
        # Find staff record
        staff_record = None
        for staff_id, staff in medical_staff_db.items():
            if staff['email'] == email:
                staff_record = (staff_id, staff)
                break
        
        if not staff_record:
            raise HTTPException(status_code=401, detail="Staff not found")
        
        staff_id, staff = staff_record
        
        # Convert uploaded files to base64
        new_face = base64.b64encode(await face_image.read()).decode()
        new_voice = base64.b64encode(await voice_recording.read()).decode()
        
        # Simple biometric verification (in production, use ML models)
        # For demo: check if data is similar (similarity > 60%)
        face_match = calculate_similarity(new_face, staff['face_image'])
        voice_match = calculate_similarity(new_voice, staff['voice_recording'])
        
        if face_match > 0.6 and voice_match > 0.6:
            request.session['medical_staff_authenticated'] = True
            request.session['medical_staff_id'] = staff_id
            request.session['medical_staff_name'] = staff['name']
            request.session['medical_staff_department'] = staff['department']
            
            return {
                "status": "success",
                "message": "Biometric verification successful",
                "staff_id": staff_id
            }
        else:
            raise HTTPException(status_code=401, detail="Biometric verification failed")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/medical-staff/dashboard")
async def medical_staff_dashboard(request: Request):
    """Get medical staff dashboard data."""
    if not request.session.get('medical_staff_authenticated'):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    staff_id = request.session.get('medical_staff_id')
    staff = medical_staff_db.get(staff_id)
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    
    return {
        "staff_id": staff_id,
        "name": staff['name'],
        "email": staff['email'],
        "department": staff['department'],
        "license_number": staff['license_number'],
        "patients_today": 5,
        "appointments": 3,
        "pending_tasks": 2
    }

@app.post("/medical-staff/logout")
async def medical_staff_logout(request: Request):
    """Logout medical staff and clear session."""
    request.session.clear()
    return {"status": "success", "message": "Logged out successfully"}

# Helper function for biometric similarity
def calculate_similarity(data1: str, data2: str) -> float:
    """Calculate similarity between two biometric data (demo implementation)."""
    # In production, use proper face recognition and voice analysis libraries
    # For now, simple string comparison
    if data1 == data2:
        return 1.0
    # Calculate basic character-level similarity
    common_chars = sum(1 for c1, c2 in zip(data1, data2) if c1 == c2)
    total_chars = max(len(data1), len(data2))
    return common_chars / total_chars if total_chars > 0 else 0.0