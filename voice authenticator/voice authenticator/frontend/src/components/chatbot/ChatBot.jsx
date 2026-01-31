import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import api from '../../api/client';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am your healthcare assistant. How can I help you today? Ask me anything or select from the FAQs below.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // FAQ Section with common questions and answers
  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book appointments through the "Appointments" tab in your dashboard. Click the "+ Book Appointment" button, fill in the doctor\'s name, select your preferred department, choose a date and time, and provide a reason for your visit. Your appointment will be scheduled immediately.'
    },
    {
      question: 'What are the clinic operating hours?',
      answer: 'Our clinic operates Monday to Friday from 9:00 AM to 6:00 PM, and Saturday from 10:00 AM to 4:00 PM. We are closed on Sundays and public holidays. For emergency services, we are available 24/7.'
    },
    {
      question: 'How do I access my medical records?',
      answer: 'You can access your medical records and health reports from the "Reports" section in your dashboard. All your records are securely encrypted and stored safely. You can also download your reports as CSV files.'
    },
    {
      question: 'How do I calculate my BMI?',
      answer: 'Go to the "BMI Calculator" tab in your dashboard. Enter your height (in cm or feet) and weight (in kg or lbs), then click "Calculate BMI". You\'ll see your BMI score, category, and recommendations based on your health status.'
    },
    {
      question: 'What should I do in case of emergency?',
      answer: 'In case of medical emergency, please call 911 immediately or visit your nearest emergency room. Our emergency medical team is available 24/7. If you have any urgent concerns, you can also call our emergency helpline.'
    },
    {
      question: 'How can I get a prescription refill?',
      answer: 'To refill your prescription, contact your attending doctor or visit the prescription section in your profile. Prescription refills usually take 24-48 hours to process. Your pharmacist will contact you when ready for pickup.'
    },
    {
      question: 'How is my data kept private and secure?',
      answer: 'Your health data is protected using advanced encryption and secure authentication protocols. All patient information is stored in encrypted databases. We follow HIPAA compliance and never share your data without your explicit consent.'
    },
    {
      question: 'Can I reschedule my appointment?',
      answer: 'Yes, you can reschedule your appointment from the "Appointments" tab. Click on the appointment you wish to reschedule and select a new date and time. If rescheduling is not possible, you can cancel and book a new one.'
    }
  ];

  const contacts = [
    { type: 'Emergency', number: '911', email: 'emergency@healthcare.com' },
    { type: 'Helpline', number: '+1-800-HEALTH-1', email: 'support@healthcare.com' },
    { type: 'Appointment', number: '+1-800-APT-BOOK', email: 'appointments@healthcare.com' }
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowFAQ(false);

    try {
      const res = await api.post('/chatbot/message', { message: input });
      const botReply = {
        id: messages.length + 2,
        type: 'bot',
        text: res.data.reply || getAutoReply(input)
      };
      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorReply = {
        id: messages.length + 2,
        type: 'bot',
        text: getAutoReply(input)
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const getAutoReply = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('appointment') || msg.includes('book')) {
      return 'You can book appointments through the "Appointments" tab in your dashboard. Click "+ Book Appointment", fill in the details like doctor name, department, date, time, and reason for visit. Your appointment will be scheduled immediately.';
    }
    if (msg.includes('hours') || msg.includes('operating') || msg.includes('timing')) {
      return 'Our clinic operates Monday to Friday from 9:00 AM to 6:00 PM, and Saturday from 10:00 AM to 4:00 PM. We are closed on Sundays and public holidays. For emergencies, we are available 24/7.';
    }
    if (msg.includes('records') || msg.includes('medical') || msg.includes('report')) {
      return 'You can access your medical records from the "Reports" section in your dashboard. All records are securely encrypted. You can also download your health reports as CSV files for your personal records.';
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('fee') || msg.includes('consultation')) {
      return 'Consultation fees vary by department and doctor specialization. Please contact our helpline at +1-800-HEALTH-1 for specific pricing information. We also offer discounts for regular check-ups and family packages.';
    }
    if (msg.includes('emergency')) {
      return 'In case of emergency, please call 911 immediately or visit your nearest emergency room. Our emergency team is available 24/7. For urgent concerns, call our emergency helpline. Your health and safety are our top priority.';
    }
    if (msg.includes('prescription') || msg.includes('refill') || msg.includes('medicine')) {
      return 'To refill your prescription, contact your doctor or visit your profile. Refills usually take 24-48 hours. Your pharmacist will contact you when your prescription is ready for pickup at our pharmacy.';
    }
    if (msg.includes('bmi') || msg.includes('weight') || msg.includes('health')) {
      return 'Use our BMI Calculator in the dashboard to track your health. Enter your height and weight to get your BMI score and health recommendations. Keep checking regularly to monitor your health progress.';
    }
    if (msg.includes('privacy') || msg.includes('secure') || msg.includes('data')) {
      return 'Your data is protected with advanced encryption and secure authentication. We follow HIPAA compliance standards. Your health information is confidential and never shared without your consent.';
    }
    
    return 'Thank you for your question. I\'m here to help! You can explore the FAQ section below for common questions, or describe your concern in detail and I\'ll do my best to assist you. For urgent matters, please contact our helpline.';
  };

  const handleFAQClick = (faq) => {
    setShowFAQ(false);
    
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: faq.question
    };
    
    const botMsg = {
      id: messages.length + 2,
      type: 'bot',
      text: faq.answer
    };
    
    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle size={24} />
              <div>
                <h3 className="text-lg font-bold">HealthCare Assistant</h3>
                <p className="text-sm opacity-90">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none">
                  <Loader className="animate-spin" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or select an FAQ..."
                rows="2"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:bg-gray-400 flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - FAQ & Contacts */}
        <div className="space-y-6">
          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setShowFAQ(!showFAQ)}
              className="w-full flex items-center justify-between font-bold text-gray-800 mb-4"
            >
              <span className="flex items-center gap-2">
                <HelpCircle size={20} /> FAQs
              </span>
              <span className={`transition ${showFAQ ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showFAQ && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {faqs.map((faq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFAQClick(faq)}
                    className="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-sm text-gray-700 hover:text-indigo-600 rounded-lg transition border border-indigo-200 hover:border-indigo-400 text-xs"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setShowContacts(!showContacts)}
              className="w-full flex items-center justify-between font-bold text-gray-800 mb-4"
            >
              <span className="flex items-center gap-2">
                <Phone size={20} /> Contact Us
              </span>
              <span className={`transition ${showContacts ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showContacts && (
              <div className="space-y-3">
                {contacts.map((contact, idx) => (
                  <div key={idx} className="pb-3 border-b border-gray-200 last:border-b-0">
                    <p className="font-semibold text-gray-800">{contact.type}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Phone:</strong> {contact.number}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {contact.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
