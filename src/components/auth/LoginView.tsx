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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/40 via-sky-50/20 to-transparent pointer-events-none -z-10" />

      {/* Brand Header with Authentic Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Sleek Enterprise Login Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg shadow-blue-900/5 border border-gray-200/80 rounded-2xl relative">
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
                    className="text-[11px] text-[#2563EB] hover:text-blue-700 font-semibold transition-colors"
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
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
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
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
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

