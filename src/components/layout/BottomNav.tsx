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
      style={isMenuOpen ? { zIndex: 130 } : undefined}
      className={`w-full h-[52px] border-t border-calm-200/90 bg-calm-50/95 backdrop-blur-sm px-1 flex items-center justify-between select-none shrink-0 relative ${
        isMenuOpen ? '' : 'z-30'
      }`}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = isMenuHighlight ? tab.id === 'menu' : state.currentTab === tab.id;

        return (
          <button
            key={tab.id}
            data-menu-toggle={tab.id === 'menu' ? 'true' : undefined}
            aria-expanded={tab.id === 'menu' ? Boolean(isMenuOpen) : undefined}
            aria-haspopup={tab.id === 'menu' ? 'true' : undefined}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 h-full max-w-[84px] relative flex flex-col items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isActive
                ? 'text-sage-900'
                : 'text-calm-500 hover:text-calm-700 hover:bg-calm-100/50'
            }`}
          >
            <div className="relative flex items-center justify-center w-5 h-5">
              <Icon
                size={18}
                className={`stroke-2 transition-colors ${
                  isActive ? 'text-sage-700' : 'text-calm-500'
                }`}
              />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight font-medium transition-colors ${
                isActive ? 'text-sage-900' : 'text-calm-500'
              }`}
            >
              {tab.label}
            </span>
            <span
              className={`absolute bottom-0.5 w-6 h-0.5 rounded-full bg-sage-600 transition-opacity duration-150 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
