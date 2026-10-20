import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  Palette,
  BarChart3,
  Settings,
  ShieldCheck,
  Headphones,
  Brush,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { NavigationModule, UserRole } from '../../types';

interface SidebarProps {
  currentModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  currentRole: UserRole;
  pendingIncomeCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  currentRole,
  pendingIncomeCount,
}) => {
  const navItems: {
    id: NavigationModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeVariant?: 'blue' | 'amber';
    roleNote?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'income',
      label: 'Income Management',
      icon: TrendingUp,
      badge: pendingIncomeCount > 0 ? pendingIncomeCount : undefined,
      badgeVariant: 'amber',
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: Users,
    },
    {
      id: 'designer-performance',
      label: 'Designer Performance',
      icon: Palette,
      badge: 'Daily',
      badgeVariant: 'blue',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'Admin':
        return <ShieldCheck className="h-4 w-4 text-blue-400" />;
      case 'Call Center Operator':
        return <Headphones className="h-4 w-4 text-sky-400" />;
      case 'Designer':
        return <Brush className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-[#090d16] border-r border-slate-800/80 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
              LANKA PIXEL
            </h1>
            <p className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase">
              CREATIONS (PVT) LTD
            </p>
          </div>
        </div>
        <div className="mt-3 px-2 py-1 rounded bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="text-slate-300 font-medium">Enterprise Suite</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Operations Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeVariant === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100 text-white' : 'text-slate-500'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Role State & Bottom Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400">Current Role Mode</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-400">
              {getRoleIcon()}
              <span>{currentRole}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {currentRole === 'Admin' && 'Full administrative & financial access.'}
            {currentRole === 'Call Center Operator' && 'Client inquiry & income settlement portal.'}
            {currentRole === 'Designer' && 'Daily graphic & video production log.'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Lanka Pixel OS v1.0</span>
          <span className="text-blue-500 font-mono">LKR Base</span>
        </div>
      </div>
    </aside>
  );
};
