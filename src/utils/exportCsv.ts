// CSV Export Utility for Lanka Pixel Creations (Pvt) Ltd
import type { IncomeRecord, ExpenseRecord, DailyPostCount } from '../types';
import { formatDate, formatMonth } from './formatters';

/**
 * Download arbitrary tabular rows as a CSV file compatible with Microsoft Excel
 */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '""';
          const text = String(cell);
          // Escape double quotes by doubling them
          const escaped = text.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
    .join('\r\n');

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel respects encoding and text formatting
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download monthly financial performance statement CSV
 */
export function exportMonthlyReportCsv(
  selectedMonth: string,
  incomes: IncomeRecord[],
  expenses: ExpenseRecord[],
  postCounts: DailyPostCount[]
): void {
  const monthIncomes = incomes.filter((i) => i.date.startsWith(selectedMonth));
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const monthPosts = postCounts.filter((p) => p.date.startsWith(selectedMonth));

  const totalIncome = monthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const operationalNet = totalIncome - totalExpenses;
  const totalCompletedPosts = monthPosts.reduce((acc, curr) => acc + curr.completed_posts, 0);

  // Collect unique dates sorted chronologically descending
  const allDatesSet = new Set<string>();
  monthIncomes.forEach((i) => allDatesSet.add(i.date));
  monthExpenses.forEach((e) => allDatesSet.add(e.date));
  monthPosts.forEach((p) => allDatesSet.add(p.date));
  const sortedDates = Array.from(allDatesSet).sort((a, b) => b.localeCompare(a));

  const now = new Date();
  const generatedTimestamp = `${now.toISOString().substring(0, 10)} ${now.toLocaleTimeString('en-GB')}`;

  const rows: (string | number)[][] = [
    ['LANKA PIXEL CREATIONS (PVT) LTD'],
    ['MONTHLY FINANCIAL PERFORMANCE STATEMENT'],
    ['Statement Period', formatMonth(selectedMonth)],
    ['Generated On', generatedTimestamp],
    ['Currency', 'Sri Lankan Rupee (LKR - Rs.)'],
    [''],
    ['SUMMARY KEY PERFORMANCE INDICATORS', ''],
    ['Total Income (Rs.)', totalIncome],
    ['Total Operational Expenses (Rs.)', totalExpenses],
    ['Operational Net (Rs.)', operationalNet],
    ['Total Completed Posts', totalCompletedPosts],
    ['Accounting Formula', 'Operational Net = Total Income - Total Expenses'],
    [''],
    ['DAILY OPERATIONAL BREAKDOWN', '', '', '', ''],
    [
      'Date (YYYY-MM-DD)',
      'Date (Formatted)',
      'Daily Income (Rs.)',
      'Daily Expenses (Rs.)',
      'Daily Operational Net (Rs.)',
      'Completed Posts',
    ],
  ];

  sortedDates.forEach((dateStr) => {
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

    rows.push([
      dateStr,
      formatDate(dateStr),
      dayInc,
      dayExp,
      dayNet,
      dayPosts,
    ]);
  });

  rows.push(['']);
  rows.push([
    'TOTAL',
    formatMonth(selectedMonth),
    totalIncome,
    totalExpenses,
    operationalNet,
    totalCompletedPosts,
  ]);
  rows.push(['']);
  rows.push([
    'Financial Accounting Notice',
    'Operational Net is computed strictly as Total Income - Total Expenses based on entries recorded in the system. Do not call this figure final accounting profit because not all possible business costs, taxes, or depreciation may be recorded.',
  ]);

  const filename = `monthly-financial-report-${selectedMonth}.csv`;
  downloadCsv(filename, rows);
}
