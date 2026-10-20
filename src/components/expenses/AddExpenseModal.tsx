import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { ExpenseCategory, ExpenseTransaction } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: ExpenseTransaction) => void;
  referenceDate: string;
  approvedBy: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Software & Subscriptions',
  'Office & Utilities',
  'Hardware & Equipment',
  'Freelance Contractors',
  'Internet & Communication',
  'Office Welfare & Refreshments',
  'Logistics & Courier',
  'Legal & Compliance',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  referenceDate,
  approvedBy,
}) => {
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Software & Subscriptions');
  const [paymentMethod, setPaymentMethod] = useState<'Corporate Card' | 'Bank Transfer' | 'Petty Cash'>('Corporate Card');
  const [date, setDate] = useState(referenceDate);
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || !amount || Number(amount) <= 0) return;

    const newExpense: ExpenseTransaction = {
      id: `exp-${Date.now()}`,
      date: date || referenceDate,
      vendor: vendor.trim(),
      description: description.trim() || 'General operational cost',
      amount: Number(amount),
      category,
      paymentMethod,
      receiptRef: receiptRef.trim() || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      approvedBy,
      notes: notes.trim() || undefined,
    };

    onAddExpense(newExpense);
    // Reset form
    setVendor('');
    setDescription('');
    setAmount('');
    setReceiptRef('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Operational Expense"
      subtitle="Log studio overhead, software tools, equipment, or contractor payments"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Vendor / Payee Name *
          </label>
          <input
            type="text"
            required
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. Adobe Systems, Dialog Axiata, CEB"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Description / Item Details
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Monthly creative cloud subscription or studio internet"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
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
              placeholder="45000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Expense Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
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
              Expense Date
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
                  e.target.value as 'Corporate Card' | 'Bank Transfer' | 'Petty Cash'
                )
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="Corporate Card">Corporate Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Petty Cash">Petty Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Receipt / Bill Ref
            </label>
            <input
              type="text"
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              placeholder="e.g. REC-8921"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Notes / Approval Remarks
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Approved for studio production equipment upgrade"
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
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            Record Expense
          </button>
        </div>
      </form>
    </Modal>
  );
};
