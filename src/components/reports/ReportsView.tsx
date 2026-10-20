import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, TrendingDown, Scale, FileText, AlertTriangle } from 'lucide-react';
import type { IncomeRecord, ExpenseRecord, DailyPostCount } from '../../types';
import { formatLKR, formatDate, formatMonth, getCurrentMonthString } from '../../utils/formatters';

interface ReportsViewProps {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  postCounts: DailyPostCount[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  incomes,
  expenses,
  postCounts,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());

  // Filter records by selectedMonth (YYYY-MM)
  const monthIncomes = incomes.filter((i) => i.date.startsWith(selectedMonth));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const monthPosts = postCounts.filter((p) => p.date.startsWith(selectedMonth));

  // Monthly Calculations
  const totalIncome = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const operationalNet = totalIncome - totalExpenses; // Formula: Total Income - Total Expenses
  const totalCompletedPosts = monthPosts.reduce((acc, curr) => acc + curr.completed_posts, 0);

  // Collect all unique dates in this month from income, expense, and post records
  const allDatesSet = new Set<string>();
  monthIncomes.forEach((i) => allDatesSet.add(i.date));
  monthExpenses.forEach((e) => allDatesSet.add(e.date));
  monthPosts.forEach((p) => allDatesSet.add(p.date));

  const sortedDates = Array.from(allDatesSet).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Month Selector & Print Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-2.5 py-0.5 rounded-full mb-1 inline-block">
            Financial & Operational Intelligence
          </span>
          <h2 className="text-lg font-bold text-[#111827]">
            Monthly Financial Performance Statement
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            LANKA PIXEL CREATIONS (PVT) LTD • Period: {formatMonth(selectedMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Select Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:border-[#60A5FA]"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 4 Required Monthly Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Month Total Income */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Total Income</span>
            <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {formatLKR(totalIncome)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {monthIncomes.length} incoming settlements
          </p>
        </div>

        {/* Month Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Total Expenses</span>
            <div className="p-1 rounded-md bg-gray-100 text-gray-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {formatLKR(totalExpenses)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {monthExpenses.length} operational disbursements
          </p>
        </div>

        {/* Month Operational Net (Income - Expenses) */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Operational Net</span>
            <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {formatLKR(operationalNet)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Total Income − Total Expenses</p>
        </div>

        {/* Total Completed Posts */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Completed Posts</span>
            <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {totalCompletedPosts} <span className="text-xs font-normal text-gray-400">posts</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Creative studio deliverables</p>
        </div>
      </div>

      {/* Explicit Accounting Notice */}
      <div className="p-3.5 rounded-xl bg-gray-50 border border-[#E5E7EB] flex items-start gap-2.5 text-xs text-gray-600">
        <AlertTriangle className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#111827]">Financial Accounting Notice:</strong> Operational Net is computed strictly as <span className="font-mono font-semibold">Total Income − Total Expenses</span> based on entries recorded in the system. Do not call this figure final accounting profit because not all possible business costs, taxes, or depreciation may be recorded.
        </p>
      </div>

      {/* Daily Breakdown Comparison Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Daily Breakdown for {formatMonth(selectedMonth)}
            </h4>
            <p className="text-[11px] text-gray-400">
              Daily income, expenses, operational net, and completed posts
            </p>
          </div>
          <div className="text-xs text-gray-500 font-semibold">
            {sortedDates.length} Active Days
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            No financial or post records found for {formatMonth(selectedMonth)}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Daily Income</th>
                  <th className="px-5 py-3 text-right">Daily Expenses</th>
                  <th className="px-5 py-3 text-right">Daily Operational Net</th>
                  <th className="px-5 py-3 text-center">Completed Posts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
                {sortedDates.map((dateStr) => {
                  const dayInc = monthIncomes
                    .filter((i) => i.date === dateStr)
                    .reduce((acc, curr) => acc + curr.amount, 0);
                  const dayExp = monthExpenses
                    .filter((e) => e.date === dateStr)
                    .reduce((acc, curr) => acc + curr.amount, 0);
                  const dayNet = dayInc - dayExp;
                  const dayPosts = monthPosts
                    .filter((p) => p.date === dateStr)
                    .reduce((acc, curr) => acc + curr.completed_posts, 0);

                  return (
                    <tr key={dateStr} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatDate(dateStr)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#111827] whitespace-nowrap">
                        {dayInc > 0 ? formatLKR(dayInc) : <span className="text-gray-300">Rs. 0</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-600 whitespace-nowrap">
                        {dayExp > 0 ? formatLKR(dayExp) : <span className="text-gray-300">Rs. 0</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-[#111827] whitespace-nowrap">
                        {formatLKR(dayNet)}
                      </td>
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        {dayPosts > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[11px]">
                            {dayPosts} posts
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50/70 border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                <tr>
                  <td className="px-5 py-3 uppercase">Total ({formatMonth(selectedMonth)})</td>
                  <td className="px-5 py-3 text-right">{formatLKR(totalIncome)}</td>
                  <td className="px-5 py-3 text-right">{formatLKR(totalExpenses)}</td>
                  <td className="px-5 py-3 text-right">{formatLKR(operationalNet)}</td>
                  <td className="px-5 py-3 text-center">{totalCompletedPosts} posts</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
