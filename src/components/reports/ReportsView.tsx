import React, { useState } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Scale,
  FileText,
  AlertTriangle,
  Loader2,
  Users,
} from 'lucide-react';
import type { IncomeRecord, ExpenseRecord, DailyPostCount, UserRole } from '../../types';
import { formatLKR, formatDate, formatMonth, getCurrentMonthString } from '../../utils/formatters';
import { generateProfessionalReportPdf, type ReportType } from '../../utils/pdfGenerator';
import { useNotification } from '../../context/NotificationContext';

interface ReportsViewProps {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  postCounts: DailyPostCount[];
  currentRole?: UserRole;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  incomes,
  expenses,
  postCounts,
  currentRole = 'Admin',
}) => {
  const { showSuccess, showWarning, showError } = useNotification();
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [selectedType, setSelectedType] = useState<ReportType>(
    currentRole === 'Designer' ? 'designer' : 'monthly'
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filter records by selectedMonth (YYYY-MM)
  const monthIncomes = incomes.filter((i) => i.date.startsWith(selectedMonth));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const monthPosts = postCounts.filter((p) => p.date.startsWith(selectedMonth));

  // Monthly Calculations
  const totalIncome = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const operationalNet = totalIncome - totalExpenses;
  const totalCompletedPosts = monthPosts.reduce((acc, curr) => acc + curr.completed_posts, 0);

  // Active dates for monthly breakdown
  const allDatesSet = new Set<string>();
  monthIncomes.forEach((i) => allDatesSet.add(i.date));
  monthExpenses.forEach((e) => allDatesSet.add(e.date));
  monthPosts.forEach((p) => allDatesSet.add(p.date));
  const sortedDates = Array.from(allDatesSet).sort((a, b) => b.localeCompare(a));

  // Report labels
  const reportLabels: Record<ReportType, { title: string; subtitle: string }> = {
    monthly: {
      title: 'Monthly Financial Performance Statement',
      subtitle: 'Consolidated Operational Intelligence & Inward Settlements',
    },
    income: {
      title: 'Income & Inward Settlements Report',
      subtitle: 'Client Billings, Design Packages & Retainers',
    },
    expense: {
      title: 'Operational Expenses & Disbursements Report',
      subtitle: 'Corporate Operating Costs, Overheads & Disbursements',
    },
    designer: {
      title: 'Creative Studio Designer Productivity Report',
      subtitle: 'Daily Graphic Post Deliverables & Output Intelligence',
    },
  };

  // Determine available tabs based on user role (Security & RBAC)
  const availableTabs: { type: ReportType; label: string; icon: React.ReactNode }[] = [];

  if (currentRole === 'Admin') {
    availableTabs.push(
      { type: 'monthly', label: 'Monthly Statement', icon: <Scale className="h-3.5 w-3.5" /> },
      { type: 'income', label: 'Income Details', icon: <TrendingUp className="h-3.5 w-3.5" /> },
      { type: 'expense', label: 'Operating Expenses', icon: <TrendingDown className="h-3.5 w-3.5" /> },
      { type: 'designer', label: 'Designer Productivity', icon: <FileText className="h-3.5 w-3.5" /> }
    );
  } else if (currentRole === 'Call Center Operator') {
    availableTabs.push(
      { type: 'monthly', label: 'Monthly Statement', icon: <Scale className="h-3.5 w-3.5" /> },
      { type: 'income', label: 'Income Details', icon: <TrendingUp className="h-3.5 w-3.5" /> },
      { type: 'expense', label: 'Operating Expenses', icon: <TrendingDown className="h-3.5 w-3.5" /> }
    );
  } else {
    // Designer can only access their designer productivity reports
    availableTabs.push({
      type: 'designer',
      label: 'Designer Productivity',
      icon: <FileText className="h-3.5 w-3.5" />,
    });
  }

  const handleDownloadReport = async () => {
    // Check if the current report dataset is empty
    let isEmpty = false;
    if (selectedType === 'monthly' && sortedDates.length === 0) isEmpty = true;
    else if (selectedType === 'income' && monthIncomes.length === 0) isEmpty = true;
    else if (selectedType === 'expense' && monthExpenses.length === 0) isEmpty = true;
    else if (selectedType === 'designer' && monthPosts.length === 0) isEmpty = true;

    if (isEmpty) {
      showWarning(
        `No ${reportLabels[selectedType].title.toLowerCase()} records found for ${formatMonth(selectedMonth)} to export.`
      );
      return;
    }

    setIsGeneratingPdf(true);
    try {
      // Simulate minor micro-delay for smooth UI feedback and generate PDF
      await new Promise((resolve) => setTimeout(resolve, 250));
      const downloadedFilename = generateProfessionalReportPdf({
        reportType: selectedType,
        selectedMonth,
        incomes,
        expenses,
        postCounts,
        currentRole,
      });

      showSuccess(`PDF report downloaded: ${downloadedFilename}`);
    } catch (err: unknown) {
      console.error('PDF generation error:', err);
      showError('Unable to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider bg-[#EFF6FF] px-2.5 py-0.5 rounded-full mb-1 inline-block">
              Corporate Intelligence & Executive Statements
            </span>
            <h2 className="text-lg font-bold text-[#111827]">
              {reportLabels[selectedType].title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              LANKA PIXEL CREATIONS (PVT) LTD • Period: {formatMonth(selectedMonth)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Month Selector */}
            <div className="flex items-center justify-between sm:justify-start gap-1.5 text-xs text-gray-700 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Month:</span>
              </div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-bold text-[#111827] focus:outline-none focus:border-[#60A5FA]"
              />
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadReport}
              disabled={isGeneratingPdf}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
              title="Generate and download high-resolution PDF document"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2563EB]" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>Download Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Type Navigation Tabs */}
        {availableTabs.length > 1 && (
          <div className="pt-2 border-t border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto">
            {availableTabs.map((tab) => {
              const isActive = selectedType === tab.type;
              return (
                <button
                  key={tab.type}
                  onClick={() => setSelectedType(tab.type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SUMMARY KPI CARDS */}
      {selectedType === 'monthly' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Total Income</span>
              <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] mt-1">{formatLKR(totalIncome)}</div>
            <p className="text-[11px] text-gray-400 mt-1">{monthIncomes.length} settlements</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Total Expenses</span>
              <div className="p-1 rounded-md bg-gray-100 text-gray-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] mt-1">{formatLKR(totalExpenses)}</div>
            <p className="text-[11px] text-gray-400 mt-1">{monthExpenses.length} disbursements</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Operational Net</span>
              <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] mt-1">{formatLKR(operationalNet)}</div>
            <p className="text-[11px] text-gray-400 mt-1">Total Income − Total Expenses</p>
          </div>

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
            <p className="text-[11px] text-gray-400 mt-1">Creative deliverables</p>
          </div>
        </div>
      )}

      {selectedType === 'income' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Total Inward Settlements</span>
              <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] mt-1">{formatLKR(totalIncome)}</div>
            <p className="text-[11px] text-gray-400 mt-1">Settled invoices this period</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">Inward Transactions</span>
            <div className="text-2xl font-bold text-[#111827] mt-1">{monthIncomes.length} Entries</div>
            <p className="text-[11px] text-gray-400 mt-1">Active billing records</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">Average Settlement</span>
            <div className="text-2xl font-bold text-[#111827] mt-1">
              {formatLKR(monthIncomes.length > 0 ? totalIncome / monthIncomes.length : 0)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Mean inward transaction size</p>
          </div>
        </div>
      )}

      {selectedType === 'expense' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Total Operating Costs</span>
              <div className="p-1 rounded-md bg-rose-50 text-rose-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] mt-1">{formatLKR(totalExpenses)}</div>
            <p className="text-[11px] text-gray-400 mt-1">Disbursements this period</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">Expense Vouchers</span>
            <div className="text-2xl font-bold text-[#111827] mt-1">{monthExpenses.length} Records</div>
            <p className="text-[11px] text-gray-400 mt-1">Approved operating vouchers</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">Average Disbursement</span>
            <div className="text-2xl font-bold text-[#111827] mt-1">
              {formatLKR(monthExpenses.length > 0 ? totalExpenses / monthExpenses.length : 0)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Mean expense per voucher</p>
          </div>
        </div>
      )}

      {selectedType === 'designer' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Completed Graphic Posts</span>
              <div className="p-1 rounded-md bg-[#EFF6FF] text-[#2563EB]">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#111827] mt-1">{totalCompletedPosts} Posts</div>
            <p className="text-[11px] text-gray-400 mt-1">Creative studio output</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span className="font-semibold">Active Designers</span>
              <Users className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-bold text-[#111827] mt-1">
              {new Set(monthPosts.map((p) => p.designer_name)).size} Creators
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Team members with logs</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-gray-500 font-semibold block mb-1">Daily Log Entries</span>
            <div className="text-2xl font-bold text-[#111827] mt-1">{monthPosts.length} Logs</div>
            <p className="text-[11px] text-gray-400 mt-1">Individual daily work entries</p>
          </div>
        </div>
      )}

      {/* Accounting Notice for Financial Statements */}
      {(selectedType === 'monthly' || selectedType === 'income' || selectedType === 'expense') && (
        <div className="p-3.5 rounded-xl bg-gray-50 border border-[#E5E7EB] flex items-start gap-2.5 text-xs text-gray-600">
          <AlertTriangle className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#111827]">Financial Accounting Notice:</strong> Operational Net is computed strictly as <span className="font-mono font-semibold">Total Income − Total Expenses</span> based on verified entries in the system. Not all possible business costs, taxes, or depreciation may be recorded.
          </p>
        </div>
      )}

      {/* DETAILED DATA TABLE */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              {reportLabels[selectedType].title} ({formatMonth(selectedMonth)})
            </h4>
            <p className="text-[11px] text-gray-400">
              Selectable vector records included in the generated PDF download
            </p>
          </div>
          <div className="text-xs text-gray-500 font-semibold">
            {selectedType === 'monthly' && `${sortedDates.length} Active Days`}
            {selectedType === 'income' && `${monthIncomes.length} Settlements`}
            {selectedType === 'expense' && `${monthExpenses.length} Records`}
            {selectedType === 'designer' && `${monthPosts.length} Logs`}
          </div>
        </div>

        {/* Tabular view depending on selectedType */}
        {selectedType === 'monthly' && (
          sortedDates.length === 0 ? (
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
          )
        )}

        {selectedType === 'income' && (
          monthIncomes.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              No income entries recorded for {formatMonth(selectedMonth)}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Income Source / Package</th>
                    <th className="px-5 py-3">Client / Project</th>
                    <th className="px-5 py-3">Recorded By</th>
                    <th className="px-5 py-3 text-right">Settlement Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
                  {monthIncomes.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111827]">{item.source}</td>
                      <td className="px-5 py-3 text-gray-600">{item.client_project || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{item.recorded_by}</td>
                      <td className="px-5 py-3 text-right font-bold text-[#111827] whitespace-nowrap">
                        {formatLKR(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50/70 border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                  <tr>
                    <td colSpan={4} className="px-5 py-3 uppercase">Total Inward Settlements</td>
                    <td className="px-5 py-3 text-right">{formatLKR(totalIncome)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}

        {selectedType === 'expense' && (
          monthExpenses.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              No operating expenses recorded for {formatMonth(selectedMonth)}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Description / Voucher</th>
                    <th className="px-5 py-3">Recorded By</th>
                    <th className="px-5 py-3 text-right">Disbursed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
                  {monthExpenses.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111827]">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{item.description}</td>
                      <td className="px-5 py-3 text-gray-500">{item.recorded_by}</td>
                      <td className="px-5 py-3 text-right font-bold text-[#111827] whitespace-nowrap">
                        {formatLKR(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50/70 border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                  <tr>
                    <td colSpan={4} className="px-5 py-3 uppercase">Total Operational Disbursements</td>
                    <td className="px-5 py-3 text-right">{formatLKR(totalExpenses)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}

        {selectedType === 'designer' && (
          monthPosts.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              No creative studio logs recorded for {formatMonth(selectedMonth)}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Designer / Creator</th>
                    <th className="px-5 py-3 text-center">Completed Graphics</th>
                    <th className="px-5 py-3">Assignment / Deliverable Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-gray-700">
                  {monthPosts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111827]">{item.designer_name}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[11px]">
                          {item.completed_posts} posts
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50/70 border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                  <tr>
                    <td colSpan={2} className="px-5 py-3 uppercase">Creative Studio Total</td>
                    <td className="px-5 py-3 text-center font-bold text-[#2563EB]">
                      {totalCompletedPosts} posts
                    </td>
                    <td className="px-5 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
