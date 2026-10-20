import React, { useState, useMemo } from 'react';
import type {
  NavigationModule,
  UserRole,
  IncomeTransaction,
  ExpenseTransaction,
  StaffMember,
  DesignerDailyOutput,
} from './types';
import {
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_STAFF,
  INITIAL_DESIGNER_OUTPUTS,
  CURRENT_DATE,
} from './data/mockData';
import { calculateMetrics } from './utils/calculations';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { IncomeView } from './components/income/IncomeView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { StaffView } from './components/staff/StaffView';
import { DesignerPerformanceView } from './components/designer/DesignerPerformanceView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { AddIncomeModal } from './components/income/AddIncomeModal';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { LogOutputModal } from './components/designer/LogOutputModal';
import { AddStaffModal } from './components/staff/AddStaffModal';

export const App: React.FC = () => {
  // Navigation & Role State
  const [currentModule, setCurrentModule] = useState<NavigationModule>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [referenceDate] = useState<string>(CURRENT_DATE);

  // Core Data State
  const [incomes, setIncomes] = useState<IncomeTransaction[]>(INITIAL_INCOMES);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>(INITIAL_EXPENSES);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [designerOutputs, setDesignerOutputs] = useState<DesignerDailyOutput[]>(INITIAL_DESIGNER_OUTPUTS);

  // Modals Visibility
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isLogOutputOpen, setIsLogOutputOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Active designers list (creative studio members)
  const designers = useMemo(
    () => staffList.filter((s) => s.role === 'Designer'),
    [staffList]
  );

  // Pure Calculation Engine: Daily, Weekly, Monthly totals for Income, Expenses, Operational Net
  const calculations = useMemo(
    () => calculateMetrics(incomes, expenses, designerOutputs, referenceDate),
    [incomes, expenses, designerOutputs, referenceDate]
  );

  // Pending income count for badge
  const pendingIncomeCount = useMemo(
    () => incomes.filter((i) => i.status === 'Pending').length,
    [incomes]
  );

  // Handlers for Incomes
  const handleAddIncome = (newIncome: IncomeTransaction) => {
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const handleToggleIncomeStatus = (id: string) => {
    setIncomes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Paid' ? 'Pending' : 'Paid' }
          : item
      )
    );
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for Expenses
  const handleAddExpense = (newExpense: ExpenseTransaction) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for Designer Output
  const handleLogOutput = (newOutput: DesignerDailyOutput) => {
    // If output exists for this designer and date, update it, else add new
    setDesignerOutputs((prev) => {
      const existingIndex = prev.findIndex(
        (o) => o.designerId === newOutput.designerId && o.date === newOutput.date
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newOutput;
        return updated;
      }
      return [newOutput, ...prev];
    });
  };

  const handleDeleteOutput = (id: string) => {
    setDesignerOutputs((prev) => prev.filter((item) => item.id !== id));
  };

  // Handlers for Staff
  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [...prev, newStaff]);
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#07090e] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        currentRole={currentRole}
        pendingIncomeCount={pendingIncomeCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentModule={currentModule}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          referenceDate={referenceDate}
          onOpenAddIncome={() => setIsAddIncomeOpen(true)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onOpenLogOutput={() => setIsLogOutputOpen(true)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentModule === 'dashboard' && (
            <DashboardView
              calculations={calculations}
              recentIncomes={incomes}
              recentExpenses={expenses}
              designerOutputs={designerOutputs}
              currentRole={currentRole}
              referenceDate={referenceDate}
              onNavigate={setCurrentModule}
              onOpenAddIncome={() => setIsAddIncomeOpen(true)}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenLogOutput={() => setIsLogOutputOpen(true)}
            />
          )}

          {currentModule === 'income' && (
            <IncomeView
              incomes={incomes}
              calculations={calculations}
              currentRole={currentRole}
              referenceDate={referenceDate}
              onOpenAddIncome={() => setIsAddIncomeOpen(true)}
              onToggleStatus={handleToggleIncomeStatus}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {currentModule === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              calculations={calculations}
              currentRole={currentRole}
              referenceDate={referenceDate}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentModule === 'staff' && (
            <StaffView
              staffList={staffList}
              currentRole={currentRole}
              onOpenAddStaff={() => setIsAddStaffOpen(true)}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {currentModule === 'designer-performance' && (
            <DesignerPerformanceView
              designerOutputs={designerOutputs}
              designers={designers}
              currentRole={currentRole}
              referenceDate={referenceDate}
              onOpenLogOutput={() => setIsLogOutputOpen(true)}
              onDeleteOutput={handleDeleteOutput}
            />
          )}

          {currentModule === 'reports' && (
            <ReportsView
              calculations={calculations}
              incomes={incomes}
              expenses={expenses}
              designerOutputs={designerOutputs}
              referenceDate={referenceDate}
            />
          )}

          {currentModule === 'settings' && (
            <SettingsView currentRole={currentRole} />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onAddIncome={handleAddIncome}
        referenceDate={referenceDate}
        recordedBy={
          currentRole === 'Admin'
            ? 'Kasun Jayawardena (Admin)'
            : 'Sanduni Wickramasinghe (Call Center)'
        }
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        referenceDate={referenceDate}
        approvedBy="Kasun Jayawardena (Managing Director)"
      />

      <LogOutputModal
        isOpen={isLogOutputOpen}
        onClose={() => setIsLogOutputOpen(false)}
        onLogOutput={handleLogOutput}
        designers={designers}
        referenceDate={referenceDate}
      />

      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onAddStaff={handleAddStaff}
      />
    </div>
  );
};

export default App;
