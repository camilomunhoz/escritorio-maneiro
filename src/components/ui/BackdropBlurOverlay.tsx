import React from 'react';

export interface BackdropBlurOverlayProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
  zIndex?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

/**
 * SSOT para overlays com background blur do aplicativo,
 * padronizado com os menus modais e configurações da plataforma.
 */
export const BackdropBlurOverlay: React.FC<BackdropBlurOverlayProps> = ({
  isOpen,
  onClick,
  className = '',
  zIndex = 'z-40',
  intensity = 'subtle',
}) => {
  if (!isOpen) return null;

  const intensityClasses = {
    subtle: 'bg-calm-950/20 backdrop-blur-[2px]',
    medium: 'bg-calm-950/35 backdrop-blur-xs',
    strong: 'bg-calm-950/50 backdrop-blur-sm',
  }[intensity];

  return (
    <div
      onClick={onClick}
      aria-hidden="true"
      className={`absolute inset-0 ${zIndex} ${intensityClasses} transition-opacity duration-200 animate-fadeIn ${className}`}
    />
  );
};

export default BackdropBlurOverlay;

