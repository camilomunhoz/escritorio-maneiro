import React, { useEffect, useRef } from 'react';
import { User, Palette, Award, Settings } from 'lucide-react';
import { BackdropBlurOverlay } from '../../ui/BackdropBlurOverlay';
import { useModalZIndex } from '../../../context/ModalZIndexContext';

interface MenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenAvatar: () => void;
  onOpenMedals: () => void;
  onOpenSettings: () => void;
}

export const MenuPopup: React.FC<MenuPopupProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
  onOpenAvatar,
  onOpenMedals,
  onOpenSettings,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { zIndex, backdropZIndex } = useModalZIndex({
    id: 'footer-menu-popup',
    isOpen,
    priority: 'menu',
  });

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: User,
      action: onOpenProfile,
    },
    {
      id: 'avatar',
      label: 'Meu Avatar',
      icon: Palette,
      action: onOpenAvatar,
    },
    {
      id: 'medals',
      label: 'Conquistas',
      icon: Award,
      action: onOpenMedals,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      action: onOpenSettings,
    },
  ];

  return (
    <>
      {/* Background Blur Overlay (SSOT) com z-index dinâmico */}
      <BackdropBlurOverlay isOpen={isOpen} onClick={onClose} zIndex={backdropZIndex} intensity="subtle" />

      {/* Compact Popover Menu anchored in bottom-right com z-index dinâmico */}
      <div
        ref={popupRef}
        style={{ zIndex }}
        className="absolute bottom-14 right-2 w-44 bg-white/95 backdrop-blur-md rounded-xl border border-calm-200/90 shadow-xl p-1 animate-fadeIn select-none"
        role="menu"
        aria-orientation="vertical"
      >
        <div className="space-y-0.5">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-calm-700 hover:text-calm-950 hover:bg-calm-100/90 transition-colors cursor-pointer text-left group"
                role="menuitem"
              >
                <div className="w-5 h-5 rounded-md bg-calm-100/80 group-hover:bg-white flex items-center justify-center transition-colors shrink-0">
                  <Icon size={13} className="text-calm-600 group-hover:text-sage-800" />
                </div>
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MenuPopup;
