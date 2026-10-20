import React from 'react';
import { FileText, PlusCircle, CheckCircle, Calendar } from 'lucide-react';
import type { DailyPostCount, NavigationModule } from '../../types';
import { formatDate } from '../../utils/formatters';

interface DesignerDashboardProps {
  todayStr: string;
  currentMonthStr: string;
  myPostCounts: DailyPostCount[];
  designerName: string;
  onNavigate: (module: NavigationModule) => void;
  onOpenLogPost: () => void;
}

export const DesignerDashboard: React.FC<DesignerDashboardProps> = ({
  todayStr,
  currentMonthStr,
  myPostCounts,
  designerName,
  onNavigate,
  onOpenLogPost,
}) => {
  // Designer's completed posts today
  const todayEntry = myPostCounts.find((p) => p.date === todayStr);
  const postsToday = todayEntry ? todayEntry.completed_posts : 0;

  // Designer's month total posts
  const monthEntries = myPostCounts.filter((p) => p.date.startsWith(currentMonthStr));
  const postsThisMonth = monthEntries.reduce((acc, curr) => acc + curr.completed_posts, 0);

  return (
    <div className="space-y-6">
      {/* Designer Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full mb-1">
            Studio Designer Workspace
          </span>
          <h2 className="text-lg font-bold text-[#111827]">
            Welcome, {designerName}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Log your daily completed graphic design posts and review your production records.
          </p>
        </div>

        <button
          onClick={onOpenLogPost}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-2xs shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{todayEntry ? 'Update Today\'s Count' : 'Log Today\'s Posts'}</span>
        </button>
      </div>

      {/* Summary Cards (Only post count metrics, ZERO financial data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Posts */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Today's Completed Posts</span>
            <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {postsToday} <span className="text-xs font-normal text-gray-400">posts</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {todayEntry ? (
              <span className="text-blue-600 font-medium inline-flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Recorded for {formatDate(todayStr)}
              </span>
            ) : (
              'Not recorded yet for today'
            )}
          </p>
        </div>

        {/* Current Month Posts */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">This Month's Completed Posts</span>
            <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {postsThisMonth} <span className="text-xs font-normal text-gray-400">posts</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Across {monthEntries.length} production day{monthEntries.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Daily Guideline Card */}
        <div className="bg-[#EFF6FF] p-5 rounded-xl border border-blue-100 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-[#2563EB] mb-1">Production Guidelines</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ensure all posts meet Lanka Pixel Creations quality standards before marking them completed.
            </p>
          </div>
          <button
            onClick={() => onNavigate('posts')}
            className="mt-3 text-xs font-semibold text-[#2563EB] hover:underline self-start"
          >
            View Full Production History &gt;
          </button>
        </div>
      </div>

      {/* Designer's Own Recent Post Count History */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Your Recent Post Count Log
            </h4>
            <p className="text-[11px] text-gray-400">
              Only your verified entries are displayed
            </p>
          </div>
          <button
            onClick={() => onNavigate('posts')}
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View All Entries &gt;
          </button>
        </div>

        {myPostCounts.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400">
            No daily post counts logged yet. Click "Log Today's Posts" to enter your completed posts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-gray-400">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-center">Completed Posts</th>
                  <th className="pb-2 font-medium">Notes / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {myPostCounts.slice(0, 7).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="py-2.5 text-gray-600 whitespace-nowrap">
                      {formatDate(entry.date)}
                      {entry.date === todayStr && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-bold text-[#111827]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold">
                        {entry.completed_posts} posts
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {entry.notes || '—'}
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
