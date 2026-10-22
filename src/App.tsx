import React, { useState, useEffect, useCallback } from 'react';
import type {
  NavigationModule,
  UserRole,
  IncomeRecord,
  ExpenseRecord,
  DailyPostCount,
  UserProfile,
} from './types';
import { getColomboToday, getCurrentMonthString } from './utils/formatters';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';

// Views
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { IncomeView } from './components/income/IncomeView';
import { DailyPostCountView } from './components/posts/DailyPostCountView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { StaffManagementView } from './components/staff/StaffManagementView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { AddIncomeModal } from './components/income/AddIncomeModal';
import { AddExpenseModal } from './components/expenses/AddExpenseModal';
import { LogPostModal } from './components/posts/LogPostModal';
import { AddStaffModal } from './components/staff/AddStaffModal';
import { SupabaseSetupModal } from './components/common/SupabaseSetupModal';

const MainApp: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useNotification();

  const currentRole: UserRole = profile?.role || 'Admin';
  const todayStr = getColomboToday();
  const currentMonthStr = getCurrentMonthString();

  // Navigation
  const [currentModule, setCurrentModule] = useState<NavigationModule>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Supabase Data State
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [postCounts, setPostCounts] = useState<DailyPostCount[]>([]);
  const [staffList, setStaffList] = useState<UserProfile[]>([]);

  // Modals Visibility
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  const [isLogPostOpen, setIsLogPostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<DailyPostCount | null>(null);

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Fetch all database records from Supabase
  const fetchData = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      // 1. Fetch Income records (Admin and Call Center Operator have permission)
      if (currentRole === 'Admin' || currentRole === 'Call Center Operator') {
        const { data: incomeData } = await supabase
          .from('income_records')
          .select('*')
          .order('date', { ascending: false });
        if (incomeData) setIncomes(incomeData as IncomeRecord[]);
      } else {
        // Designer must never see income data
        setIncomes([]);
      }

      // 2. Fetch Expense records (Admin and authorized Operator have permission)
      if (currentRole === 'Admin' || currentRole === 'Call Center Operator') {
        const { data: expenseData } = await supabase
          .from('expense_records')
          .select('*')
          .order('date', { ascending: false });
        if (expenseData) setExpenses(expenseData as ExpenseRecord[]);
      } else {
        // Designer must never see expenses
        setExpenses([]);
      }

      // 3. Fetch Daily Post Counts
      // If Designer, RLS returns only their rows. If Admin, returns all rows.
      const { data: postData } = await supabase
        .from('daily_post_counts')
        .select('*')
        .order('date', { ascending: false });
      if (postData) setPostCounts(postData as DailyPostCount[]);

      // 4. Fetch Staff Profiles (Admin only)
      if (currentRole === 'Admin') {
        const { data: staffData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
        if (staffData) setStaffList(staffData as UserProfile[]);
      }
    } catch (err) {
      console.error('Data loading error:', err);
    }
  }, [user, currentRole]);

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      fetchData();
    }
  }, [user, fetchData]);

  // Enforce page authorization strictly
  useEffect(() => {
    if (currentRole === 'Designer') {
      if (!['dashboard', 'posts', 'settings'].includes(currentModule)) {
        setCurrentModule('dashboard');
      }
    } else if (currentRole === 'Call Center Operator') {
      if (!['dashboard', 'income', 'expenses', 'settings'].includes(currentModule)) {
        setCurrentModule('dashboard');
      }
    }
  }, [currentModule, currentRole]);

  // If Auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200/80 mb-4 animate-pulse">
          <img
            src="/logo.png"
            alt="Lanka Pixel Creations"
            className="h-16 w-16 object-contain"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
          <span>Loading Lanka Pixel Management Portal...</span>
        </div>
      </div>
    );
  }

  // If User is not signed in, show Login Screen
  if (!user) {
    return <LoginView />;
  }

  // Filter designers list for post logging
  const designerStaff = staffList.filter((s) => s.role === 'Designer');

  // --- Handlers for Income ---
  const handleAddIncome = async (newIncome: Omit<IncomeRecord, 'id' | 'created_at'>) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('income_records')
        .insert({
          ...newIncome,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setIncomes((prev) => [data as IncomeRecord, ...prev]);
    }
  };

  const handleUpdateIncome = async (id: string, updates: Partial<IncomeRecord>) => {
    if (supabase) {
      const { error } = await supabase
        .from('income_records')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setIncomes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from('income_records').delete().eq('id', id);
      if (error) {
        showError(error.message || 'Unable to delete income record. Please try again.');
        throw error;
      } else {
        setIncomes((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  // --- Handlers for Expenses ---
  const handleAddExpense = async (newExpense: Omit<ExpenseRecord, 'id' | 'created_at'>) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('expense_records')
        .insert({
          ...newExpense,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setExpenses((prev) => [data as ExpenseRecord, ...prev]);
    }
  };

  const handleUpdateExpense = async (id: string, updates: Partial<ExpenseRecord>) => {
    if (supabase) {
      const { error } = await supabase
        .from('expense_records')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setExpenses((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from('expense_records').delete().eq('id', id);
      if (error) {
        showError(error.message || 'Unable to delete expense record. Please try again.');
        throw error;
      } else {
        setExpenses((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  // --- Handlers for Daily Post Count ---
  const handleLogPost = async (newPost: Omit<DailyPostCount, 'id' | 'created_at'>) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('daily_post_counts')
        .upsert(
          {
            ...newPost,
          },
          { onConflict: 'date,designer_id' }
        )
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPostCounts((prev) => {
          const index = prev.findIndex(
            (p) => p.date === data.date && p.designer_id === data.designer_id
          );
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = data as DailyPostCount;
            return updated;
          }
          return [data as DailyPostCount, ...prev];
        });
      }
    }
  };

  const handleUpdatePost = async (id: string, updates: Partial<DailyPostCount>) => {
    if (supabase) {
      const { error } = await supabase
        .from('daily_post_counts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setPostCounts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    }
  };

  const handleDeletePost = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from('daily_post_counts').delete().eq('id', id);
      if (error) {
        showError(error.message || 'Unable to delete post count entry. Please try again.');
        throw error;
      } else {
        setPostCounts((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  // --- Handlers for Staff Management ---
  const handleUpdateStaffRole = async (id: string, newRole: UserRole) => {
    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        showError(error.message || 'Unable to update staff role. Please try again.');
      } else {
        setStaffList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, role: newRole } : s))
        );
        showSuccess(`Staff role updated to ${newRole} successfully.`);
      }
    }
  };

  const handleToggleStaffStatus = async (
    id: string,
    currentStatus: 'Active' | 'Deactivated'
  ) => {
    const nextStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';
    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        showError(
          error.message ||
            `Unable to ${nextStatus === 'Active' ? 'reactivate' : 'deactivate'} staff account.`
        );
      } else {
        setStaffList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
        );
        showSuccess(
          nextStatus === 'Active'
            ? 'Staff account reactivated successfully.'
            : 'Staff account deactivated successfully.'
        );
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#111827] font-sans relative">
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        currentRole={currentRole}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Header
          currentModule={currentModule}
          currentRole={currentRole}
          onOpenSetup={() => setIsSetupOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-3.5 sm:p-6 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
          {currentModule === 'dashboard' && (
            <DashboardView
              todayStr={todayStr}
              currentMonthStr={currentMonthStr}
              currentRole={currentRole}
              incomes={incomes}
              expenses={expenses}
              postCounts={postCounts}
              staffList={staffList}
              onNavigate={setCurrentModule}
              onOpenAddIncome={() => {
                setEditingIncome(null);
                setIsAddIncomeOpen(true);
              }}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              onOpenLogPost={() => {
                setEditingPost(null);
                setIsLogPostOpen(true);
              }}
            />
          )}

          {currentModule === 'income' && (
            <IncomeView
              incomes={incomes}
              currentRole={currentRole}
              onOpenAddIncome={() => {
                setEditingIncome(null);
                setIsAddIncomeOpen(true);
              }}
              onEditIncome={(inc) => {
                setEditingIncome(inc);
                setIsAddIncomeOpen(true);
              }}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {currentModule === 'posts' && (
            <DailyPostCountView
              postCounts={postCounts}
              designers={designerStaff}
              currentRole={currentRole}
              onOpenLogPost={() => {
                setEditingPost(null);
                setIsLogPostOpen(true);
              }}
              onEditPost={(post) => {
                setEditingPost(post);
                setIsLogPostOpen(true);
              }}
              onDeletePost={handleDeletePost}
            />
          )}

          {currentModule === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              currentRole={currentRole}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              onEditExpense={(exp) => {
                setEditingExpense(exp);
                setIsAddExpenseOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentModule === 'reports' && (
            <ReportsView
              incomes={incomes}
              expenses={expenses}
              postCounts={postCounts}
              currentRole={currentRole}
            />
          )}

          {currentModule === 'staff' && (
            <StaffManagementView
              staffList={staffList}
              onOpenAddStaff={() => setIsAddStaffOpen(true)}
              onUpdateRole={handleUpdateStaffRole}
              onToggleStatus={handleToggleStaffStatus}
            />
          )}

          {currentModule === 'settings' && (
            <SettingsView
              currentRole={currentRole}
              onOpenSetup={() => setIsSetupOpen(true)}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          currentRole={currentRole}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Interactive Modals */}
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => {
          setIsAddIncomeOpen(false);
          setEditingIncome(null);
        }}
        onAddIncome={handleAddIncome}
        editingRecord={editingIncome}
        onUpdateIncome={handleUpdateIncome}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onAddExpense={handleAddExpense}
        editingRecord={editingExpense}
        onUpdateExpense={handleUpdateExpense}
      />

      <LogPostModal
        isOpen={isLogPostOpen}
        onClose={() => {
          setIsLogPostOpen(false);
          setEditingPost(null);
        }}
        onLogPost={handleLogPost}
        designers={designerStaff}
        currentRole={currentRole}
        editingRecord={editingPost}
        onUpdatePost={handleUpdatePost}
      />

      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onStaffAdded={fetchData}
      />

      <SupabaseSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
