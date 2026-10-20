import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  FileText,
  Users,
  PlusCircle,
} from 'lucide-react';
import type {
  IncomeRecord,
  ExpenseRecord,
  DailyPostCount,
  UserProfile,
  NavigationModule,
} from '../../types';
import { formatLKR, formatDate } from '../../utils/formatters';

interface AdminDashboardProps {
  todayStr: string;
  currentMonthStr: string;
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  postCounts: DailyPostCount[];
  staffList: UserProfile[];
  onNavigate: (module: NavigationModule) => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenLogPost: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  todayStr,
  currentMonthStr,
  incomes,
  expenses,
  postCounts,
  staffList,
  onNavigate,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenLogPost,
}) => {
  // Calculations from actual data
  // 1. Today calculations
  const todayIncomes = incomes.filter((i) => i.date === todayStr);
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayIncomeTotal = todayIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const todayExpenseTotal = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const todayNet = todayIncomeTotal - todayExpenseTotal;

  // 2. Monthly calculations (matching YYYY-MM)
  const monthIncomes = incomes.filter((i) => i.date.startsWith(currentMonthStr));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
  const monthIncomeTotal = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpenseTotal = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const monthNet = monthIncomeTotal - monthExpenseTotal;

  // 3. Today's total completed posts
  const todayPosts = postCounts.filter((p) => p.date === todayStr);
  const todayPostsTotal = todayPosts.reduce((acc, curr) => acc + curr.completed_posts, 0);

  // 4. Active staff count
  const activeStaffCount = staffList.filter((s) => s.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* 8 Required Admin Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Today's Financial Overview ({formatDate(todayStr)})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddIncome}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-2xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>+ Income</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors shadow-2xs"
            >
              <PlusCircle className="h-3.5 w-3.5 text-gray-400" />
              <span>+ Expense</span>
            </button>
            <button
              onClick={onOpenLogPost}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors shadow-2xs"
            >
              <FileText className="h-3.5 w-3.5 text-gray-400" />
              <span>+ Post Count</span>
            </button>
          </div>
        </div>

        {/* Top 3 Today Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Today Income */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Today's Total Income</span>
              <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-[#111827] mt-1">
              {formatLKR(todayIncomeTotal)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {todayIncomes.length} transaction{todayIncomes.length === 1 ? '' : 's'} recorded today
            </p>
          </div>

          {/* Card 2: Today Expenses */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Today's Total Expenses</span>
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-[#111827] mt-1">
              {formatLKR(todayExpenseTotal)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {todayExpenses.length} expense record{todayExpenses.length === 1 ? '' : 's'} today
            </p>
          </div>

          {/* Card 3: Today Operational Net */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Today's Operational Net</span>
              <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-xl font-bold mt-1 ${todayNet >= 0 ? 'text-[#111827]' : 'text-gray-700'}`}>
              {formatLKR(todayNet)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Income minus Expenses</p>
          </div>
        </div>
      </div>

      {/* Monthly & Operational Cards */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Current Month Overview & Productivity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 4: Month Total Income */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">
              Month's Total Income
            </span>
            <div className="text-lg font-bold text-[#111827]">
              {formatLKR(monthIncomeTotal)}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Cumulative MTD</p>
          </div>

          {/* Card 5: Month Total Expenses */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">
              Month's Total Expenses
            </span>
            <div className="text-lg font-bold text-[#111827]">
              {formatLKR(monthExpenseTotal)}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Operating costs</p>
          </div>

          {/* Card 6: Month Operational Net */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">
              Month's Operational Net
            </span>
            <div className="text-lg font-bold text-[#111827]">
              {formatLKR(monthNet)}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Total Inflows − Outflows</p>
          </div>

          {/* Card 7: Today Total Completed Posts */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Today's Completed Posts</span>
              <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
            </div>
            <div className="text-lg font-bold text-[#111827]">
              {todayPostsTotal} <span className="text-xs font-normal text-gray-400">posts</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Studio designers</p>
          </div>

          {/* Card 8: Active Staff Count */}
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Active Staff Members</span>
              <Users className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="text-lg font-bold text-[#111827]">
              {activeStaffCount} <span className="text-xs font-normal text-gray-400">active</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Team accounts</p>
          </div>
        </div>
      </div>

      {/* Recent Income & Recent Expenses Simple Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incomes */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <div>
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Recent Daily Income
              </h4>
              <p className="text-[11px] text-gray-400">Latest recorded income receipts</p>
            </div>
            <button
              onClick={() => onNavigate('income')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View All &gt;
            </button>
          </div>

          {incomes.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No income entries recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-gray-400">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Source / Service</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {incomes.slice(0, 5).map((inc) => (
                    <tr key={inc.id} className="hover:bg-gray-50">
                      <td className="py-2.5 text-gray-600 whitespace-nowrap">
                        {formatDate(inc.date)}
                      </td>
                      <td className="py-2.5 font-medium text-[#111827]">
                        {inc.source}
                        {inc.client_project && (
                          <span className="text-gray-400 text-[11px] block">
                            {inc.client_project}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#111827] whitespace-nowrap">
                        {formatLKR(inc.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
            <div>
              <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Recent Expenses
              </h4>
              <p className="text-[11px] text-gray-400">Latest operating expenditures</p>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View All &gt;
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No expense records recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-gray-400">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {expenses.slice(0, 5).map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50">
                      <td className="py-2.5 text-gray-600 whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-2.5 text-[#111827]">
                        <span className="font-medium">{exp.category}</span>
                        <span className="text-gray-400 text-[11px] block truncate max-w-[200px]">
                          {exp.description}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#111827] whitespace-nowrap">
                        {formatLKR(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Today's Designer Output Quick Row */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Today's Graphic Post Count per Designer
            </h4>
            <p className="text-[11px] text-gray-400">
              Daily completed deliverables logged for {formatDate(todayStr)}
            </p>
          </div>
          <button
            onClick={() => onNavigate('posts')}
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            Manage All Posts &gt;
          </button>
        </div>

        {todayPosts.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-500">
            No designer post counts logged yet for today ({formatDate(todayStr)}).
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {todayPosts.map((post) => (
              <div
                key={post.id}
                className="p-3 rounded-lg border border-[#E5E7EB] bg-gray-50/50 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#111827] truncate">
                    {post.designer_name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {post.notes || 'Studio Output'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-[#2563EB]">
                    {post.completed_posts}
                  </span>
                  <span className="text-[10px] text-gray-400 block">posts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
