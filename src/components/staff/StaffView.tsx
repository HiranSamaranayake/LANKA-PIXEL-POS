import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Headphones,
  Brush,
  PlusCircle,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { StaffMember, UserRole } from '../../types';
import { Badge } from '../common/Badge';

interface StaffViewProps {
  staffList: StaffMember[];
  currentRole: UserRole;
  onOpenAddStaff: () => void;
  onDeleteStaff: (id: string) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staffList,
  currentRole,
  onOpenAddStaff,
  onDeleteStaff,
}) => {
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    return matchesRole && matchesDept;
  });

  const adminCount = staffList.filter((s) => s.role === 'Admin').length;
  const callCenterCount = staffList.filter((s) => s.role === 'Call Center Operator').length;
  const designerCount = staffList.filter((s) => s.role === 'Designer').length;

  return (
    <div className="space-y-6">
      {/* Top Counts & Add Member Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider">Total Team Members</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{staffList.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Lanka Pixel Creations personnel</p>
        </div>

        {/* Administration */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider">Administration</span>
            <ShieldCheck className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400">{adminCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Executive & management oversight</p>
        </div>

        {/* Call Center */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider">Call Center & Client Care</span>
            <Headphones className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-sky-400">{callCenterCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Front desk, inquiries & billing</p>
        </div>

        {/* Creative Studio */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider">Creative Studio</span>
            <Brush className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">{designerCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Designers, video & motion artists</p>
        </div>
      </div>

      {/* Role Permission Matrix Card (Addresses: Prepare for Admin, Call Center Operator, and Designer roles) */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Role Permission Architecture
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Pre-configured role access boundaries for Lanka Pixel Creations (Pvt) Ltd
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admin Role */}
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase">Admin Role</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Full Income & Expense management
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Operational Net & Financial reports
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Staff administration & permissions
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Designer output quota review
              </li>
            </ul>
          </div>

          {/* Call Center Operator */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="h-4 w-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase">Call Center Operator</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Record incoming client payments
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Track invoice settlement statuses
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Client communication & inquiries
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <span className="h-3 w-3 text-rose-500 font-mono text-[10px]">✕</span> Expense deletion restricted
              </li>
            </ul>
          </div>

          {/* Designer */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brush className="h-4 w-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase">Designer</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Daily completed graphic posts log
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Daily completed video production log
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Project brief reviews & links
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <span className="h-3 w-3 text-rose-500 font-mono text-[10px]">✕</span> Financial ledger read-only
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Call Center Operator">Call Center Operator</option>
            <option value="Designer">Designer</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Departments</option>
            <option value="Administration">Administration</option>
            <option value="Customer Care & Sales">Customer Care & Sales</option>
            <option value="Creative Studio">Creative Studio</option>
          </select>
        </div>

        <button
          onClick={onOpenAddStaff}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${staff.avatarColor} flex items-center justify-center font-bold text-white text-sm shadow-md ring-1 ring-white/20`}
                  >
                    {staff.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{staff.name}</h4>
                    <p className="text-[11px] text-blue-400 mt-0.5">{staff.designation}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    staff.status === 'Active'
                      ? 'emerald'
                      : staff.status === 'Remote'
                      ? 'indigo'
                      : 'amber'
                  }
                  size="sm"
                >
                  {staff.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-300 py-3 border-y border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-400">{staff.department}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Joined: {staff.joinDate}
              </span>

              {currentRole === 'Admin' && (
                <button
                  onClick={() => onDeleteStaff(staff.id)}
                  className="text-slate-500 hover:text-rose-400 text-[11px] transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
