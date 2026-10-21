import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { IncomeRecord } from '../../types';
import { getColomboToday } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncome: (income: Omit<IncomeRecord, 'id' | 'created_at'>) => Promise<void>;
  editingRecord?: IncomeRecord | null;
  onUpdateIncome?: (id: string, updates: Partial<IncomeRecord>) => Promise<void>;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onAddIncome,
  editingRecord,
  onUpdateIncome,
}) => {
  const { profile } = useAuth();
  const [date, setDate] = useState(editingRecord ? editingRecord.date : getColomboToday());
  const [source, setSource] = useState(editingRecord ? editingRecord.source : 'Social Media Design Package');
  const [clientProject, setClientProject] = useState(editingRecord?.client_project || '');
  const [amount, setAmount] = useState(editingRecord ? String(editingRecord.amount) : '');
  const [description, setDescription] = useState(editingRecord?.description || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync when editingRecord changes
  React.useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setSource(editingRecord.source);
      setClientProject(editingRecord.client_project || '');
      setAmount(String(editingRecord.amount));
      setDescription(editingRecord.description || '');
    } else {
      setDate(getColomboToday());
      setSource('Social Media Design Package');
      setClientProject('');
      setAmount('');
      setDescription('');
    }
    setErrorMsg(null);
  }, [editingRecord, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    setSaving(true);
    try {
      if (editingRecord && onUpdateIncome) {
        await onUpdateIncome(editingRecord.id, {
          date,
          source,
          client_project: clientProject.trim() || undefined,
          amount: numAmount,
          description: description.trim() || undefined,
        });
      } else {
        await onAddIncome({
          date,
          source,
          client_project: clientProject.trim() || undefined,
          amount: numAmount,
          description: description.trim() || undefined,
          recorded_by: profile?.full_name || 'Staff Member',
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save income record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">
              {editingRecord ? 'Edit Income Record' : 'Record Daily Income'}
            </h3>
            <p className="text-[11px] text-gray-500">
              Lanka Pixel Creations (Pvt) Ltd Income Entry
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
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {/* 1. Date */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* 2. Income Source or Service */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Income Source / Service *
            </label>
            <input
              type="text"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Social Media Design Package, Logo Branding, Web Page"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* 3. Client or Project Name (optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Client or Project Name <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={clientProject}
              onChange={(e) => setClientProject(e.target.value)}
              placeholder="e.g. Serendib Tea Exports, Apex Logistics"
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
                placeholder="45000"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-sm font-bold text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
              />
            </div>
          </div>

          {/* 5. Description (optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Description / Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 50% advance payment received via Commercial Bank transfer"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* 6. Recorded By (info) */}
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
              {saving ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
