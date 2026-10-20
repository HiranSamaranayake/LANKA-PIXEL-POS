import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Database, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        'Supabase is not configured yet. Please click "Configure Supabase" below or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      );
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter both your assigned work email and password.');
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
      setErrorMsg('Please enter your registered staff email address.');
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
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand & Temporary LP Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-xl bg-[#EFF6FF] border border-[#E5E7EB] flex items-center justify-center text-[#2563EB] font-black text-xl tracking-tight shadow-xs">
          LP
        </div>
        <h1 className="mt-4 text-xl font-extrabold text-[#111827] tracking-tight">
          LANKA PIXEL CREATIONS (PVT) LTD
        </h1>
        <p className="mt-1 text-xs text-gray-500 font-medium">
          Company Management & Staff Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Notice if Supabase is not connected */}
        {!isConfigured && (
          <div className="mb-4 p-4 rounded-xl bg-[#EFF6FF] border border-[#60A5FA]/40 text-xs text-gray-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#111827]">
              <Database className="h-4 w-4 text-[#2563EB]" />
              <span>Supabase Connection Required</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Supabase authentication credentials are required to verify staff logins and enforce
              Row Level Security. Please configure your project credentials to enable sign in.
            </p>
            <button
              type="button"
              onClick={() => setIsSetupOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <span>Configure Supabase Credentials</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Login / Reset Card */}
        <div className="bg-white py-8 px-6 shadow-xs border border-[#E5E7EB] rounded-xl sm:px-10">
          <div className="mb-6">
            <h2 className="text-base font-bold text-[#111827]">
              {isResetMode ? 'Reset Account Password' : 'Staff Sign In'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isResetMode
                ? 'Enter your assigned work email to receive password reset instructions'
                : 'Sign in using your assigned corporate credentials'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetSuccessMsg && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {!isResetMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Assigned Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@lankapixel.lk"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#111827]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-[#2563EB] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block animate-spin mr-2">⟳</span>
                  ) : null}
                  <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@lankapixel.lk"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
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
                  className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center">
            <p className="text-[11px] text-gray-500">
              Accounts are provisioned by company administration. Public registration is not permitted.
            </p>
          </div>
        </div>

        {/* Setup assistant modal */}
        <SupabaseSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
      </div>
    </div>
  );
};
