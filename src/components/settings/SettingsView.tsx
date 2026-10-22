import React, { useState } from 'react';
import { Building2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface SettingsViewProps {
  currentRole: UserRole;
  onOpenSetup?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentRole }) => {
  const { profile, user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (!supabase) {
      setPasswordMsg({ type: 'error', text: 'Authentication service is not available.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg({ type: 'error', text: error.message });
      } else {
        setPasswordMsg({ type: 'success', text: 'Your account password has been updated successfully.' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      setPasswordMsg({ type: 'error', text: err instanceof Error ? err.message : 'Password update failed' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
        <h3 className="text-sm font-bold text-[#111827]">Company & Account Settings</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Corporate entity profile, security credentials, and system configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Profile */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
            <Building2 className="h-4 w-4 text-[#2563EB]" />
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Company Legal Entity
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Company Legal Name</label>
              <input
                type="text"
                disabled
                value="LANKA PIXEL CREATIONS (PVT) LTD"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 font-bold text-[#111827]"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">Base Currency</label>
              <input
                type="text"
                disabled
                value="Sri Lankan Rupee (LKR - Rs.)"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">Operating Timezone</label>
              <input
                type="text"
                disabled
                value="Asia/Colombo (GMT+5:30)"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-700 font-medium"
              />
            </div>

            <div className="pt-2 border-t border-[#E5E7EB]">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>System Modules Status:</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Daily Advertising Budget Excluded
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Account & Password Reset */}
        <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
            <Lock className="h-4 w-4 text-[#2563EB]" />
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Your Staff Account & Security
            </h4>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-[#E5E7EB] space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name:</span>
              <span className="font-bold text-[#111827]">{profile?.full_name || 'Staff Member'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-mono text-gray-700">{profile?.email || user?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned Role:</span>
              <span className="font-semibold text-[#2563EB]">{currentRole}</span>
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-blue-50 border border-blue-200 text-blue-800'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs pt-1">
            <h5 className="font-semibold text-[#111827]">Change Your Password</h5>

            <div>
              <label className="block text-gray-500 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA]"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA]"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

