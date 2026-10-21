import React, { useState } from 'react';
import { PlusCircle, Search, Edit2, Trash2, Calendar, FileText, User } from 'lucide-react';
import type { DailyPostCount, UserProfile, UserRole } from '../../types';
import { formatDate, getColomboToday, getCurrentMonthString } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface DailyPostCountViewProps {
  postCounts: DailyPostCount[];
  designers: UserProfile[];
  currentRole: UserRole;
  onOpenLogPost: () => void;
  onEditPost: (post: DailyPostCount) => void;
  onDeletePost: (id: string) => Promise<void>;
}

export const DailyPostCountView: React.FC<DailyPostCountViewProps> = ({
  postCounts,
  designers,
  currentRole,
  onOpenLogPost,
  onEditPost,
  onDeletePost,
}) => {
  const { user, profile } = useAuth();
  const todayStr = getColomboToday();
  const currentMonthStr = getCurrentMonthString();

  const [filterDate, setFilterDate] = useState<string>('');
  const [filterDesigner, setFilterDesigner] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Restrict records for Designer: they only see their own!
  const permittedRecords =
    currentRole === 'Designer'
      ? postCounts.filter(
          (p) => p.designer_id === user?.id || p.designer_name === profile?.full_name
        )
      : postCounts;

  // Active date for calculation
  const activeDate = filterDate || todayStr;

  // 1. Calculate each designer's daily total for active date
  const designerDailyTotals: Record<string, number> = {};
  permittedRecords
    .filter((p) => p.date === activeDate)
    .forEach((p) => {
      designerDailyTotals[p.designer_name] =
        (designerDailyTotals[p.designer_name] || 0) + p.completed_posts;
    });

  const totalPostsOnActiveDate = Object.values(designerDailyTotals).reduce(
    (acc, curr) => acc + curr,
    0
  );

  // 2. Calculate Total Posts for the current month
  const monthlyRecords = permittedRecords.filter((p) =>
    p.date.startsWith(currentMonthStr)
  );
  const totalPostsThisMonth = monthlyRecords.reduce(
    (acc, curr) => acc + curr.completed_posts,
    0
  );

  // Filtered list for table
  const filteredList = permittedRecords.filter((item) => {
    const matchesDate = filterDate ? item.date === filterDate : true;
    const matchesDesigner =
      filterDesigner === 'All' ? true : item.designer_name === filterDesigner;
    const matchesSearch =
      item.designer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDate && matchesDesigner && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post count entry?')) {
      await onDeletePost(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Date Total */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">
              {filterDate ? `Completed on ${formatDate(filterDate)}` : `Today's Completed Posts`}
            </span>
            <FileText className="h-4 w-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {totalPostsOnActiveDate} <span className="text-sm font-normal text-gray-400">posts</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {currentRole === 'Designer'
              ? 'Your completed graphic posts'
              : 'Studio-wide completed graphic posts'}
          </p>
        </div>

        {/* Current Month Total */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Current Month Completed Posts</span>
            <Calendar className="h-4 w-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {totalPostsThisMonth} <span className="text-sm font-normal text-gray-400">posts</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            MTD creative deliverable count
          </p>
        </div>

        {/* Quick Log Button Card */}
        <div className="bg-[#EFF6FF] p-5 rounded-xl border border-blue-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#2563EB] mb-1">Log Daily Deliverables</h4>
            <p className="text-xs text-gray-600">
              Enter verified completed graphic posts for the selected date.
            </p>
          </div>
          <button
            onClick={onOpenLogPost}
            className="mt-3 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-2xs w-full sm:w-auto self-stretch sm:self-start"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Log Daily Post Count</span>
          </button>
        </div>
      </div>

      {/* Per-Designer Daily Total Breakdown (Admin view) */}
      {currentRole === 'Admin' && Object.keys(designerDailyTotals).length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Each Designer's Total for {formatDate(activeDate)}
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(designerDailyTotals).map(([name, count]) => (
              <div
                key={name}
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs flex items-center gap-2"
              >
                <span className="font-semibold text-[#111827]">{name}:</span>
                <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-bold">
                  {count} posts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes or designer name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#60A5FA]"
          />
        </div>

        {/* Date Filter & Designer Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {currentRole === 'Admin' && (
            <select
              value={filterDesigner}
              onChange={(e) => setFilterDesigner(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#60A5FA]"
            >
              <option value="All">All Designers</option>
              {designers.map((d) => (
                <option key={d.id} value={d.full_name}>
                  {d.full_name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#60A5FA]"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="px-2.5 py-2 rounded-lg border border-[#E5E7EB] text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table of Daily Post Counts */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#2563EB]" />
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Daily Post Count History ({filteredList.length})
            </h4>
          </div>
          <div className="text-xs text-gray-500">
            Total Completed Posts:{' '}
            <span className="font-bold text-[#111827]">
              {filteredList.reduce((acc, curr) => acc + curr.completed_posts, 0)} posts
            </span>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            No daily post count records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Designer</th>
                  <th className="px-5 py-3 text-center">Completed Posts</th>
                  <th className="px-5 py-3">Client Projects / Notes</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap font-medium text-gray-900">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#111827] flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span>{item.designer_name}</span>
                    </td>
                    <td className="px-5 py-3 text-center whitespace-nowrap">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold">
                        {item.completed_posts} posts
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-[280px]">
                      {item.notes || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditPost(item)}
                          className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Post Count"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {currentRole === 'Admin' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
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
