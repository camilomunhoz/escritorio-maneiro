import React, { useMemo } from 'react';
import { GLITCH_CONFIG } from '../../config/glitchConfig';

interface DesktopGlitchOverlayProps {
  isGlitching: boolean;
}

export const DesktopGlitchOverlay: React.FC<DesktopGlitchOverlayProps> = ({ isGlitching }) => {
  // Gera slices pseudoaleatorios consistentes para a duracao do glitch
  const slices = useMemo(() => {
    const list = [];
    const count = GLITCH_CONFIG.sliceCount;
    for (let i = 0; i < count; i++) {
      const heightPercent = 4 + (i * 7) % 15;
      const topPercent = (i * (100 / count) + 6) % 95;
      const shiftPercent = ((i % 2 === 0 ? 1 : -1) * (1.5 + (i * 1.3) % GLITCH_CONFIG.sliceMaxShiftPercent));
      const color = i % 2 === 0 ? GLITCH_CONFIG.colors.cyan : GLITCH_CONFIG.colors.magenta;

      list.push({
        id: i,
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        shift: `${shiftPercent}%`,
        color,
      });
    }
    return list;
  }, [isGlitching]);

  if (!isGlitching) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] pointer-events-none select-none overflow-hidden"
    >
      {/* 1. Flash de cores e contraste */}
      {GLITCH_CONFIG.enableColorFlash && (
        <div
          className="absolute inset-0 animate-glitch-flash mix-blend-color-dodge pointer-events-none"
          style={{
            backgroundColor: GLITCH_CONFIG.colors.flash,
            opacity: GLITCH_CONFIG.flashOpacity,
          }}
        />
      )}

      {/* 2. Aberracao cromatica (faixas de deslocamento RGB em tela cheia) */}
      {GLITCH_CONFIG.enableRgbSplit && (
        <>
          <div
            className="absolute inset-0 mix-blend-screen animate-glitch-rgb-left pointer-events-none"
            style={{
              backgroundColor: GLITCH_CONFIG.colors.cyan,
              transform: `translateX(-${GLITCH_CONFIG.rgbSplitOffsetPx}px)`,
              opacity: 0.35,
            }}
          />
          <div
            className="absolute inset-0 mix-blend-screen animate-glitch-rgb-right pointer-events-none"
            style={{
              backgroundColor: GLITCH_CONFIG.colors.magenta,
              transform: `translateX(${GLITCH_CONFIG.rgbSplitOffsetPx}px)`,
              opacity: 0.35,
            }}
          />
        </>
      )}

      {/* 3. Fatias horizontais rasgadas */}
      {slices.map(slice => (
        <div
          key={slice.id}
          className="absolute left-0 right-0 animate-glitch-slice pointer-events-none"
          style={{
            top: slice.top,
            height: slice.height,
            transform: `translateX(${slice.shift})`,
            backgroundColor: slice.color,
            backdropFilter: 'invert(0.2) contrast(1.3) saturate(1.4)',
            WebkitBackdropFilter: 'invert(0.2) contrast(1.3) saturate(1.4)',
            opacity: 0.6,
          }}
        />
      ))}

      {/* 4. Scanlines CRT horizontais */}
      {GLITCH_CONFIG.enableScanlines && (
        <div
          className="absolute inset-0 pointer-events-none animate-glitch-scanlines"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0px, rgba(0, 0, 0, 0.7) 2px, transparent 2px, transparent 4px)',
            opacity: GLITCH_CONFIG.scanlinesOpacity,
          }}
        />
      )}
    </div>
  );
};

