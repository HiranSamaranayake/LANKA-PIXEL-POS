import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type { UserRole } from '../../types';
import { Badge } from '../common/Badge';

interface SettingsViewProps {
  currentRole: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentRole }) => {
  const [companyName, setCompanyName] = useState('LANKA PIXEL CREATIONS (PVT) LTD');
  const [regNo, setRegNo] = useState('PV 00294812');
  const [address, setAddress] = useState('Colombo 03, Western Province, Sri Lanka');
  const [email, setEmail] = useState('contact@lankapixel.lk');
  const [phone, setPhone] = useState('+94 11 234 5678');
  const currency = 'LKR (Rs.)';
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue">Enterprise Settings</Badge>
            <span className="text-xs text-slate-400">
              Active Role: <span className="text-white font-medium">{currentRole}</span> • Core Configuration
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Company Profile & Operational Preferences
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage company registration credentials, default financial metrics, and operational modules
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Profile Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Registered Corporate Entity Details
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Company Registration Number
                </label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Registered Studio / Office Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Official Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Base Reporting Currency
                </label>
                <input
                  type="text"
                  disabled
                  value={currency}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-blue-400 text-xs font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Fixed to Sri Lankan Rupee (LKR)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Financial Net Calculation Engine
                </label>
                <input
                  type="text"
                  disabled
                  value="Operational Net = Income − Expenses"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Computed dynamically across daily, weekly, monthly ranges
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* System Policies & Module Integrity */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                System Scope & Requirements
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-white block mb-0.5">
                  Core Calculation Modules
                </span>
                <p className="text-slate-400 text-[11px]">
                  Daily, weekly, and monthly calculations for Income, Expenses, and Operational Net
                  are active.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-white block mb-0.5">
                  Designer Output Tracking
                </span>
                <p className="text-slate-400 text-[11px]">
                  Individual daily tracking for completed graphic posts and video productions per
                  designer is enforced.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="font-semibold text-blue-300 block mb-0.5">
                  Role Preparation
                </span>
                <p className="text-slate-300 text-[11px]">
                  Ready for Admin, Call Center Operator, and Designer roles.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-0.5">
                  Excluded Module Notice
                </span>
                <p className="text-slate-500 text-[11px]">
                  Daily Advertising Budget module is strictly excluded per project specifications.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-xl text-xs text-slate-400">
            <div className="font-bold text-white mb-1">Lanka Pixel Management Platform</div>
            <div>React 19 • Vite • TypeScript • Tailwind CSS</div>
            <div className="text-[11px] text-blue-400 mt-1">Application Shell Active (Phase 1)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
