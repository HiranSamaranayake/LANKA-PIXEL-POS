export type UserRole = 'Admin' | 'Call Center Operator' | 'Designer';

export type NavigationModule = 
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'staff'
  | 'designer-performance'
  | 'reports'
  | 'settings';

export type IncomeCategory = 
  | 'Branding & Identity'
  | 'Social Media Marketing'
  | 'Video Production'
  | 'Motion Graphics'
  | 'UI/UX Design'
  | 'Print Media'
  | 'Package Retainer';

export type ExpenseCategory = 
  | 'Software & Subscriptions'
  | 'Office & Utilities'
  | 'Hardware & Equipment'
  | 'Freelance Contractors'
  | 'Internet & Communication'
  | 'Office Welfare & Refreshments'
  | 'Logistics & Courier'
  | 'Legal & Compliance';

export interface IncomeTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  clientName: string;
  projectName: string;
  amount: number;
  category: IncomeCategory;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Online Gateway' | 'Cheque';
  invoiceNumber: string;
  status: 'Paid' | 'Pending';
  recordedBy: string;
  notes?: string;
}

export interface ExpenseTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  vendor: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: 'Corporate Card' | 'Bank Transfer' | 'Petty Cash';
  receiptRef: string;
  approvedBy: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department: 'Administration' | 'Customer Care & Sales' | 'Creative Studio';
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Remote';
  joinDate: string;
  activeProjectsCount: number;
  avatarColor: string;
}

export interface DesignerDailyOutput {
  id: string;
  designerId: string;
  designerName: string;
  date: string; // YYYY-MM-DD
  graphicPosts: number;
  videos: number;
  targetGraphicPosts: number;
  targetVideos: number;
  clientProjects: string[];
  notes?: string;
}

export interface TimeframeSummary {
  income: number;
  expenses: number;
  net: number; // income - expenses
}

export interface OverallCalculations {
  daily: TimeframeSummary;
  weekly: TimeframeSummary;
  monthly: TimeframeSummary;
  totalIncome: number;
  totalExpenses: number;
  totalOperationalNet: number;
  dailyDesignerGraphics: number;
  dailyDesignerVideos: number;
}
