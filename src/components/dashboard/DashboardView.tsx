import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Palette,
  Video,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import type {
  IncomeTransaction,
  ExpenseTransaction,
  DesignerDailyOutput,
  OverallCalculations,
  UserRole,
  NavigationModule,
} from '../../types';
import { formatLKR, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface DashboardViewProps {
  calculations: OverallCalculations;
  recentIncomes: IncomeTransaction[];
  recentExpenses: ExpenseTransaction[];
  designerOutputs: DesignerDailyOutput[];
  currentRole: UserRole;
  referenceDate: string;
  onNavigate: (module: NavigationModule) => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenLogOutput: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  calculations,
  recentIncomes,
  recentExpenses,
  designerOutputs,
  currentRole,
  referenceDate,
  onNavigate,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenLogOutput,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const periodData = {
    daily: {
      label: 'Daily (Today)',
      sub: formatDate(referenceDate),
      data: calculations.daily,
    },
    weekly: {
      label: 'Weekly (Last 7 Days)',
      sub: 'Rolling 7-Day Window',
      data: calculations.weekly,
    },
    monthly: {
      label: 'Monthly (October 2026)',
      sub: 'Calendar Month to Date',
      data: calculations.monthly,
    },
  };

  const activePeriod = periodData[selectedPeriod];
  const activeNet = activePeriod.data.net;
  const isNetPositive = activeNet >= 0;
  const netMargin =
    activePeriod.data.income > 0
      ? Math.round((activeNet / activePeriod.data.income) * 100)
      : 0;

  // Today's designers output
  const todayOutputs = designerOutputs.filter((o) => o.date === referenceDate);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Role Context Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-[#0b1220] to-blue-950/40 p-6 shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue" dot>
                System Active
              </Badge>
              <span className="text-xs text-slate-400">
                Lanka Pixel Creations (Pvt) Ltd • Management Console
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {currentRole === 'Admin' && 'Welcome back, Administrator'}
              {currentRole === 'Call Center Operator' && 'Client Care & Reception Desk'}
              {currentRole === 'Designer' && 'Studio Designer Workspace'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {currentRole === 'Admin' &&
                'Monitoring total operational net, daily income inflows, studio overheads, and creative team output.'}
              {currentRole === 'Call Center Operator' &&
                'Manage incoming client package invoices, track verified settlements, and support customer inquiries.'}
              {currentRole === 'Designer' &&
                'Track your daily completed graphic posts and video edits against targets and review project briefs.'}
            </p>
          </div>

          {/* Quick period tab switchers */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setSelectedPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPeriod === 'daily'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setSelectedPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPeriod === 'weekly'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPeriod === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* CORE FINANCIAL CALCULATIONS ROW */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Financial Performance & Operational Net
            </h2>
            <Badge variant="indigo" size="sm">
              {activePeriod.label}
            </Badge>
          </div>
          <span className="text-xs text-slate-400">{activePeriod.sub}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Total Income Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Income ({selectedPeriod})
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatLKR(activePeriod.data.income)}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
              <span className="text-slate-400">Inflows recorded</span>
              <button
                onClick={() => onNavigate('income')}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                Manage Incomes <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Total Expenses Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Expenses ({selectedPeriod})
              </span>
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatLKR(activePeriod.data.expenses)}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
              <span className="text-slate-400">Overhead & disbursements</span>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                View Expenses <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Operational Net (Income - Expenses) Card */}
          <div
            className={`rounded-2xl border p-5 shadow-lg relative overflow-hidden transition-all ${
              isNetPositive
                ? 'border-blue-600/40 bg-gradient-to-br from-[#0c1322] via-[#091124] to-[#07132a]'
                : 'border-rose-900/50 bg-gradient-to-br from-[#140c12] to-[#1a0c10]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                Operational Net (Income - Expenses)
              </span>
              <Badge variant={isNetPositive ? 'emerald' : 'rose'} size="sm">
                {netMargin}% Margin
              </Badge>
            </div>
            <div
              className={`text-2xl font-extrabold tracking-tight ${
                isNetPositive ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {formatLKR(activeNet)}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-3">
              <span className="text-slate-300">
                Formula: <span className="font-mono text-white">Income − Expenses</span>
              </span>
              <span className="font-semibold text-white">
                {isNetPositive ? 'Profitable Run' : 'Deficit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THREE TIME-FRAME COMPARATIVE SUMMARY TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Financial Breakdown Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Direct comparison of daily, weekly, and monthly calculations
            </p>
          </div>
          <Badge variant="blue">LKR Sri Lankan Rupee</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase">Daily Totals</span>
              <span className="text-[11px] text-slate-500">Today</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Income:</span>
                <span className="font-semibold text-white">{formatLKR(calculations.daily.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expenses:</span>
                <span className="font-semibold text-slate-300">{formatLKR(calculations.daily.expenses)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-blue-400">Daily Op. Net:</span>
                <span className={calculations.daily.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatLKR(calculations.daily.net)}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase">Weekly Totals</span>
              <span className="text-[11px] text-slate-500">7-Day Rolling</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Income:</span>
                <span className="font-semibold text-white">{formatLKR(calculations.weekly.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expenses:</span>
                <span className="font-semibold text-slate-300">{formatLKR(calculations.weekly.expenses)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-blue-400">Weekly Op. Net:</span>
                <span className={calculations.weekly.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatLKR(calculations.weekly.net)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Card */}
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-300 uppercase">Monthly Totals</span>
              <span className="text-[11px] text-blue-400">Month to Date</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Income:</span>
                <span className="font-semibold text-white">{formatLKR(calculations.monthly.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expenses:</span>
                <span className="font-semibold text-slate-300">{formatLKR(calculations.monthly.expenses)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
                <span className="text-blue-400">Monthly Op. Net:</span>
                <span className={calculations.monthly.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatLKR(calculations.monthly.net)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DESIGNER OUTPUT TRACKING ROW */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Designer Daily Output Tracking
            </h2>
            <Badge variant="blue" size="sm">
              Daily Posts & Videos
            </Badge>
          </div>
          <button
            onClick={() => onNavigate('designer-performance')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Full Performance Board <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Aggregate metrics & designer cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Aggregate Production Score Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Studio Daily Output
              </span>
              <span className="text-xs text-slate-500">All Active Designers Today</span>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <Palette className="h-4 w-4 text-sky-400 mx-auto mb-1" />
                  <div className="text-2xl font-extrabold text-white">
                    {calculations.dailyDesignerGraphics}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Graphic Posts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <Video className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                  <div className="text-2xl font-extrabold text-white">
                    {calculations.dailyDesignerVideos}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Reel Videos
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenLogOutput}
              className="mt-4 w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all"
            >
              + Log Designer Output
            </button>
          </div>

          {/* Individual designer today status */}
          {todayOutputs.map((output) => {
            const graphicPercent = Math.min(
              100,
              Math.round((output.graphicPosts / (output.targetGraphicPosts || 1)) * 100)
            );
            const videoPercent = Math.min(
              100,
              Math.round((output.videos / (output.targetVideos || 1)) * 100)
            );

            return (
              <div
                key={output.id}
                className="rounded-2xl border border-slate-800 bg-[#0c121e] p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white truncate">{output.designerName}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      Today
                    </span>
                  </div>

                  <div className="space-y-3 mt-3">
                    {/* Graphic Posts Progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Palette className="h-3 w-3 text-sky-400" />
                          Graphic Posts:
                        </span>
                        <span className="font-bold text-white">
                          {output.graphicPosts} / {output.targetGraphicPosts}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-sky-400 rounded-full transition-all"
                          style={{ width: `${graphicPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Videos Progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Video className="h-3 w-3 text-blue-400" />
                          Videos / Reels:
                        </span>
                        <span className="font-bold text-white">
                          {output.videos} / {output.targetVideos}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${videoPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <p className="text-[11px] text-slate-400 truncate">
                    Brief: {output.clientProjects.join(', ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT FINANCIAL ACTIVITIES DUAL LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incomes */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Inflows
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddIncome}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                + New Income
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => onNavigate('income')}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                View All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentIncomes.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-semibold text-white">{inc.clientName}</h5>
                    <Badge variant={inc.status === 'Paid' ? 'emerald' : 'amber'} size="sm">
                      {inc.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{inc.projectName}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-blue-400">+{formatLKR(inc.amount)}</div>
                  <div className="text-[10px] text-slate-500">{formatDate(inc.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c121e] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Expenses
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {currentRole !== 'Designer' && (
                <>
                  <button
                    onClick={onOpenAddExpense}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    + Record
                  </button>
                  <span className="text-slate-600">•</span>
                </>
              )}
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                View All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentExpenses.slice(0, 4).map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-semibold text-white">{exp.vendor}</h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{exp.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-300">-{formatLKR(exp.amount)}</div>
                  <div className="text-[10px] text-slate-500">{formatDate(exp.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
