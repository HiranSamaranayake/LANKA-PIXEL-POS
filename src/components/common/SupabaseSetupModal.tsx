import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, X, KeyRound } from 'lucide-react';
import { saveSupabaseConfig, isSupabaseConfigured } from '../../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(
    localStorage.getItem('lp_supabase_url') || (import.meta.env.VITE_SUPABASE_URL as string) || ''
  );
  const [anonKey, setAnonKey] = useState(
    localStorage.getItem('lp_supabase_anon_key') ||
      (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
      ''
  );
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) return;
    saveSupabaseConfig(url, anonKey);
  };

  const copySqlSchema = () => {
    const sql = `-- Run this in your Supabase SQL Editor:
-- See supabase_schema.sql in the project root for the complete script with RLS policies!`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">
                Database & Cloud Infrastructure Configuration
              </h3>
              <p className="text-xs text-gray-500">
                LANKA PIXEL CREATIONS (PVT) LTD Management Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 border-b border-[#E5E7EB] flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'credentials'
                ? 'border-[#60A5FA] text-[#2563EB]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            1. Enter Credentials
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'sql'
                ? 'border-[#60A5FA] text-[#2563EB]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            2. Database Schema & RLS Setup
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-700">
          {activeTab === 'credentials' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3.5 rounded-lg bg-[#EFF6FF] border border-blue-100 text-gray-800">
                <div className="font-semibold text-[#111827] mb-1 flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-[#2563EB]" />
                  <span>Current Connection Status:</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                      isSupabaseConfigured
                        ? 'bg-blue-100 text-[#1D4ED8]'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isSupabaseConfigured ? 'Configured & Active' : 'Not Connected'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600">
                  You can set these in your project's <code>.env</code> file as{' '}
                  <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, or save
                  them here directly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Supabase Project URL *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xxxxxxxxxxxx.supabase.co"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs font-mono text-[#111827] focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Supabase Anon Public Key *
                </label>
                <input
                  type="password"
                  required
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs font-mono text-[#111827] focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Found in your Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API
                  keys &gt; "anon public". Never use the service-role key.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold transition-colors shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Copy and run the SQL migration in your Supabase Project's <strong>SQL Editor</strong> to create the <code>profiles</code>, <code>income_records</code>, <code>expense_records</code>, and <code>daily_post_counts</code> tables with complete Row Level Security (RLS).
                </p>
                <button
                  onClick={copySqlSchema}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 font-semibold text-gray-700 shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Script Path'}</span>
                </button>
              </div>

              <div className="p-3 bg-gray-900 text-gray-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56">
                <code>
                  {`-- A complete schema has been written to:
-- c:\\Users\\hiran\\OneDrive\\Desktop\\LankaPixelManagement\\supabase_schema.sql
--
-- Tables:
-- 1. profiles (id, email, full_name, role, status)
-- 2. income_records (id, date, source, client_project, amount, description, recorded_by)
-- 3. expense_records (id, date, category, description, amount, recorded_by)
-- 4. daily_post_counts (id, date, designer_id, designer_name, completed_posts, notes)
-- 5. company_settings
--
-- Includes RLS policies ensuring Designers only see their own daily post counts.`}
                </code>
              </div>

              <div className="text-[11px] text-gray-500 pt-2 flex items-center justify-between">
                <span>The schema file <code>supabase_schema.sql</code> is ready in your project directory.</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#2563EB] font-semibold hover:underline"
                >
                  <span>Open Supabase Dashboard</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
