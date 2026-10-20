import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { DesignerDailyOutput, StaffMember } from '../../types';

interface LogOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogOutput: (output: DesignerDailyOutput) => void;
  designers: StaffMember[];
  referenceDate: string;
}

export const LogOutputModal: React.FC<LogOutputModalProps> = ({
  isOpen,
  onClose,
  onLogOutput,
  designers,
  referenceDate,
}) => {
  const [designerId, setDesignerId] = useState(designers[0]?.id || '');
  const [date, setDate] = useState(referenceDate);
  const [graphicPosts, setGraphicPosts] = useState('6');
  const [videos, setVideos] = useState('1');
  const [targetGraphicPosts, setTargetGraphicPosts] = useState('6');
  const [targetVideos, setTargetVideos] = useState('1');
  const [clientProjects, setClientProjects] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDesigner = designers.find((d) => d.id === designerId) || designers[0];
    if (!selectedDesigner) return;

    const newOutput: DesignerDailyOutput = {
      id: `out-${Date.now()}`,
      designerId: selectedDesigner.id,
      designerName: selectedDesigner.name,
      date: date || referenceDate,
      graphicPosts: Math.max(0, parseInt(graphicPosts) || 0),
      videos: Math.max(0, parseInt(videos) || 0),
      targetGraphicPosts: Math.max(0, parseInt(targetGraphicPosts) || 0),
      targetVideos: Math.max(0, parseInt(targetVideos) || 0),
      clientProjects: clientProjects
        ? clientProjects.split(',').map((p) => p.trim())
        : ['General Studio Output'],
      notes: notes.trim() || undefined,
    };

    onLogOutput(newOutput);
    // Reset
    setNotes('');
    setClientProjects('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Designer Daily Output"
      subtitle="Track completed graphic posts and video deliverables for the day"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Select Designer *
          </label>
          <select
            value={designerId}
            onChange={(e) => setDesignerId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {designers.map((designer) => (
              <option key={designer.id} value={designer.id}>
                {designer.name} ({designer.designation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Production Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Graphic Posts and Videos inputs */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Graphic Posts
            </h4>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Completed Posts Today *
              </label>
              <input
                type="number"
                min="0"
                value={graphicPosts}
                onChange={(e) => setGraphicPosts(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Daily Target Goal
              </label>
              <input
                type="number"
                min="0"
                value={targetGraphicPosts}
                onChange={(e) => setTargetGraphicPosts(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 border-l border-slate-800 pl-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Video Productions / Reels
            </h4>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Completed Videos Today *
              </label>
              <input
                type="number"
                min="0"
                value={videos}
                onChange={(e) => setVideos(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Daily Target Goal
              </label>
              <input
                type="number"
                min="0"
                value={targetVideos}
                onChange={(e) => setTargetVideos(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Client Projects (Comma separated)
          </label>
          <input
            type="text"
            value={clientProjects}
            onChange={(e) => setClientProjects(e.target.value)}
            placeholder="e.g. Ceylon Tea Haven, Apex Logistics, Serendib Jewels"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Deliverable Notes / Links
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Final approved drive export uploaded and client reviewed"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
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
            Record Output Log
          </button>
        </div>
      </form>
    </Modal>
  );
};
