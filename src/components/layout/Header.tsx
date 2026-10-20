import React from 'react';
import {
  Calendar,
  PlusCircle,
  ShieldCheck,
  Headphones,
  Brush,
  Layers,
} from 'lucide-react';
import type { NavigationModule, UserRole } from '../../types';
import { formatDate } from '../../utils/formatters';

interface HeaderProps {
  currentModule: NavigationModule;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  referenceDate: string;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenLogOutput: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  currentRole,
  onRoleChange,
  referenceDate,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenLogOutput,
}) => {
  const getModuleTitle = () => {
    switch (currentModule) {
      case 'dashboard':
        return {
          title: 'Executive Overview',
          subtitle: 'Real-time financial performance, operational net, and studio output',
        };
      case 'income':
        return {
          title: 'Income Management',
          subtitle: 'Track invoices, client settlements, and revenue streams',
        };
      case 'expenses':
        return {
          title: 'Operational Expenses',
          subtitle: 'Studio overhead, subscriptions, utilities, and contractor disbursements',
        };
      case 'staff':
        return {
          title: 'Staff Management',
          subtitle: 'Team roster, departmental distribution, and role management',
        };
      case 'designer-performance':
        return {
          title: 'Designer Performance & Output',
          subtitle: 'Daily completed graphic posts and video productions per designer',
        };
      case 'reports':
        return {
          title: 'Reports & Analytics',
          subtitle: 'Consolidated financial summaries, operational margin, and output metrics',
        };
      case 'settings':
        return {
          title: 'Company Settings',
          subtitle: 'Corporate profile, system configurations, and permissions',
        };
    }
  };

  const { title, subtitle } = getModuleTitle();

  return (
    <header className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 bg-[#070a12]/90 backdrop-blur-md px-6 py-4">
      {/* Module Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Controls & Role Selector & Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-blue-400" />
          <span>{formatDate(referenceDate)}</span>
        </div>

        {/* Role Switcher Pill Group */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <span className="px-2 text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Layers className="h-3 w-3 text-blue-400" />
            Role:
          </span>
          <button
            onClick={() => onRoleChange('Admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              currentRole === 'Admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </button>
          <button
            onClick={() => onRoleChange('Call Center Operator')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              currentRole === 'Call Center Operator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            Call Center
          </button>
          <button
            onClick={() => onRoleChange('Designer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              currentRole === 'Designer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brush className="h-3.5 w-3.5" />
            Designer
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddIncome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95"
            title="Record New Income Transaction"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>+ Income</span>
          </button>

          {currentRole !== 'Designer' && (
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
              title="Record Operational Expense"
            >
              <PlusCircle className="h-3.5 w-3.5 text-rose-400" />
              <span>+ Expense</span>
            </button>
          )}

          <button
            onClick={onOpenLogOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 text-xs font-semibold transition-all active:scale-95"
            title="Log Daily Graphic/Video Output"
          >
            <Brush className="h-3.5 w-3.5 text-indigo-400" />
            <span>+ Log Output</span>
          </button>
        </div>
      </div>
    </header>
  );
};
