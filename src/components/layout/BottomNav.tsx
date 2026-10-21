import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  TrendingDown,
  Menu,
  Settings,
} from 'lucide-react';
import type { NavigationModule, UserRole } from '../../types';

interface BottomNavProps {
  currentModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  currentRole: UserRole;
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentModule,
  onSelectModule,
  currentRole,
  onOpenMobileMenu,
}) => {
  // Determine tabs per role
  const getTabs = () => {
    if (currentRole === 'Designer') {
      return [
        { id: 'dashboard' as NavigationModule, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'posts' as NavigationModule, label: 'My Posts', icon: FileText },
        { id: 'settings' as NavigationModule, label: 'Settings', icon: Settings },
      ];
    }

    if (currentRole === 'Call Center Operator') {
      return [
        { id: 'dashboard' as NavigationModule, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'income' as NavigationModule, label: 'Income', icon: TrendingUp },
        { id: 'expenses' as NavigationModule, label: 'Expenses', icon: TrendingDown },
        { id: 'settings' as NavigationModule, label: 'Settings', icon: Settings },
      ];
    }

    // Admin
    return [
      { id: 'dashboard' as NavigationModule, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'income' as NavigationModule, label: 'Income', icon: TrendingUp },
      { id: 'posts' as NavigationModule, label: 'Posts', icon: FileText },
      { id: 'expenses' as NavigationModule, label: 'Expenses', icon: TrendingDown },
    ];
  };

  const tabs = getTabs();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] z-30 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentModule === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectModule(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all rounded-lg ${
              isActive
                ? 'text-[#2563EB] font-bold'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isActive ? 'bg-[#EFF6FF] scale-110' : ''
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 text-gray-500 hover:text-gray-900 transition-all font-medium"
      >
        <div className="p-1 rounded-lg">
          <Menu className="h-5 w-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
      </button>
    </div>
  );
};
