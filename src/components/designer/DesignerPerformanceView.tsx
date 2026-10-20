import React, { useState } from 'react';
import {
  Palette,
  Video,
  PlusCircle,
  Award,
  Sparkles,
  Search,
  CheckCircle,
  Clock,
} from 'lucide-react';
import type { DesignerDailyOutput, StaffMember, UserRole } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface DesignerPerformanceViewProps {
  designerOutputs: DesignerDailyOutput[];
  designers: StaffMember[];
  currentRole: UserRole;
  referenceDate: string;
  onOpenLogOutput: () => void;
  onDeleteOutput: (id: string) => void;
}

export const DesignerPerformanceView: React.FC<DesignerPerformanceViewProps> = ({
  designerOutputs,
  designers,
  currentRole,
  referenceDate,
  onOpenLogOutput,
  onDeleteOutput,
}) => {
  const [selectedDesignerId, setSelectedDesignerId] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Daily totals for today (referenceDate)
  const todayOutputs = designerOutputs.filter((o) => o.date === referenceDate);
  const totalGraphicsToday = todayOutputs.reduce((acc, curr) => acc + curr.graphicPosts, 0);
  const totalVideosToday = todayOutputs.reduce((acc, curr) => acc + curr.videos, 0);
  const totalTargetGraphicsToday = todayOutputs.reduce((acc, curr) => acc + curr.targetGraphicPosts, 0);
  const totalTargetVideosToday = todayOutputs.reduce((acc, curr) => acc + curr.targetVideos, 0);

  // Filtered log entries
  const filteredOutputs = designerOutputs.filter((out) => {
    const matchesDesigner =
      selectedDesignerId === 'All' || out.designerId === selectedDesignerId;
    const matchesSearch =
      out.designerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      out.clientProjects.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (out.notes && out.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDesigner && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Highlights */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="blue" dot>
                Daily Studio Metrics
              </Badge>
              <span className="text-xs text-slate-400">Date: {formatDate(referenceDate)}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Designer Daily Output & Productivity Tracking
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Strict tracking of daily completed graphic posts and video deliverables for every creative artist
            </p>
          </div>

          <button
            onClick={onOpenLogOutput}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all self-start md:self-auto active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Log Daily Production Output</span>
          </button>
        </div>

        {/* Aggregate Studio Daily Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Graphics Today */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Completed Graphic Posts</span>
              <Palette className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black text-white">{totalGraphicsToday}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Target: <span className="text-white font-medium">{totalTargetGraphicsToday} posts</span>
            </div>
          </div>

          {/* Videos Today */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Completed Videos / Reels</span>
              <Video className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{totalVideosToday}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Target: <span className="text-white font-medium">{totalTargetVideosToday} videos</span>
            </div>
          </div>

          {/* Graphics Achievement Rate */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Graphics Target Pace</span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-sky-400">
              {totalTargetGraphicsToday > 0
                ? Math.round((totalGraphicsToday / totalTargetGraphicsToday) * 100)
                : 100}
              %
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Daily quota fulfillment</div>
          </div>

          {/* Video Achievement Rate */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider">Video Target Pace</span>
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-blue-400">
              {totalTargetVideosToday > 0
                ? Math.round((totalVideosToday / totalTargetVideosToday) * 100)
                : 100}
              %
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Daily video reel quota</div>
          </div>
        </div>
      </div>

      {/* Per Designer Today Status Cards */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
          Active Designers • Today's Progress ({todayOutputs.length} Recorded)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {designers.map((designer) => {
            const todayRecord = todayOutputs.find((o) => o.designerId === designer.id);
            const graphics = todayRecord ? todayRecord.graphicPosts : 0;
            const targetGraphics = todayRecord ? todayRecord.targetGraphicPosts : 6;
            const videos = todayRecord ? todayRecord.videos : 0;
            const targetVideos = todayRecord ? todayRecord.targetVideos : 1;

            const graphicRatio = Math.min(100, Math.round((graphics / (targetGraphics || 1)) * 100));
            const videoRatio = Math.min(100, Math.round((videos / (targetVideos || 1)) * 100));

            return (
              <div
                key={designer.id}
                className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${designer.avatarColor} flex items-center justify-center font-bold text-white text-sm shadow-md ring-1 ring-white/20`}
                    >
                      {designer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{designer.name}</h4>
                      <p className="text-[11px] text-blue-400">{designer.designation}</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    {/* Graphic Posts */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                          <Palette className="h-3.5 w-3.5 text-sky-400" />
                          Graphic Posts:
                        </span>
                        <span className="font-bold text-white">
                          {graphics} / {targetGraphics}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-sky-400 rounded-full transition-all duration-500"
                          style={{ width: `${graphicRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* Videos */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                          <Video className="h-3.5 w-3.5 text-blue-400" />
                          Videos / Reels:
                        </span>
                        <span className="font-bold text-white">
                          {videos} / {targetVideos}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${videoRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {todayRecord ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Logged for Today
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending Log
                      </span>
                    )}
                  </span>
                  <button
                    onClick={onOpenLogOutput}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    + Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Output Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/30">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Production Log History
            </h3>
            <p className="text-[11px] text-slate-400">
              Detailed breakdown of daily graphics and video deliveries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search brief or note..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedDesignerId}
              onChange={(e) => setSelectedDesignerId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Designers</option>
              {designers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Designer</th>
                <th className="px-4 py-3 text-center">Completed Graphic Posts</th>
                <th className="px-4 py-3 text-center">Completed Videos</th>
                <th className="px-4 py-3">Client Projects / Brief</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOutputs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No output records found.
                  </td>
                </tr>
              ) : (
                filteredOutputs.map((out) => (
                  <tr key={out.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-white">{formatDate(out.date)}</td>

                    <td className="px-4 py-3.5 font-semibold text-blue-300">
                      {out.designerName}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                        <Palette className="h-3 w-3" />
                        {out.graphicPosts}{' '}
                        <span className="text-slate-500 font-normal">
                          / {out.targetGraphicPosts}
                        </span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        <Video className="h-3 w-3" />
                        {out.videos}{' '}
                        <span className="text-slate-500 font-normal">/ {out.targetVideos}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {out.clientProjects.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 max-w-[200px] truncate">
                      {out.notes || '—'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {currentRole === 'Admin' && (
                        <button
                          onClick={() => onDeleteOutput(out.id)}
                          className="text-slate-500 hover:text-rose-400 text-[11px] transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
