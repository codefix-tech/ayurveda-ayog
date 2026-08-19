import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { sendOtpApi } from '../services/api';
import { Leaf, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, KeyRound, RefreshCw } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email OTP verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Resend Timer Countdown
  useEffect(() => {
    let timer = null;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Client-side form validation
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@domain.com)';
    }

    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(?:(?:\+|00)91)?([6-9]\d{9})$/;
    if (!cleanPhone) {
      errors.phone = 'Mobile number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Trigger Email OTP Verification
  const handleTriggerEmailOtp = async () => {
    setFieldErrors({});
    setError('');
    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(normalizedEmail)) {
      setFieldErrors({ email: 'Please enter a valid email address before verifying.' });
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await sendOtpApi({ email: normalizedEmail, purpose: 'register' });
      if (res.success) {
        setShowOtpModal(true);
        setResendTimer(30);
      } else {
        setError(res.message || 'Could not send verification email');
      }
    } catch (err) {
      setError('Network error sending verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    if (cleanChar && index < 5) {
      const nextInput = document.getElementById(`reg-email-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    setOtpLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp: fullOtp, purpose: 'register' })
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailVerified(true);
        setShowOtpModal(false);
      } else {
        setOtpError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setOtpError('Verification request failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), phone.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-emerald-100/80">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mb-4 shadow-sm">
            <Leaf size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-[#152420] font-serif">Create Account</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Join Ayurveda Arogya for personalized Ayurvedic consultations & remedies
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className={`pl-10 w-full px-4 py-3 text-xs border rounded-xl outline-none transition ${
                  fieldErrors.name ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="e.g. Nishant Kumar"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                }}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email Address with Verification Badge */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700">Email Address *</label>
              {isEmailVerified ? (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Email Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerEmailOtp}
                  disabled={otpLoading}
                  className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  {otpLoading ? 'Sending...' : 'Verify Email via OTP'}
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className={`pl-10 w-full px-4 py-3 text-xs border rounded-xl outline-none transition ${
                  fieldErrors.email ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailVerified(false);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                }}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                required
                className={`pl-10 w-full px-4 py-3 text-xs border rounded-xl outline-none transition ${
                  fieldErrors.phone ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null });
                }}
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password (Min 6 characters) *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className={`pl-10 w-full px-4 py-3 text-xs border rounded-xl outline-none transition ${
                  fieldErrors.password ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                }}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className={`pl-10 w-full px-4 py-3 text-xs border rounded-xl outline-none transition ${
                  fieldErrors.confirmPassword ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-emerald-500'
                }`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
                }}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-xs sm:text-sm font-bold text-white bg-[#152420] hover:bg-[#1b2f28] focus:outline-none transition disabled:opacity-70 mt-6 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Log in here
          </Link>
        </div>
      </div>

      {/* Email OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-serif">Verify Email Address</h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to <strong className="text-gray-900">{email}</strong>
            </p>

            {otpError && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg text-red-600 text-xs font-semibold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleConfirmOtp} className="mt-4 space-y-4">
              <div className="flex justify-between gap-1.5">
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    id={`reg-email-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-10 h-12 text-center text-base font-mono font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
                >
                  {otpLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>

              {resendTimer > 0 ? (
                <p className="text-[11px] text-gray-400">Resend email in {resendTimer}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerEmailOtp}
                  className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Resend Verification Email
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
