import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { IncomeCategory, IncomeTransaction } from '../../types';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (income: IncomeTransaction) => void;
  referenceDate: string;
  recordedBy: string;
}

const CATEGORIES: IncomeCategory[] = [
  'Social Media Marketing',
  'Video Production',
  'Branding & Identity',
  'Package Retainer',
  'Motion Graphics',
  'UI/UX Design',
  'Print Media',
];

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onAddIncome,
  referenceDate,
  recordedBy,
}) => {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Social Media Marketing');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash' | 'Online Gateway' | 'Cheque'>('Bank Transfer');
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [date, setDate] = useState(referenceDate);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount || Number(amount) <= 0) return;

    const newIncome: IncomeTransaction = {
      id: `inc-${Date.now()}`,
      date: date || referenceDate,
      clientName: clientName.trim(),
      projectName: projectName.trim() || 'General Creative Services',
      amount: Number(amount),
      category,
      paymentMethod,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      recordedBy,
      notes: notes.trim() || undefined,
    };

    onAddIncome(newIncome);
    // Reset form
    setClientName('');
    setProjectName('');
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Client Income"
      subtitle="Add received settlement or pending invoice into company revenue"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Client / Company Name *
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Ceylon Hospitality Group"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Project / Deliverable Details
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. 30 Social Media Posts + 4 Reel Videos"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Amount (LKR - Rs.) *
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncomeCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as 'Bank Transfer' | 'Cash' | 'Online Gateway' | 'Cheque'
                )
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online Gateway">Online Gateway</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Paid' | 'Pending')}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Paid">Settled (Paid)</option>
              <option value="Pending">Pending Payment</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Internal Note / Reference
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bank slip verified or Commercial Bank branch transfer"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
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
            Save Income Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};
