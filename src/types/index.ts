export type UserRole = 'Admin' | 'Call Center Operator' | 'Designer';

export type UserStatus = 'Active' | 'Deactivated';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  source: string; // Service or income source
  client_project?: string;
  amount: number;
  description?: string;
  recorded_by: string;
  user_id?: string;
  created_at?: string;
}

export type ExpenseCategory =
  | 'Facebook Boosting'
  | 'Advertising'
  | 'Salaries'
  | 'Software'
  | 'Internet'
  | 'Electricity'
  | 'Equipment'
  | 'Transport'
  | 'Office Expenses'
  | 'Other';

export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  recorded_by: string;
  user_id?: string;
  created_at?: string;
}

export interface DailyPostCount {
  id: string;
  date: string; // YYYY-MM-DD
  designer_id: string;
  designer_name: string;
  completed_posts: number;
  notes?: string;
  created_at?: string;
}

export interface FinancialTotals {
  income: number;
  expenses: number;
  net: number; // Income - Expenses
}

export type NavigationModule =
  | 'dashboard'
  | 'income'
  | 'posts'
  | 'expenses'
  | 'reports'
  | 'staff'
  | 'settings';
