'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login'); // Default to login mode
  
  // User Data State
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storedName, setStoredName] = useState('Jane Doe');
  
  // OTP State
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');

  // Pre-populate a "Real" user account for demo purposes
  useEffect(() => {
    // Admin by Email
    const adminEmail = 'admin@raksha.com';
    if (!localStorage.getItem(`raksha_user_${adminEmail}`)) {
      localStorage.setItem(`raksha_user_${adminEmail}`, JSON.stringify({
        userName: 'System Admin',
        email: adminEmail,
        password: 'password123'
      }));
    }

    // Admin by Phone
    const adminPhone = '9876543210';
    if (!localStorage.getItem(`raksha_user_${adminPhone}`)) {
      localStorage.setItem(`raksha_user_${adminPhone}`, JSON.stringify({
        userName: 'Police Dispatch',
        email: adminPhone,
        password: 'password123'
      }));
    }
  }, []);

  // App State
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const finalizeAuth = (isRegistering: boolean, finalUserName: string, userEmail: string, userPass: string) => {
    if (isRegistering) {
      const userData = { userName: finalUserName, email: userEmail, password: userPass };
      localStorage.setItem(`raksha_user_${userEmail}`, JSON.stringify(userData));
      setStoredName(finalUserName);
    }
    
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setIsAuthenticated(true);
    }, 1500);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Valid Indian mobile numbers start with 6, 7, 8, or 9 and are exactly 10 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    
    const isPhone = phoneRegex.test(email);
    const isEmail = emailRegex.test(email);

    if (!isEmail && !isPhone) {
      alert("Please enter a valid email address or a 10-digit phone number.");
      return;
    }

    if (authMode === 'register') {
      if (!userName || !email || (isEmail && !password)) {
        alert(isEmail ? "Please fill in all fields (Name, Email, Password)." : "Please enter your Name and Phone Number.");
        return;
      }
      
      if (localStorage.getItem(`raksha_user_${email}`)) {
        alert("An account with this email/phone already exists. Please log in.");
        return;
      }
      
    } else {
      // LOGIN MODE
      if (!email || (isEmail && !password)) {
        alert(isEmail ? "Please enter your email and password." : "Please enter your phone number.");
        return;
      }

      const storedDataString = localStorage.getItem(`raksha_user_${email}`);
      if (!storedDataString) {
        alert("Account not found! This email/phone does not exist in our system. Please Sign Up first.");
        return;
      }

      if (isEmail) {
        const storedData = JSON.parse(storedDataString);
        if (storedData.password !== password) {
          alert("Incorrect password. Please try again.");
          return;
        }
        setStoredName(storedData.userName);
      }
    }

    if (isPhone) {
      if (authMode === 'login') {
        const storedDataString = localStorage.getItem(`raksha_user_${email}`);
        if (storedDataString) {
          setStoredName(JSON.parse(storedDataString).userName);
        }
      }
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otp);
      setShowOtpInput(true);
      alert(`[SIMULATED SMS]\n\nYour RAKSHA verification code is: ${otp}`);
      return;
    }

    finalizeAuth(authMode === 'register', userName, email, password);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtp === generatedOtp) {
      finalizeAuth(authMode === 'register', userName, email, password);
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  // Helper to generate initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !text) {
      alert('Please upload an image or enter text to analyze.');
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      if (file) formData.append('image', file);
      formData.append('text_message', text);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed.');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Error connecting to backend. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN / REGISTRATION SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 space-y-8 animate-fade-in-up">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {authMode === 'register' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-400">Secure access to the RAKSHA portal.</p>
          </div>

          {showOtpInput ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Enter 4-Digit OTP</label>
                <p className="text-xs text-gray-500 mb-2">Sent to {email}</p>
                <input 
                  type="text" 
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value)}
                  placeholder="e.g. 4812"
                  maxLength={4}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-center tracking-widest text-xl font-bold"
                />
              </div>
              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-6"
              >
                {isAuthenticating ? 'Verifying...' : 'Verify & Enter'}
              </button>
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email or Phone Number</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com or 9876543210"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {!/^[6-9]\d{9}$/.test(email) && (
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-6"
              >
                {isAuthenticating 
                  ? 'Authenticating...' 
                  : (authMode === 'register' ? 'Sign Up & Enter' : 'Log In')
                }
              </button>
            </form>
          )}

          {!showOtpInput && (
            <div className="text-center mt-6">
              <button 
                onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {authMode === 'register' 
                  ? 'Already have an account? Log in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
          
          <p className="text-xs text-center text-gray-600 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-gray-800 bg-gray-900/50 p-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-lg tracking-wide">RAKSHA</span>
            </div>
            
            <div className="hidden sm:flex gap-4">
              <span className="text-white font-bold border-b-2 border-red-500 pb-1">
                Threat Scanner
              </span>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Global Analytics
              </Link>
            </div>
          </div>
          
          {/* Dynamic User Profile */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:inline-block">Logged in as <strong className="text-white">{storedName}</strong></span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm shadow-lg">
              {getInitials(storedName)}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto flex flex-col items-center gap-8 p-8 mt-4">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            SENTINEL / RAKSHA
          </h1>
          <p className="text-xl text-gray-400">
            Proactive AI Shield against Deepfake Sextortion & Blackmail
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              1. Upload Suspicious Media (Image/Video)
            </label>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-red-500/10 file:text-red-500
                hover:file:bg-red-500/20 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              2. Paste Threatening Message
            </label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Pay me $500 or I will leak this photo to your contacts..."
              className="w-full h-32 bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
            }`}
          >
            {loading ? 'ANALYZING THREAT LEVEL...' : 'SCAN & ANALYZE NOW'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-white text-center">Threat Assessment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
                <span className="text-gray-400 mb-2">Deepfake Probability</span>
                <span className={`text-4xl font-black ${result.deepfake_score > 50 ? 'text-red-500' : 'text-green-500'}`}>
                  {result.deepfake_score}%
                </span>
              </div>

              <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                <span className="text-gray-400 mb-2">Extortion Intent</span>
                <span className={`text-4xl font-black ${result.extortion_score > 50 ? 'text-red-500' : 'text-green-500'}`}>
                  {result.extortion_score}%
                </span>
                {result.reasoning && (
                   <p className="text-xs text-gray-500 mt-2 italic px-2">"{result.reasoning}"</p>
                )}
              </div>
            </div>

            <div className={`p-6 rounded-xl flex items-center justify-between border ${
              result.risk_score >= 80 
                ? 'bg-red-500/10 border-red-500/50' 
                : 'bg-green-500/10 border-green-500/50'
            }`}>
              <div>
                <h3 className="text-xl font-bold text-white">Composite Risk Score</h3>
                <p className="text-gray-400 text-sm mt-1">Based on multi-modal AI analysis</p>
              </div>
              <span className={`text-5xl font-black ${
                result.risk_score >= 80 ? 'text-red-500' : 'text-green-500'
              }`}>
                {result.risk_score}/100
              </span>
            </div>

            {result.risk_score >= 80 && (
              <div className="bg-red-600 text-white p-4 rounded-lg text-center font-semibold">
                CRITICAL ALERT: High probability of Deepfake Sextortion. DO NOT PAY. DO NOT ENGAGE.
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
              <button 
                onClick={() => setShowBlockModal(true)}
                id="block-btn"
                className="bg-gray-900 border border-red-500 text-red-500 px-4 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition-colors w-full sm:w-auto"
              >
                Block Sender
              </button>
              <button 
                onClick={() => {
                  alert("Generating Evidence Report. Please save the following page as a PDF and submit it to your local Cyber Crime portal (e.g., cybercrime.gov.in).");
                  window.print();
                }}
                className="bg-gray-800 text-white px-4 py-2 rounded font-bold hover:bg-black transition-colors w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Generate Report
              </button>
              <button 
                onClick={() => window.open("https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx", "_blank")}
                className="bg-orange-600 text-white px-4 py-2 rounded font-bold hover:bg-orange-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                File Online Complaint
              </button>
              
              <a 
                href="tel:1930"
                className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Helpline (1930)
              </a>
            </div>

          </div>
        )}

      </main>

      {/* Block Sender Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-gray-900 border border-red-500/50 p-8 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold">Block Attacker</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              To instantly cut off communication and prevent further threats, you must block the sender. RAKSHA provides integration steps for all major platforms:
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <h3 className="text-green-500 font-bold mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp
                </h3>
                <p className="text-sm text-gray-400">Open chat → Tap sender's name → Scroll down → Tap "Block Contact" and "Report".</p>
              </div>
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                <h3 className="text-pink-500 font-bold mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  Instagram
                </h3>
                <p className="text-sm text-gray-400">Open their profile → Tap the three dots (⋯) → Tap "Block" → Select "Block this account and new accounts they may create".</p>
              </div>
            </div>

            <button 
              onClick={() => setShowBlockModal(false)}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              I Understand, Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
