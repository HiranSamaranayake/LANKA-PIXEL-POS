import React, { useState } from 'react';
import {
  Download,
  PieChart,
  Palette,
  Video,
} from 'lucide-react';
import type {
  OverallCalculations,
  IncomeTransaction,
  ExpenseTransaction,
  DesignerDailyOutput,
} from '../../types';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface ReportsViewProps {
  calculations: OverallCalculations;
  incomes: IncomeTransaction[];
  expenses: ExpenseTransaction[];
  designerOutputs: DesignerDailyOutput[];
  referenceDate: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  calculations,
  incomes,
  expenses,
  designerOutputs,
  referenceDate,
}) => {
  const [reportWindow, setReportWindow] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const selectedMetrics = calculations[reportWindow];
  const marginPercent =
    selectedMetrics.income > 0
      ? Math.round((selectedMetrics.net / selectedMetrics.income) * 100)
      : 0;

  // Total graphics and videos across all time
  const totalGraphicsEver = designerOutputs.reduce((acc, curr) => acc + curr.graphicPosts, 0);
  const totalVideosEver = designerOutputs.reduce((acc, curr) => acc + curr.videos, 0);

  // Category breakdown for income
  const categoryTotals: Record<string, number> = {};
  incomes.forEach((i) => {
    categoryTotals[i.category] = (categoryTotals[i.category] || 0) + i.amount;
  });

  // Category breakdown for expenses
  const expenseCategoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseCategoryTotals[e.category] = (expenseCategoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" dot>
              Financial Intelligence
            </Badge>
            <span className="text-xs text-slate-400">Lanka Pixel Creations (Pvt) Ltd</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Financial & Studio Performance Statement
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time automated reconciliation of daily, weekly, and monthly operational net
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setReportWindow('daily')}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                reportWindow === 'daily'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setReportWindow('weekly')}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                reportWindow === 'weekly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportWindow('monthly')}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                reportWindow === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-all"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            <span>Print / Export</span>
          </button>
        </div>
      </div>

      {/* Primary Statement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Income */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {reportWindow} Gross Inflow
          </span>
          <div className="text-2xl font-black text-white">
            {formatLKR(selectedMetrics.income)}
          </div>
          <span className="text-[11px] text-blue-400 mt-2 block">
            Client package & invoice settlements
          </span>
        </div>

        {/* Expenses */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {reportWindow} Operational Cost
          </span>
          <div className="text-2xl font-black text-slate-200">
            {formatLKR(selectedMetrics.expenses)}
          </div>
          <span className="text-[11px] text-rose-400 mt-2 block">
            Studio overhead & contractor costs
          </span>
        </div>

        {/* Operational Net */}
        <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-5">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block mb-1">
            {reportWindow} Operational Net
          </span>
          <div
            className={`text-2xl font-black ${
              selectedMetrics.net >= 0 ? 'text-blue-400' : 'text-rose-400'
            }`}
          >
            {formatLKR(selectedMetrics.net)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Net Surplus (Income − Expenses)
          </span>
        </div>

        {/* Operating Margin */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Operating Net Margin
          </span>
          <div className="text-2xl font-black text-emerald-400">{marginPercent}%</div>
          <span className="text-[11px] text-slate-400 mt-2 block">Efficiency & profitability ratio</span>
        </div>
      </div>

      {/* Comparative Summary Table of All 3 Windows */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Consolidated Ledger Comparison Table
          </h3>
          <p className="text-[11px] text-slate-400">
            Calculated figures for Daily (Today), Weekly (7 Days), and Monthly (Current Month)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Timeframe Window</th>
                <th className="px-6 py-3 text-right">Total Income (LKR)</th>
                <th className="px-6 py-3 text-right">Total Expenses (LKR)</th>
                <th className="px-6 py-3 text-right">Operational Net (LKR)</th>
                <th className="px-6 py-3 text-right">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              <tr className="hover:bg-slate-900/50">
                <td className="px-6 py-4 font-bold text-white">Daily (Today - {formatDate(referenceDate)})</td>
                <td className="px-6 py-4 text-right text-blue-400 font-bold">
                  {formatLKR(calculations.daily.income)}
                </td>
                <td className="px-6 py-4 text-right text-slate-300">
                  {formatLKR(calculations.daily.expenses)}
                </td>
                <td className="px-6 py-4 text-right font-extrabold text-blue-400">
                  {formatLKR(calculations.daily.net)}
                </td>
                <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                  {calculations.daily.income > 0
                    ? Math.round((calculations.daily.net / calculations.daily.income) * 100)
                    : 0}
                  %
                </td>
              </tr>

              <tr className="hover:bg-slate-900/50">
                <td className="px-6 py-4 font-bold text-white">Weekly (Rolling 7-Day Window)</td>
                <td className="px-6 py-4 text-right text-blue-400 font-bold">
                  {formatLKR(calculations.weekly.income)}
                </td>
                <td className="px-6 py-4 text-right text-slate-300">
                  {formatLKR(calculations.weekly.expenses)}
                </td>
                <td className="px-6 py-4 text-right font-extrabold text-blue-400">
                  {formatLKR(calculations.weekly.net)}
                </td>
                <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                  {calculations.weekly.income > 0
                    ? Math.round((calculations.weekly.net / calculations.weekly.income) * 100)
                    : 0}
                  %
                </td>
              </tr>

              <tr className="hover:bg-slate-900/50 bg-blue-950/10">
                <td className="px-6 py-4 font-bold text-blue-300">Monthly (October 2026 MTD)</td>
                <td className="px-6 py-4 text-right text-blue-400 font-bold">
                  {formatLKR(calculations.monthly.income)}
                </td>
                <td className="px-6 py-4 text-right text-slate-300">
                  {formatLKR(calculations.monthly.expenses)}
                </td>
                <td className="px-6 py-4 text-right font-extrabold text-blue-400">
                  {formatLKR(calculations.monthly.net)}
                </td>
                <td className="px-6 py-4 text-right text-emerald-400 font-bold">
                  {calculations.monthly.income > 0
                    ? Math.round((calculations.monthly.net / calculations.monthly.income) * 100)
                    : 0}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue by Stream & Studio Volume Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Revenue Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Revenue Stream Breakdown
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([cat, amt]) => {
              const pct = Math.round((amt / calculations.totalIncome) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="text-blue-400 font-bold">
                      {formatLKR(amt)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Studio Production Totals */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Creative Studio Cumulative Volume
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <Palette className="h-6 w-6 text-sky-400 mx-auto mb-2" />
                <div className="text-3xl font-black text-white">{totalGraphicsEver}</div>
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Graphic Posts Delivered
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <Video className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-black text-white">{totalVideosEver}</div>
                <span className="text-xs text-slate-400 uppercase font-semibold">
                  Videos & Reels Delivered
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Every graphic post and video reel is tracked against daily quota specifications,
              enabling Lanka Pixel Creations to ensure top-tier deliverable velocity.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Verified System Audit</span>
            <span className="text-blue-400 font-medium">Lanka Pixel OS Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};
