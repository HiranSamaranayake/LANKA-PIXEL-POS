import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  TrendingDown,
  BarChart3,
  Users,
  Settings,
  LogOut,
  UserCheck,
  X,
} from 'lucide-react';
import type { NavigationModule, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  currentRole: UserRole;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  currentRole,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { profile, signOut } = useAuth();

  // Role-based navigation permissions
  const allNavItems: {
    id: NavigationModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    allowedRoles: UserRole[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['Admin', 'Call Center Operator', 'Designer'],
    },
    {
      id: 'income',
      label: 'Daily Income',
      icon: TrendingUp,
      allowedRoles: ['Admin', 'Call Center Operator'],
    },
    {
      id: 'posts',
      label: 'Daily Post Count',
      icon: FileText,
      allowedRoles: ['Admin', 'Designer'],
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      allowedRoles: ['Admin', 'Call Center Operator'],
    },
    {
      id: 'reports',
      label: 'Monthly Reports',
      icon: BarChart3,
      allowedRoles: ['Admin'],
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: Users,
      allowedRoles: ['Admin'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      allowedRoles: ['Admin', 'Call Center Operator', 'Designer'],
    },
  ];

  const visibleItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

  const handleItemClick = (id: NavigationModule) => {
    onSelectModule(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Off-canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col min-h-screen shrink-0 select-none transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand & Official Logo */}
        <div className="p-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png"
              alt="Lanka Pixel Creations Logo"
              className="h-10 w-10 object-contain rounded-lg shrink-0 border border-gray-100 shadow-2xs"
            />
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-[#111827] leading-tight tracking-tight truncate">
                LANKA PIXEL
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider truncate">
                CREATIONS (PVT) LTD
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 lg:hidden shrink-0"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Main Menu
          </div>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-bold shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-[#2563EB]' : 'text-gray-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-[#E5E7EB] bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                {profile?.full_name?.charAt(0) || <UserCheck className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111827] truncate">
                  {profile?.full_name || 'Staff Member'}
                </p>
                <span className="inline-block text-[10px] font-medium text-gray-500">
                  {currentRole}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-colors shadow-2xs"
          >
            <LogOut className="h-3.5 w-3.5 text-gray-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

