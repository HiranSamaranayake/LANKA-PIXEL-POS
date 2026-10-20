import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { ExpenseCategory, ExpenseRecord } from '../../types';
import { getColomboToday } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id' | 'created_at'>) => Promise<void>;
  editingRecord?: ExpenseRecord | null;
  onUpdateExpense?: (id: string, updates: Partial<ExpenseRecord>) => Promise<void>;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Facebook Boosting',
  'Advertising',
  'Salaries',
  'Software',
  'Internet',
  'Electricity',
  'Equipment',
  'Transport',
  'Office Expenses',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  editingRecord,
  onUpdateExpense,
}) => {
  const { profile } = useAuth();

  const [date, setDate] = useState(editingRecord ? editingRecord.date : getColomboToday());
  const [category, setCategory] = useState<ExpenseCategory>(
    editingRecord ? editingRecord.category : 'Facebook Boosting'
  );
  const [description, setDescription] = useState(editingRecord?.description || '');
  const [amount, setAmount] = useState(editingRecord ? String(editingRecord.amount) : '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setCategory(editingRecord.category);
      setDescription(editingRecord.description);
      setAmount(String(editingRecord.amount));
    } else {
      setDate(getColomboToday());
      setCategory('Facebook Boosting');
      setDescription('');
      setAmount('');
    }
    setErrorMsg(null);
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please enter a description for this expense.');
      return;
    }

    setSaving(true);
    try {
      if (editingRecord && onUpdateExpense) {
        await onUpdateExpense(editingRecord.id, {
          date,
          category,
          description: description.trim(),
          amount: numAmount,
        });
      } else {
        await onAddExpense({
          date,
          category,
          description: description.trim(),
          amount: numAmount,
          recorded_by: profile?.full_name || 'Staff Member',
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">
              {editingRecord ? 'Edit Operational Expense' : 'Record Operating Expense'}
            </h3>
            <p className="text-[11px] text-gray-500">
              Lanka Pixel Creations (Pvt) Ltd Expense Voucher
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
          {/* 1. Date */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Expense Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* 2. Expense Category */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA]"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Description */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Meta Ads campaign for Ceylon Tea, Adobe Creative Cloud monthly"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* 4. Amount in LKR */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Amount (LKR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">
                Rs.
              </span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25000"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-sm font-bold text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
              />
            </div>
          </div>

          {/* 5. Recorded By */}
          <div className="p-2.5 rounded-lg bg-gray-50 border border-[#E5E7EB] text-[11px] text-gray-500 flex justify-between">
            <span>Recorded By:</span>
            <span className="font-semibold text-[#111827]">
              {editingRecord ? editingRecord.recorded_by : profile?.full_name || 'Staff Member'}
            </span>
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
              {saving ? 'Saving...' : editingRecord ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
