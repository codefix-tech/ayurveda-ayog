import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { sendOtpApi } from '../services/api';
import { Leaf, Mail, Lock, KeyRound, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'email-otp'
  
  // Password mode states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email OTP mode states
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Common UI states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Read query params for Quick Login from Footer
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const emailParam = params.get('email');
    
    if (mode === 'otp') {
      setLoginMode('email-otp');
    }
    if (emailParam) {
      setOtpEmail(emailParam);
    }
  }, [location.search]);

  // Handle Resend Countdown Timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Standard Email & Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Send Email OTP handler
  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const normalized = otpEmail.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!normalized || !emailRegex.test(normalized)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtpApi({ email: normalized, purpose: 'login' });
      if (res.success) {
        setOtpSent(true);
        setResendTimer(30);
        setSuccessMsg(res.message || `OTP sent to ${normalized}`);
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error sending verification email');
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-box OTP inputs
  const handleOtpChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-advance focus to next input
    if (cleanChar && index < 5) {
      const nextInput = document.getElementById(`email-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`email-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify Email OTP submit
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const normalized = otpEmail.toLowerCase().trim();
      const data = await loginWithOtp(normalized, fullOtp);
      
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-emerald-100/80">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-sm">
            <Leaf size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-[#152420] font-serif">Welcome Back</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
            Sign in to manage your appointments, orders, and wellness profile
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 border border-gray-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setLoginMode('password'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition ${
              loginMode === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('email-otp'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
              loginMode === 'email-otp' ? 'bg-[#152420] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Gmail / Email OTP</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: PASSWORD LOGIN */}
        {loginMode === 'password' && (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="pl-10 w-full px-4 py-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="pl-10 w-full px-4 py-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-[#152420] hover:bg-[#1f352f] transition disabled:opacity-70 mt-4 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in to Account'}
            </button>
          </form>
        )}

        {/* MODE 2: GMAIL / EMAIL OTP LOGIN */}
        {loginMode === 'email-otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendEmailOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email / Gmail Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      className="pl-10 w-full px-4 py-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium"
                      placeholder="you@gmail.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">A 6-digit verification code will be sent to your Gmail inbox</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition disabled:opacity-70 mt-4 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>Send 6-Digit Email OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                  <span>Enter 6-digit code sent to <strong className="text-gray-900">{otpEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpDigits(['', '', '', '', '', '']); }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Change Email
                  </button>
                </div>

                {/* 6-box OTP digits */}
                <div className="flex justify-between gap-2 my-4">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`email-otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e.key)}
                      className="w-12 h-14 text-center text-lg font-mono font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none transition shadow-xs"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition disabled:opacity-70 mt-4 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify Code & Sign In'}
                </button>

                <div className="text-center pt-2">
                  {resendTimer > 0 ? (
                    <span className="text-xs text-gray-400">Resend email in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Resend Email OTP
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* Demo Admin Auto-fill Credentials Box */}
        <div className="mt-6 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">Demo Admin Access</span>
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setEmail('admin@ayurveda.com');
                setPassword('adminpassword123');
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs hover:bg-emerald-50 transition cursor-pointer"
            >
              ⚡ Auto-Fill Admin
            </button>
          </div>
          <p className="text-[11px] text-emerald-800">
            <strong>Email:</strong> admin@ayurveda.com &bull; <strong>Password:</strong> adminpassword123
          </p>
        </div>

        <div className="mt-6 text-center text-xs">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
