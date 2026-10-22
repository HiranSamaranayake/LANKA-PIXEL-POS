import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SupabaseSetupModal } from '../common/SupabaseSetupModal';

export const LoginView: React.FC = () => {
  const { signIn, resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);

    if (!isConfigured) {
      setErrorMsg(
        'Database connection is not yet configured. Please click "Server Setup" below or configure environment credentials.'
      );
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter both your corporate email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);

    if (!email) {
      setErrorMsg('Please enter your registered corporate email address.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      setResetSuccessMsg(
        `A password reset link has been dispatched to ${email}. Please check your inbox.`
      );
      setIsResetMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* =========================================================================
          ANIMATED PASTEL ABSTRACT ARTWORK BACKGROUND (Behind all UI elements)
          Palette: Soft Sky Blue, Pale Lavender, White, Pale Cyan, Subtle Pastel Pink
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Ambient Pastel Base Mesh */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(circle at 14% 18%, #EAF4FF 0%, transparent 45%), radial-gradient(circle at 86% 14%, #F0ECFF 0%, transparent 46%), radial-gradient(circle at 48% 84%, #E8FBFF 0%, transparent 50%), radial-gradient(circle at 88% 86%, #FFF0F5 0%, transparent 42%), #FAFCFF',
          }}
        />

        {/* 1. Translucent Gradient Orb - Soft Sky Blue (Top Left) */}
        <div className="absolute -top-20 -left-20 w-96 sm:w-[520px] h-96 sm:h-[520px] rounded-full bg-gradient-to-br from-[#EAF4FF] via-[#DBEAFE]/65 to-[#BFDBFE]/25 blur-3xl opacity-75 animate-lp-blob-1" />

        {/* 2. Translucent Gradient Orb - Pale Lavender (Top Right) */}
        <div className="absolute top-1/5 -right-24 w-96 sm:w-[480px] h-96 sm:h-[480px] rounded-full bg-gradient-to-bl from-[#F0ECFF] via-[#E9D5FF]/55 to-[#DDD6FE]/25 blur-3xl opacity-70 animate-lp-blob-2" />

        {/* 3. Translucent Gradient Orb - Pale Cyan (Bottom Left) */}
        <div className="absolute -bottom-24 left-1/5 w-80 sm:w-[460px] h-80 sm:h-[460px] rounded-full bg-gradient-to-tr from-[#E8FBFF] via-[#CFFAFE]/55 to-[#BAE6FD]/25 blur-3xl opacity-70 animate-lp-blob-3" />

        {/* 4. Translucent Gradient Orb - Subtle Pastel Pink (Bottom Right) */}
        <div className="absolute bottom-4 -right-16 w-80 sm:w-[400px] h-80 sm:h-[400px] rounded-full bg-gradient-to-tl from-[#FFF0F5] via-[#FCE7F3]/55 to-[#FBCFE8]/20 blur-3xl opacity-60 animate-lp-blob-4" />

        {/* Flowing SVG Vector Waves, Organic Curves & Delicate Dot Pattern */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1600 1000"
        >
          <defs>
            {/* Delicate Dot Matrix Pattern */}
            <pattern id="lp-bg-dots" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#2563EB" opacity="0.055" />
            </pattern>

            {/* Translucent Wave Gradient 1 */}
            <linearGradient id="lp-curve-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.38" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.14" />
            </linearGradient>

            {/* Translucent Wave Gradient 2 */}
            <linearGradient id="lp-curve-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F472B6" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.1" />
            </linearGradient>

            {/* Translucent Top Surface Wave */}
            <linearGradient id="lp-soft-surface" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EAF4FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EAF4FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Dot Matrix Layer */}
          <rect width="100%" height="100%" fill="url(#lp-bg-dots)" />

          {/* Soft Top Surface Wave Ribbon */}
          <path
            d="M-50,140 C280,40 540,240 880,130 C1220,20 1460,210 1680,110 L1680,0 L-50,0 Z"
            fill="url(#lp-soft-surface)"
          />

          {/* Upper Flowing Curved Ribbon (with subtle sway) */}
          <g className="animate-lp-wave opacity-85">
            <path
              d="M-80,220 C260,80 500,360 840,210 C1180,60 1420,310 1700,180"
              fill="none"
              stroke="url(#lp-curve-grad-1)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Complementary Delicate Dashed Line */}
            <path
              d="M-60,280 C280,140 520,420 860,270 C1200,120 1440,370 1720,240"
              fill="none"
              stroke="url(#lp-curve-grad-1)"
              strokeWidth="1.1"
              strokeDasharray="6 8"
              opacity="0.6"
            />
          </g>

          {/* Lower Flowing Curved Ribbon */}
          <path
            d="M-100,740 C240,580 620,850 1060,680 C1400,540 1660,760 1900,630"
            fill="none"
            stroke="url(#lp-curve-grad-2)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Delicate Geometric Orbits & Coordinate Accents */}
          <g opacity="0.35">
            <circle
              cx="320"
              cy="460"
              r="135"
              stroke="#93C5FD"
              strokeWidth="0.9"
              strokeDasharray="4 6"
              fill="none"
            />
            <circle
              cx="320"
              cy="460"
              r="68"
              stroke="#C4B5FD"
              strokeWidth="0.75"
              strokeDasharray="3 5"
              fill="none"
            />
            <circle cx="320" cy="325" r="3" fill="#2563EB" opacity="0.55" />
            <circle cx="455" cy="460" r="2.5" fill="#60A5FA" opacity="0.5" />
            <path d="M 314 460 H 326 M 320 454 V 466" stroke="#2563EB" strokeWidth="1.1" />
          </g>

          <g opacity="0.28">
            <circle
              cx="1340"
              cy="280"
              r="115"
              stroke="#60A5FA"
              strokeWidth="0.9"
              strokeDasharray="5 7"
              fill="none"
            />
            <path d="M 1334 280 H 1346 M 1340 274 V 286" stroke="#2563EB" strokeWidth="1.1" />
          </g>
        </svg>

        {/* Floating CSS Geometric Orbits & Accents */}
        <div className="absolute top-12 left-10 w-64 h-64 rounded-full border border-dashed border-blue-300/30 animate-lp-spin-slow pointer-events-none hidden md:block" />
        <div className="absolute bottom-24 left-1/4 w-7 h-7 rounded-lg rotate-45 border border-indigo-200/40 bg-white/35 backdrop-blur-xs animate-lp-float pointer-events-none hidden lg:block" />
        <div className="absolute top-1/4 right-12 w-9 h-9 rounded-full border border-pink-200/50 bg-pink-50/30 backdrop-blur-xs animate-lp-float-subtle pointer-events-none hidden lg:block" />
      </div>

      {/* =========================================================================
          FOREGROUND CONTENT: 100% UNCHANGED LAYOUT, TEXT, AND FUNCTIONALITY
         ========================================================================= */}

      {/* Brand Header with Authentic Logo */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block p-2 bg-white rounded-2xl shadow-sm border border-gray-200/80 mb-4 transition-transform hover:scale-105 duration-300">
          <img
            src="/logo.png"
            alt="Lanka Pixel Creations"
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain rounded-xl"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
          LANKA PIXEL CREATIONS
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="h-px w-6 bg-blue-300" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Enterprise Management System
          </p>
          <span className="h-px w-6 bg-blue-300" />
        </div>
      </div>

      <div className="relative z-10 mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Sleek Enterprise Login Card */}
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-lg shadow-blue-900/5 border border-gray-200/80 rounded-2xl relative">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                {isResetMode ? 'Password Recovery' : 'Staff Sign In'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isResetMode
                  ? 'Enter your corporate email to receive reset instructions'
                  : 'Access your portal with authorized credentials'}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {resetSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{resetSuccessMsg}</span>
            </div>
          )}

          {!isResetMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@lankapixel.lk"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#111827]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-[#2563EB] hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block animate-spin mr-1">⟳</span>
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">
                  Registered Staff Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@lankapixel.lk"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-blue-100 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 font-semibold transition-colors cursor-pointer"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Dispatching...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              Corporate portal for authorized Lanka Pixel Creations personnel only.
            </p>
          </div>
        </div>

        {/* Discreet administrative setup option */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSetupOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-medium cursor-pointer"
          >
            <Settings className="h-3 w-3" />
            <span>Database Connection Settings</span>
          </button>
        </div>

        {/* Setup assistant modal */}
        <SupabaseSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
      </div>
    </div>
  );
};

