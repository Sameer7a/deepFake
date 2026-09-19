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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [blockModalState, setBlockModalState] = useState<'hidden' | 'input' | 'blocking' | 'success'>('hidden');
  const [callModalState, setCallModalState] = useState<'hidden' | 'connecting' | 'connected'>('hidden');
  const [attackerId, setAttackerId] = useState('');
  const [reportAttacker, setReportAttacker] = useState('');
  const [reportId, setReportId] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

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
      
      // Auto-scroll to results after DOM updates
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
    <>
      <div className="min-h-screen bg-gray-950 text-white font-sans print:hidden">
      
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
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-lg transition-colors focus:outline-none"
            >
              <span className="text-sm text-gray-400">Logged in as <strong className="text-white">{storedName}</strong></span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm shadow-lg text-white">
                {getInitials(storedName)}
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                  <p className="font-bold text-white text-lg">{storedName}</p>
                  <p className="text-xs text-gray-400 mt-1">{email || "Account Verified"}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { setShowSettingsModal(true); setShowProfile(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287-.947c.886.539 2.041.06 2.287-.947 1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    Account Settings
                  </button>
                  <button 
                    onClick={() => { setShowReportsModal(true); setShowProfile(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                    My Threat Reports
                  </button>
                  <div className="h-px bg-gray-800 my-2"></div>
                  <button 
                    onClick={() => {
                      setIsAuthenticated(false);
                      setShowProfile(false);
                      setFile(null);
                      setText('');
                      setResult(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors flex items-center gap-2 font-bold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                    Secure Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto flex flex-col items-center gap-8 p-8 mt-4">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-4">
          <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs font-bold text-gray-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Core Systems Online
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            RAKSHA <span className="text-gray-500 font-light">| Sentinel</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Advanced digital threat detection and rapid incident response platform.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              1. Upload Suspicious Media (Image / Video / Audio)
            </label>
            <input 
              type="file" 
              accept="image/*,video/*,audio/*"
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
          <div id="results-section" className="w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-6 animate-fade-in-up">
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
                   <p className="text-xs text-gray-500 mt-2 italic px-2">&quot;{result.reasoning}&quot;</p>
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
                onClick={() => setBlockModalState('input')}
                id="block-btn"
                className="bg-gray-900 border border-red-500 text-red-500 px-4 py-2 rounded font-bold hover:bg-red-600 hover:text-white transition-colors w-full sm:w-auto"
              >
                Block Sender
              </button>
              <button 
                onClick={() => {
                  const info = prompt("Please enter the attacker's phone number, email, or username to include in the Official Report:");
                  if (info !== null) {
                    setReportAttacker(info || 'Not provided');
                    setReportId(`RAK-${Math.floor(Math.random() * 1000000)}`);
                    setTimeout(() => window.print(), 500);
                  }
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
              <button 
                onClick={() => {
                  setCallModalState('connecting');
                  setTimeout(() => setCallModalState('connected'), 3000);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Helpline (1930)
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Block Sender Modal */}
      {blockModalState !== 'hidden' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-gray-900 border border-red-500/50 p-8 rounded-2xl shadow-2xl max-w-lg w-full">
            
            {blockModalState === 'input' && (
              <>
                <div className="flex items-center gap-3 mb-4 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-2xl font-bold">Block Attacker</h2>
                </div>
                <p className="text-gray-300 mb-6">
                  Enter the attacker&apos;s username, email, or phone number to permanently block them across all integrated Meta platforms (WhatsApp, Instagram, Facebook).
                </p>
                <input 
                  type="text" 
                  placeholder="e.g., @hacker123 or +91 9876543210" 
                  value={attackerId}
                  onChange={(e) => setAttackerId(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white mb-6 focus:border-red-500 focus:outline-none"
                />
                <div className="flex gap-4">
                  <button 
                    onClick={() => setBlockModalState('hidden')}
                    className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if(!attackerId) return alert("Please enter an ID");
                      setBlockModalState('blocking');
                      setTimeout(() => setBlockModalState('success'), 2500);
                    }}
                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Initiate Block
                  </button>
                </div>
              </>
            )}

            {blockModalState === 'blocking' && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-6 mx-auto"></div>
                <h2 className="text-xl font-bold text-white mb-2">Connecting to Meta API...</h2>
                <p className="text-gray-400">Authenticating and issuing network block request for <span className="font-bold text-white">{attackerId}</span>...</p>
              </div>
            )}

            {blockModalState === 'success' && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
                <div className="bg-green-500/20 p-4 rounded-full mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Attacker Blocked</h2>
                <p className="text-gray-300 mb-8">
                  <span className="font-bold text-red-400">{attackerId}</span> has been permanently blocked across all Instagram, Facebook, and WhatsApp networks.
                </p>
                <button 
                  onClick={() => {
                    setBlockModalState('hidden');
                    const btn = document.getElementById('block-btn');
                    if(btn) {
                      btn.innerText = "✓ Active Block";
                      btn.className = "bg-green-500/20 text-green-500 px-4 py-2 rounded font-bold cursor-not-allowed w-full sm:w-auto";
                      (btn as HTMLButtonElement).disabled = true;
                    }
                  }}
                  className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Call Helpline Modal */}
      {callModalState !== 'hidden' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-gray-900 border border-red-500/50 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center">
            
            {callModalState === 'connecting' && (
              <div className="py-8">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-red-500/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 border-4 border-red-500/40 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 border-4 border-red-500 rounded-full flex items-center justify-center bg-red-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Establishing Secure Line...</h2>
                <p className="text-gray-400">Connecting directly to the National Cyber Crime Helpline (1930) and local jurisdiction cell...</p>
              </div>
            )}

            {callModalState === 'connected' && (
              <div className="py-8 animate-fade-in-up">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Secure Connection Established</h2>
                <p className="text-gray-300 mb-6">
                  You are now connected to the Officer on Duty. They are receiving your real-time RAKSHA AI threat assessment payload.
                </p>
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 mb-8 inline-block">
                  <p className="text-red-500 font-mono text-xl animate-pulse">00:03</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase">Live Call Duration</p>
                </div>
                <button 
                  onClick={() => setCallModalState('hidden')}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.415-1.414L6.524 5.11a6 6 0 018.368 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                  Disconnect Secure Line
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm animate-fade-in-up">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Account Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Full Name</label>
                <div className="bg-black/50 border border-gray-800 rounded p-3 text-white mt-1">{storedName}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Contact Identifier</label>
                <div className="bg-black/50 border border-gray-800 rounded p-3 text-white mt-1">{email || "Verified Secure"}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Security Level</label>
                <div className="bg-black/50 border border-gray-800 rounded p-3 text-green-400 mt-1 flex items-center gap-2">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                  Maximum Protection (Active)
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* My Threat Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm animate-fade-in-up">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl max-w-lg w-full">
            <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              My Threat Reports
            </h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              <div className="bg-black/50 border border-gray-800 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded font-bold">HIGH RISK</span>
                  <span className="text-xs text-gray-500">Today, 10:42 AM</span>
                </div>
                <p className="text-white text-sm font-semibold mb-1">Deepfake Extortion Attempt</p>
                <p className="text-xs text-gray-400">Media mapped to user profile. 99% AI signature detected. Reported to portal.</p>
              </div>
              
              <div className="bg-black/50 border border-gray-800 p-4 rounded-xl opacity-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded font-bold">RESOLVED</span>
                  <span className="text-xs text-gray-500">Oct 12, 2026</span>
                </div>
                <p className="text-white text-sm font-semibold mb-1">Suspicious Link Analysis</p>
                <p className="text-xs text-gray-400">Phishing attempt blocked via RAKSHA interceptor.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowReportsModal(false)}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      </div>

      {/* Official PDF Report (Only visible when printing) */}
      <div className="hidden print:block absolute top-0 left-0 w-full bg-white text-black p-8 z-[100] min-h-screen">
        <div className="flex justify-between items-center border-b-4 border-red-600 pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900">RAKSHA</h1>
            <p className="text-lg text-gray-600 font-bold tracking-widest">CYBER THREAT EVIDENCE REPORT</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="mb-8 bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Case Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Reporting User:</strong> {storedName}</div>
            <div><strong>Attacker Details:</strong> {reportAttacker}</div>
            <div><strong>Platform:</strong> Meta (Cross-Network)</div>
            <div><strong>Report ID:</strong> {reportId || 'PENDING'}</div>
          </div>
        </div>

        <div className="mb-8 bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Evidentiary Material</h2>
          <div className="space-y-4">
            {text && (
              <div>
                <strong className="text-sm">Threatening Message / Transcript:</strong>
                <p className="mt-2 bg-white border border-gray-200 p-4 rounded text-sm italic">
                  &quot;{text}&quot;
                </p>
              </div>
            )}
            {file && (
              <div>
                <strong className="text-sm">Media File Associated with Threat:</strong>
                <p className="text-xs text-gray-500 mb-2">Filename: {file.name}</p>
                <div className="bg-white border border-gray-200 p-2 rounded inline-block">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="Evidence" className="max-h-64 object-contain" />
                  ) : file.type.startsWith('audio/') ? (
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      <audio controls src={URL.createObjectURL(file)} className="mt-2" />
                      <span className="text-xs text-gray-500 mt-2">[ Audio Voice Note Evidence ]</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 text-gray-500 text-center">[ {file.type || 'Document'} File attached to official digital record ]</div>
                  )}
                </div>
              </div>
            )}
            {!text && !file && (
              <p className="text-sm text-gray-500 italic">No media or text was provided during this scan.</p>
            )}
          </div>
        </div>

        {result && (
          <div className="mb-8">
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">AI Analysis Results</h2>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 border border-gray-200 rounded text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Deepfake Prob.</div>
                <div className={`text-2xl font-black ${result.deepfake_score > 50 ? 'text-red-600' : 'text-green-600'}`}>{result.deepfake_score}%</div>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200 rounded text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Extortion Intent</div>
                <div className={`text-2xl font-black ${result.extortion_score > 50 ? 'text-red-600' : 'text-green-600'}`}>{result.extortion_score}%</div>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-200 rounded text-center">
                <div className="text-gray-500 text-xs font-bold uppercase mb-1">Overall Risk</div>
                <div className={`text-2xl font-black ${result.risk_score >= 80 ? 'text-red-600' : 'text-green-600'}`}>{result.risk_score}/100</div>
              </div>
            </div>
            
            <div className="bg-red-50 p-6 border-l-4 border-red-600">
              <h3 className="font-bold text-red-800 mb-2">Automated Threat Reasoning:</h3>
              <p className="text-gray-800 text-sm leading-relaxed">{result.reasoning}</p>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-xs text-gray-400 border-t border-gray-200 pt-8">
          <p>This report was generated automatically by the RAKSHA Sentinel AI System.</p>
          <p>Please attach this document when filing a report at <strong>cybercrime.gov.in</strong> or submitting to local authorities.</p>
        </div>
      </div>

    </>
  );
}
