import React from 'react';
import type {
  IncomeRecord,
  ExpenseRecord,
  DailyPostCount,
  UserProfile,
  UserRole,
  NavigationModule,
} from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { OperatorDashboard } from './OperatorDashboard';
import { DesignerDashboard } from './DesignerDashboard';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  todayStr: string;
  currentMonthStr: string;
  currentRole: UserRole;
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  postCounts: DailyPostCount[];
  staffList: UserProfile[];
  onNavigate: (module: NavigationModule) => void;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenLogPost: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  todayStr,
  currentMonthStr,
  currentRole,
  incomes,
  expenses,
  postCounts,
  staffList,
  onNavigate,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenLogPost,
}) => {
  const { user, profile } = useAuth();

  if (currentRole === 'Admin') {
    return (
      <AdminDashboard
        todayStr={todayStr}
        currentMonthStr={currentMonthStr}
        incomes={incomes}
        expenses={expenses}
        postCounts={postCounts}
        staffList={staffList}
        onNavigate={onNavigate}
        onOpenAddIncome={onOpenAddIncome}
        onOpenAddExpense={onOpenAddExpense}
        onOpenLogPost={onOpenLogPost}
      />
    );
  }

  if (currentRole === 'Call Center Operator') {
    return (
      <OperatorDashboard
        todayStr={todayStr}
        currentMonthStr={currentMonthStr}
        incomes={incomes}
        onNavigate={onNavigate}
        onOpenAddIncome={onOpenAddIncome}
      />
    );
  }

  // Designer Dashboard (strictly filtered to this designer's records)
  const myPostCounts = postCounts.filter(
    (p) => p.designer_id === user?.id || p.designer_name === profile?.full_name
  );

  return (
    <DesignerDashboard
      todayStr={todayStr}
      currentMonthStr={currentMonthStr}
      myPostCounts={myPostCounts}
      designerName={profile?.full_name || 'Designer'}
      onNavigate={onNavigate}
      onOpenLogPost={onOpenLogPost}
    />
  );
};
