import React from 'react';
import { Home, Gamepad2, HeartPulse, Users, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { NavigationTab } from '../../types';

export interface BottomNavProps {
  onToggleMenu?: () => void;
  isMenuOpen?: boolean;
  isPopoverActive?: boolean;
  onTabSelect?: (tabId: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onToggleMenu,
  isMenuOpen,
  isPopoverActive,
  onTabSelect,
}) => {
  const { state, setCurrentTab } = useApp();

  const tabs: { id: NavigationTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'games', label: 'Jogos', icon: Gamepad2 },
    { id: 'health', label: 'Saúde', icon: HeartPulse },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'menu', label: 'Menu', icon: Menu },
  ];

  const handleTabClick = (tabId: NavigationTab) => {
    if (tabId === 'menu') {
      if (onToggleMenu) {
        onToggleMenu();
        return;
      }
    }
    if (onTabSelect) {
      onTabSelect(tabId);
    } else {
      setCurrentTab(tabId);
    }
  };

  const isMenuHighlight = Boolean(isMenuOpen || isPopoverActive);

  return (
    <nav
      aria-label="Navegação Principal"
      className="w-full h-[52px] border-t border-calm-200/90 bg-calm-50/95 backdrop-blur-sm px-2 flex items-center justify-around select-none shrink-0 relative z-30"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = isMenuHighlight ? tab.id === 'menu' : state.currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'text-sage-800 font-semibold'
                : 'text-calm-500 hover:text-calm-700 hover:bg-calm-100/50'
            }`}
          >
            <div className="relative">
              <Icon size={18} className={isActive ? 'text-sage-700 stroke-[2.2]' : 'text-calm-500 stroke-[1.8]'} />
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-sage-900 font-semibold' : 'text-calm-500'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-sage-600" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
