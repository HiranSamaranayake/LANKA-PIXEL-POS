import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { DailyPostCount, UserProfile, UserRole } from '../../types';
import { getColomboToday } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface LogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogPost: (post: Omit<DailyPostCount, 'id' | 'created_at'>) => Promise<void>;
  designers: UserProfile[];
  currentRole: UserRole;
  editingRecord?: DailyPostCount | null;
  onUpdatePost?: (id: string, updates: Partial<DailyPostCount>) => Promise<void>;
}

export const LogPostModal: React.FC<LogPostModalProps> = ({
  isOpen,
  onClose,
  onLogPost,
  designers,
  currentRole,
  editingRecord,
  onUpdatePost,
}) => {
  const { user, profile } = useAuth();

  const [date, setDate] = useState(editingRecord ? editingRecord.date : getColomboToday());
  const [designerId, setDesignerId] = useState(
    editingRecord
      ? editingRecord.designer_id
      : currentRole === 'Designer'
      ? user?.id || ''
      : designers[0]?.id || ''
  );
  const [completedPosts, setCompletedPosts] = useState(
    editingRecord ? String(editingRecord.completed_posts) : '6'
  );
  const [notes, setNotes] = useState(editingRecord?.notes || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setDesignerId(editingRecord.designer_id);
      setCompletedPosts(String(editingRecord.completed_posts));
      setNotes(editingRecord.notes || '');
    } else {
      setDate(getColomboToday());
      setDesignerId(
        currentRole === 'Designer'
          ? user?.id || ''
          : designers[0]?.id || ''
      );
      setCompletedPosts('6');
      setNotes('');
    }
    setErrorMsg(null);
  }, [editingRecord, isOpen, currentRole, user, designers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate integer >= 0
    const count = Number(completedPosts);
    if (!Number.isInteger(count) || count < 0) {
      setErrorMsg('Completed posts must be a positive whole number (0, 1, 2, ...). Negative or fractional numbers are not allowed.');
      return;
    }

    // Determine designer name
    let selectedName = profile?.full_name || 'Designer';
    let targetDesignerId = user?.id || '';

    if (currentRole === 'Admin') {
      const found = designers.find((d) => d.id === designerId);
      if (found) {
        selectedName = found.full_name;
        targetDesignerId = found.id;
      }
    } else {
      // Prevent designer from submitting for someone else
      targetDesignerId = user?.id || '';
      selectedName = profile?.full_name || 'Designer';
    }

    setSaving(true);
    try {
      if (editingRecord && onUpdatePost) {
        await onUpdatePost(editingRecord.id, {
          date,
          completed_posts: count,
          notes: notes.trim() || undefined,
        });
      } else {
        await onLogPost({
          date,
          designer_id: targetDesignerId,
          designer_name: selectedName,
          completed_posts: count,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save daily post count');
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
              {editingRecord ? 'Edit Daily Post Count' : 'Log Daily Post Count'}
            </h3>
            <p className="text-[11px] text-gray-500">
              Creative Studio Completed Graphic Posts Entry
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
              Production Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
          </div>

          {/* 2. Designer */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Designer *
            </label>
            {currentRole === 'Admin' ? (
              <select
                value={designerId}
                onChange={(e) => setDesignerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#60A5FA]"
              >
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value={`${profile?.full_name || 'Designer'} (${profile?.email || ''})`}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-600 font-semibold cursor-not-allowed"
              />
            )}
          </div>

          {/* 3. Completed Posts (Integer >= 0) */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Number of Completed Posts *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={completedPosts}
              onChange={(e) => setCompletedPosts(e.target.value)}
              placeholder="e.g. 6"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm font-bold text-[#111827] focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Only completed graphic designs ready for client delivery (whole numbers only).
            </span>
          </div>

          {/* 4. Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Project Brief / Client Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed 4 posts for Serendib Jewels and 2 posts for Ceylon Tea"
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]"
            />
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
              {saving ? 'Saving...' : editingRecord ? 'Update Count' : 'Log Posts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
