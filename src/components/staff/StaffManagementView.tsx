import React, { useState } from 'react';
import { Users, PlusCircle, ShieldCheck, Headphones, Brush, UserX, UserCheck, Search } from 'lucide-react';
import type { UserProfile, UserRole } from '../../types';

interface StaffManagementViewProps {
  staffList: UserProfile[];
  onOpenAddStaff: () => void;
  onUpdateRole: (id: string, newRole: UserRole) => Promise<void>;
  onToggleStatus: (id: string, currentStatus: 'Active' | 'Deactivated') => Promise<void>;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  staffList,
  onOpenAddStaff,
  onUpdateRole,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === 'All' ? true : s.role === roleFilter;
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const adminCount = staffList.filter((s) => s.role === 'Admin').length;
  const operatorCount = staffList.filter((s) => s.role === 'Call Center Operator').length;
  const designerCount = staffList.filter((s) => s.role === 'Designer').length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1D4ED8] font-bold text-[11px]">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </span>
        );
      case 'Call Center Operator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
            <Headphones className="h-3 w-3" />
            Call Center
          </span>
        );
      case 'Designer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 font-semibold text-[11px]">
            <Brush className="h-3 w-3" />
            Designer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Total Staff Accounts</span>
            <Users className="h-4 w-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {staffList.length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Stored in Supabase PostgreSQL
          </p>
        </div>

        {/* Admins */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-gray-500 font-semibold block mb-1">
            Administrators
          </span>
          <div className="text-2xl font-bold text-[#111827] mt-1">{adminCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Full system authorization</p>
        </div>

        {/* Call Center */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-gray-500 font-semibold block mb-1">
            Call Center Operators
          </span>
          <div className="text-2xl font-bold text-[#111827] mt-1">{operatorCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Daily income recording</p>
        </div>

        {/* Designers */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs text-gray-500 font-semibold block mb-1">
            Designers
          </span>
          <div className="text-2xl font-bold text-[#111827] mt-1">{designerCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Daily post deliverables</p>
        </div>
      </div>

      {/* Control Bar & Add Staff Button */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA]"
          />
        </div>

        {/* Role Filter & Add Button */}
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#60A5FA]"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Call Center Operator">Call Center Operator</option>
            <option value="Designer">Designer</option>
          </select>

          <button
            onClick={onOpenAddStaff}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-2xs shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#2563EB]" />
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Staff Directory & Account Management ({filteredStaff.length})
            </h4>
          </div>
          <p className="text-[11px] text-gray-400">
            Passwords are never stored in plaintext or displayed in this table
          </p>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            No staff accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3">Employee Name</th>
                  <th className="px-5 py-3">Work Email</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Account Status</th>
                  <th className="px-5 py-3 text-right">Role & Access Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#111827] whitespace-nowrap">
                      {staff.full_name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                      {staff.email}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getRoleBadge(staff.role)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Change Selector */}
                        <select
                          value={staff.role}
                          onChange={(e) => onUpdateRole(staff.id, e.target.value as UserRole)}
                          className="px-2 py-1 rounded border border-[#E5E7EB] text-[11px] text-gray-700 font-medium focus:outline-none focus:border-[#60A5FA]"
                          title="Change Staff Role"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Call Center Operator">Call Center Operator</option>
                          <option value="Designer">Designer</option>
                        </select>

                        {/* Deactivate / Reactivate button */}
                        <button
                          onClick={() => onToggleStatus(staff.id, staff.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors ${
                            staff.status === 'Active'
                              ? 'border-gray-200 text-gray-600 hover:text-red-700 hover:bg-red-50'
                              : 'border-blue-200 text-[#2563EB] hover:bg-blue-50'
                          }`}
                        >
                          {staff.status === 'Active' ? (
                            <>
                              <UserX className="h-3 w-3" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3" />
                              <span>Reactivate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
