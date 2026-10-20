import type { IncomeTransaction, ExpenseTransaction, DesignerDailyOutput, OverallCalculations } from '../types';

export const isSameDay = (d1: string, d2: string): boolean => {
  return d1 === d2;
};

export const isWithinDays = (dateStr: string, referenceDateStr: string, days: number): boolean => {
  const d = new Date(dateStr).getTime();
  const ref = new Date(referenceDateStr).getTime();
  const diffTime = ref - d;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < days;
};

export const isSameMonth = (d1: string, d2: string): boolean => {
  const [y1, m1] = d1.split('-');
  const [y2, m2] = d2.split('-');
  return y1 === y2 && m1 === m2;
};

export const calculateMetrics = (
  incomes: IncomeTransaction[],
  expenses: ExpenseTransaction[],
  designerOutputs: DesignerDailyOutput[],
  referenceDate: string
): OverallCalculations => {
  // 1. Daily Calculations
  const dailyIncomes = incomes.filter(i => isSameDay(i.date, referenceDate));
  const dailyExpenses = expenses.filter(e => isSameDay(e.date, referenceDate));
  const dailyIncomeTotal = dailyIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const dailyExpenseTotal = dailyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Weekly Calculations (Past 7 Days up to referenceDate)
  const weeklyIncomes = incomes.filter(i => isWithinDays(i.date, referenceDate, 7));
  const weeklyExpenses = expenses.filter(e => isWithinDays(e.date, referenceDate, 7));
  const weeklyIncomeTotal = weeklyIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const weeklyExpenseTotal = weeklyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Monthly Calculations (Current Month)
  const monthlyIncomes = incomes.filter(i => isSameMonth(i.date, referenceDate));
  const monthlyExpenses = expenses.filter(e => isSameMonth(e.date, referenceDate));
  const monthlyIncomeTotal = monthlyIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyExpenseTotal = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 4. Designer Daily Output
  const todayOutputs = designerOutputs.filter(o => isSameDay(o.date, referenceDate));
  const dailyDesignerGraphics = todayOutputs.reduce((acc, curr) => acc + curr.graphicPosts, 0);
  const dailyDesignerVideos = todayOutputs.reduce((acc, curr) => acc + curr.videos, 0);

  // 5. Total Cumulative
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    daily: {
      income: dailyIncomeTotal,
      expenses: dailyExpenseTotal,
      net: dailyIncomeTotal - dailyExpenseTotal,
    },
    weekly: {
      income: weeklyIncomeTotal,
      expenses: weeklyExpenseTotal,
      net: weeklyIncomeTotal - weeklyExpenseTotal,
    },
    monthly: {
      income: monthlyIncomeTotal,
      expenses: monthlyExpenseTotal,
      net: monthlyIncomeTotal - monthlyExpenseTotal,
    },
    totalIncome,
    totalExpenses,
    totalOperationalNet: totalIncome - totalExpenses,
    dailyDesignerGraphics,
    dailyDesignerVideos,
  };
};
