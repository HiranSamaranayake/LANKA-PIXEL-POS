import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
} from 'lucide-react';
import type { IncomeTransaction, OverallCalculations, UserRole } from '../../types';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface IncomeViewProps {
  incomes: IncomeTransaction[];
  calculations: OverallCalculations;
  currentRole: UserRole;
  referenceDate: string;
  onOpenAddIncome: () => void;
  onToggleStatus: (id: string) => void;
  onDeleteIncome: (id: string) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes,
  calculations,
  currentRole,
  referenceDate,
  onOpenAddIncome,
  onToggleStatus,
  onDeleteIncome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const filteredIncomes = incomes.filter((inc) => {
    const matchesSearch =
      inc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || inc.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;

    let matchesTime = true;
    if (timeFilter === 'daily') {
      matchesTime = inc.date === referenceDate;
    } else if (timeFilter === 'weekly') {
      const refTime = new Date(referenceDate).getTime();
      const incTime = new Date(inc.date).getTime();
      const diffDays = (refTime - incTime) / (1000 * 60 * 60 * 24);
      matchesTime = diffDays >= 0 && diffDays < 7;
    } else if (timeFilter === 'monthly') {
      const [y1, m1] = inc.date.split('-');
      const [y2, m2] = referenceDate.split('-');
      matchesTime = y1 === y2 && m1 === m2;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesTime;
  });

  const totalFilteredAmount = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Three income calculation stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Income */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Daily Total Income
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Today
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatLKR(calculations.daily.income)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Inflows settled or billed for {formatDate(referenceDate)}
          </p>
        </div>

        {/* Weekly Income */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Weekly Total Income
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              7-Day Window
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatLKR(calculations.weekly.income)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total studio receipts across the past 7 days
          </p>
        </div>

        {/* Monthly Income */}
        <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Monthly Total Income
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              October 2026
            </span>
          </div>
          <div className="text-2xl font-black text-blue-400">
            {formatLKR(calculations.monthly.income)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Monthly gross revenues for Lanka Pixel Creations
          </p>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client, invoice number, or project description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
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
            <option value="Social Media Marketing">Social Media Marketing</option>
            <option value="Video Production">Video Production</option>
            <option value="Branding & Identity">Branding & Identity</option>
            <option value="Package Retainer">Package Retainer</option>
            <option value="Motion Graphics">Motion Graphics</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Print Media">Print Media</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Settled (Paid)</option>
            <option value="Pending">Pending Payment</option>
          </select>

          <button
            onClick={onOpenAddIncome}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Income Records Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Income Invoices & Settlements ({filteredIncomes.length})
            </span>
          </div>
          <div className="text-xs text-slate-300 font-semibold">
            Filtered Subtotal:{' '}
            <span className="text-blue-400 font-bold">{formatLKR(totalFilteredAmount)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice & Date</th>
                <th className="px-4 py-3">Client & Project</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Recorded By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount (LKR)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No income records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-white">{inc.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(inc.date)}</div>
                    </td>

                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="font-semibold text-white truncate">{inc.clientName}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {inc.projectName}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 text-[11px]">
                        {inc.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-300">{inc.paymentMethod}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">
                      {inc.recordedBy}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onToggleStatus(inc.id)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge variant={inc.status === 'Paid' ? 'emerald' : 'amber'} size="sm" dot>
                          {inc.status}
                        </Badge>
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-right font-extrabold text-blue-400">
                      {formatLKR(inc.amount)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {currentRole === 'Admin' && (
                        <button
                          onClick={() => onDeleteIncome(inc.id)}
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
