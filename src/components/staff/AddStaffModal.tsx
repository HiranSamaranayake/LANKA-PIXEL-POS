import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { StaffMember, UserRole } from '../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (staff: StaffMember) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onAddStaff,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Designer');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState<'Administration' | 'Customer Care & Sales' | 'Creative Studio'>('Creative Studio');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave' | 'Remote'>('Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      role,
      designation: designation.trim() || `${role}`,
      department,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@lankapixel.lk`,
      phone: phone.trim() || '+94 77 000 0000',
      status,
      joinDate: new Date().toISOString().split('T')[0],
      activeProjectsCount: 2,
      avatarColor: 'from-blue-600 to-sky-500',
    };

    onAddStaff(newStaff);
    setName('');
    setDesignation('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member"
      subtitle="Onboard staff member to Lanka Pixel Creations"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ruwanthi Perera"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value as UserRole;
                setRole(r);
                if (r === 'Admin') setDepartment('Administration');
                else if (r === 'Call Center Operator') setDepartment('Customer Care & Sales');
                else setDepartment('Creative Studio');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Admin">Admin</option>
              <option value="Call Center Operator">Call Center Operator</option>
              <option value="Designer">Designer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) =>
                setDepartment(
                  e.target.value as 'Administration' | 'Customer Care & Sales' | 'Creative Studio'
                )
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Creative Studio">Creative Studio</option>
              <option value="Customer Care & Sales">Customer Care & Sales</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Job Title / Designation
          </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Visual Brand Stylist / Motion Graphic Designer"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@lankapixel.lk"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Mobile Contact
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+94 7X XXX XXXX"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Work Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Active' | 'On Leave' | 'Remote')}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="Active">Active In-Studio</option>
            <option value="Remote">Remote Specialist</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            Save Staff Member
          </button>
        </div>
      </form>
    </Modal>
  );
};
