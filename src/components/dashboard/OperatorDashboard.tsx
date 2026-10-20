import React from 'react';
import { TrendingUp, PlusCircle, Calendar, Receipt } from 'lucide-react';
import type { IncomeRecord, NavigationModule } from '../../types';
import { formatLKR, formatDate } from '../../utils/formatters';

interface OperatorDashboardProps {
  todayStr: string;
  currentMonthStr: string;
  incomes: IncomeRecord[];
  onNavigate: (module: NavigationModule) => void;
  onOpenAddIncome: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  todayStr,
  currentMonthStr,
  incomes,
  onNavigate,
  onOpenAddIncome,
}) => {
  const todayIncomes = incomes.filter((i) => i.date === todayStr);
  const todayIncomeTotal = todayIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  const monthIncomes = incomes.filter((i) => i.date.startsWith(currentMonthStr));
  const monthIncomeTotal = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full mb-1">
            Call Center & Client Desk
          </span>
          <h2 className="text-lg font-bold text-[#111827]">
            Daily Income & Inflow Portal
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Record customer service payments, client design package receipts, and verify settlements.
          </p>
        </div>

        <button
          onClick={onOpenAddIncome}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#60A5FA] hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-2xs shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Record New Income</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today Total */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Today's Total Income</span>
            <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {formatLKR(todayIncomeTotal)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {todayIncomes.length} receipt{todayIncomes.length === 1 ? '' : 's'} recorded today
          </p>
        </div>

        {/* Month Total */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold">Current Month Income</span>
            <div className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-1">
            {formatLKR(monthIncomeTotal)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {monthIncomes.length} cumulative receipts this month
          </p>
        </div>

        {/* Quick Help Card */}
        <div className="bg-[#EFF6FF] p-5 rounded-xl border border-blue-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] mb-1">
              <Receipt className="h-4 w-4" />
              <span>Operator Duties</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Verify client payment slips and enter the exact LKR amount with client and project details.
            </p>
          </div>
          <button
            onClick={() => onNavigate('income')}
            className="mt-3 text-xs font-semibold text-[#2563EB] hover:underline self-start"
          >
            Open Income Records &gt;
          </button>
        </div>
      </div>

      {/* Today's Income Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5E7EB]">
          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Today's Income Transactions ({formatDate(todayStr)})
            </h4>
            <p className="text-[11px] text-gray-400">
              Receipts entered into the system today
            </p>
          </div>
          <button
            onClick={() => onNavigate('income')}
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View Full Income History &gt;
          </button>
        </div>

        {todayIncomes.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-400">
            No income entries recorded yet today. Click "Record New Income" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-gray-400">
                  <th className="pb-2 font-medium">Source / Service</th>
                  <th className="pb-2 font-medium">Client / Project</th>
                  <th className="pb-2 font-medium">Recorded By</th>
                  <th className="pb-2 font-medium text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {todayIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="py-2.5 font-semibold text-[#111827]">{inc.source}</td>
                    <td className="py-2.5 text-gray-600">{inc.client_project || '—'}</td>
                    <td className="py-2.5 text-gray-500">{inc.recorded_by}</td>
                    <td className="py-2.5 text-right font-bold text-[#111827]">
                      {formatLKR(inc.amount)}
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
