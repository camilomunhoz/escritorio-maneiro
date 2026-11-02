import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, ChevronDown } from 'lucide-react';
import type { DrawerMode } from '../../types';

export interface DrawerHostProps {
  children: React.ReactNode;
}

export const DrawerHost: React.FC<DrawerHostProps> = ({ children }) => {
  const { state, setDrawerOpen, showNotifications, setShowNotifications } = useApp();

  const unreadNotificationsCount = state.notifications.filter(n => !n.read).length;
  const isNotificationsActive = showNotifications;

  const handleToggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // Width and height mapping according to explicit specifications
  const dimensionClasses: Record<DrawerMode, string> = {
    normal: 'w-[350px] h-[500px]',
    expanded: 'w-[750px] h-[500px]',
  };

  const currentDimensionClass = dimensionClasses[state.drawerMode] || dimensionClasses.normal;

  return (
    <div
      className={`fixed bottom-12 right-6 z-40 transition-all duration-300 ease-in-out transform origin-bottom-right ${state.drawerOpen
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-16 opacity-0 scale-95 pointer-events-none'
        }`}
    >
      {/* Outer Floating Drawer Card */}
      <div
        className={`relative flex flex-col bg-white rounded-2xl border border-calm-200/90 shadow-drawer overflow-hidden transition-all duration-300 ease-in-out ${currentDimensionClass}`}
      >
        {/* Compact Window Header */}
        <div className="flex items-center justify-between px-3 py-1 h-7 bg-calm-50/90 border-b border-calm-200/70 select-none text-[11px] text-calm-600 shrink-0">
          {/* Left: App Title */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold font-primary text-calm-800 tracking-tight text-xs">Nimbo</span>
          </div>

          {/* Right: Window Actions - Bell Notifications & Chevron Down Minimize */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleNotifications}
              className={`p-1 rounded transition cursor-pointer relative ${isNotificationsActive
                  ? 'text-sage-800 bg-sage-100/80'
                  : 'text-calm-500 hover:text-calm-800 hover:bg-calm-200/60'
                }`}
              title="Notificações"
            >
              <Bell size={13} />
              {unreadNotificationsCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"
                  title={`${unreadNotificationsCount} novas notificações`}
                />
              )}
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded text-calm-500 hover:text-calm-800 hover:bg-calm-200/60 transition cursor-pointer"
              title="Recolher janela"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Interior Container */}
        <div className="relative flex-1 overflow-hidden flex flex-col bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};
