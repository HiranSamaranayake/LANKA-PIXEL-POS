import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: () => Promise<void>;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onStaffAdded,
}) => {
  const { createStaffAccount } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Designer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter both name and email.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Temporary password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    const { error } = await createStaffAccount(email, password, fullName, role);
    setSaving(false);

    if (error) {
      setErrorMsg(error);
    } else {
      await onStaffAdded();
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('Designer');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">
              Provision Staff Account
            </h3>
            <p className="text-[11px] text-gray-500">
              Create an employee account with Supabase Authentication
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Full Employee Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ruwanthi Perera"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Assigned Corporate Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@lankapixel.lk"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* Assigned Role */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Assigned System Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA]"
            >
              <option value="Admin">Admin (Full access)</option>
              <option value="Call Center Operator">Call Center Operator (Income desk)</option>
              <option value="Designer">Designer (Daily graphic post counts)</option>
            </select>
          </div>

          {/* Temporary Password */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Assigned Temporary Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-9 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Provide this password to the employee. They will use it to sign in and can change it in Settings.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold transition-colors shadow-2xs disabled:opacity-50"
            >
              {saving ? 'Creating Account...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
