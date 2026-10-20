import React from 'react';
import { Calendar, Database, ShieldCheck, Headphones, Brush } from 'lucide-react';
import type { NavigationModule, UserRole } from '../../types';
import { formatDate, getColomboToday } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentModule: NavigationModule;
  currentRole: UserRole;
  onOpenSetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  currentRole,
  onOpenSetup,
}) => {
  const { isConfigured } = useAuth();
  const todayStr = getColomboToday();

  const getModuleMeta = () => {
    switch (currentModule) {
      case 'dashboard':
        return {
          title: `${currentRole} Dashboard`,
          subtitle:
            currentRole === 'Admin'
              ? 'Real-time financial performance and company operations summary'
              : currentRole === 'Call Center Operator'
              ? 'Client income inflows and daily receipts summary'
              : 'Your daily graphic design completed output record',
        };
      case 'income':
        return {
          title: 'Daily Income Management',
          subtitle: 'Record and track client income, service fees, and daily receipts',
        };
      case 'posts':
        return {
          title: 'Daily Post Count',
          subtitle: 'Track completed graphic design posts per creative designer',
        };
      case 'expenses':
        return {
          title: 'Operational Expenses',
          subtitle: 'Track studio overhead, utilities, salaries, and operating disbursements',
        };
      case 'reports':
        return {
          title: 'Monthly Financial Reports',
          subtitle: 'Consolidated operational net calculation (Income − Expenses) and statistics',
        };
      case 'staff':
        return {
          title: 'Staff Management',
          subtitle: 'Manage employee accounts, assign roles, and configure system permissions',
        };
      case 'settings':
        return {
          title: 'System Settings',
          subtitle: 'Company registration details, profile preferences, and database status',
        };
    }
  };

  const { title, subtitle } = getModuleMeta();

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'Admin':
        return <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />;
      case 'Call Center Operator':
        return <Headphones className="h-3.5 w-3.5 text-[#2563EB]" />;
      case 'Designer':
        return <Brush className="h-3.5 w-3.5 text-[#2563EB]" />;
    }
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-[#111827] tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Date Display */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs text-gray-700 font-medium">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span>{formatDate(todayStr)}</span>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-blue-200 text-xs text-[#2563EB] font-semibold">
          {getRoleIcon()}
          <span>{currentRole}</span>
        </div>

        {/* Database Connection Pill */}
        <button
          onClick={onOpenSetup}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isConfigured
              ? 'bg-white border-[#E5E7EB] text-gray-600 hover:bg-gray-50'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
          title="Supabase Database Configuration"
        >
          <Database className={`h-3.5 w-3.5 ${isConfigured ? 'text-blue-500' : 'text-amber-600'}`} />
          <span className="text-[11px] font-semibold">
            {isConfigured ? 'Supabase Connected' : 'Configure Supabase'}
          </span>
        </button>
      </div>
    </header>
  );
};
