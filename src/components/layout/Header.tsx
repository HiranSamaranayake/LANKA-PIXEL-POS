import React from 'react';
import { Calendar, ShieldCheck, Headphones, Brush, Menu } from 'lucide-react';
import type { NavigationModule, UserRole } from '../../types';
import { formatDate, getColomboToday } from '../../utils/formatters';

interface HeaderProps {
  currentModule: NavigationModule;
  currentRole: UserRole;
  onOpenSetup?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  currentRole,
  onToggleMobileSidebar,
}) => {
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
    <header className="bg-white border-b border-[#E5E7EB] px-3.5 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-30">
      {/* Left: Mobile Hamburger & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 rounded-xl border border-[#E5E7EB] hover:bg-gray-100 text-gray-700 transition-colors lg:hidden shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg font-bold text-[#111827] tracking-tight truncate">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate hidden md:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Badges & Status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Date Display */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs text-gray-700 font-medium">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span>{formatDate(todayStr)}</span>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] border border-blue-200 text-xs text-[#2563EB] font-semibold">
          {getRoleIcon()}
          <span className="hidden xs:inline">{currentRole}</span>
        </div>

        {/* Portal Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs font-medium text-gray-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-semibold text-gray-600 hidden xs:inline">Online</span>
        </div>
      </div>
    </header>
  );
};

