import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
} from 'lucide-react';
import type { ExpenseTransaction, OverallCalculations, UserRole } from '../../types';
import { formatLKR, formatDate } from '../../utils/formatters';

interface ExpensesViewProps {
  expenses: ExpenseTransaction[];
  calculations: OverallCalculations;
  currentRole: UserRole;
  referenceDate: string;
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  calculations,
  currentRole,
  referenceDate,
  onOpenAddExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.receiptRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;

    let matchesTime = true;
    if (timeFilter === 'daily') {
      matchesTime = exp.date === referenceDate;
    } else if (timeFilter === 'weekly') {
      const refTime = new Date(referenceDate).getTime();
      const expTime = new Date(exp.date).getTime();
      const diffDays = (refTime - expTime) / (1000 * 60 * 60 * 24);
      matchesTime = diffDays >= 0 && diffDays < 7;
    } else if (timeFilter === 'monthly') {
      const [y1, m1] = exp.date.split('-');
      const [y2, m2] = referenceDate.split('-');
      matchesTime = y1 === y2 && m1 === m2;
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  const totalFilteredAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Three expenses calculation stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Expenses */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Daily Total Expenses
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
              Today
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatLKR(calculations.daily.expenses)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Operational spending settled on {formatDate(referenceDate)}
          </p>
        </div>

        {/* Weekly Expenses */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Weekly Total Expenses
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
              7-Day Window
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatLKR(calculations.weekly.expenses)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            7-day rolling studio overhead and operational expenses
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Monthly Total Expenses
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
              October 2026
            </span>
          </div>
          <div className="text-2xl font-black text-slate-200">
            {formatLKR(calculations.monthly.expenses)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Accumulated monthly operational expenditure
          </p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor, receipt reference, or purpose..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {(['all', 'daily', 'weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  timeFilter === period
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Software & Subscriptions">Software & Subscriptions</option>
            <option value="Office & Utilities">Office & Utilities</option>
            <option value="Hardware & Equipment">Hardware & Equipment</option>
            <option value="Freelance Contractors">Freelance Contractors</option>
            <option value="Internet & Communication">Internet & Communication</option>
            <option value="Office Welfare & Refreshments">Office Welfare & Refreshments</option>
            <option value="Logistics & Courier">Logistics & Courier</option>
            <option value="Legal & Compliance">Legal & Compliance</option>
          </select>

          {currentRole !== 'Designer' && (
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-rose-400" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Expense Vouchers & Outflows ({filteredExpenses.length})
            </span>
          </div>
          <div className="text-xs text-slate-300 font-semibold">
            Filtered Subtotal:{' '}
            <span className="text-rose-400 font-bold">{formatLKR(totalFilteredAmount)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Receipt & Date</th>
                <th className="px-4 py-3">Vendor & Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Approved By</th>
                <th className="px-4 py-3 text-right">Amount (LKR)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No expense records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-white">{exp.receiptRef}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(exp.date)}</div>
                    </td>

                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="font-semibold text-white truncate">{exp.vendor}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {exp.description}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 text-[11px]">
                        {exp.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-300">{exp.paymentMethod}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">
                      {exp.approvedBy}
                    </td>

                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-200">
                      -{formatLKR(exp.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {currentRole === 'Admin' && (
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="text-slate-500 hover:text-rose-400 text-[11px] font-medium transition-colors"
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
