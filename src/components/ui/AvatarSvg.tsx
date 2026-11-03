import React, { useMemo, useEffect, useRef } from 'react';
import {
  LEGS_DEFAULT_MARKUP,
  getBodyItem,
  getFaceItem,
  DEFAULT_BODY_ID,
  DEFAULT_FACE_ID,
} from '../../data/avatarRegistry';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'full';

export const AVATAR_SIZE_MAP: Record<AvatarSize, { container: string; svg: string }> = {
  xs: { container: 'w-6 h-6', svg: 'w-5 h-5' },
  sm: { container: 'w-8 h-8', svg: 'w-7 h-7' },
  md: { container: 'w-10 h-10', svg: 'w-9 h-9' },
  lg: { container: 'w-14 h-14', svg: 'w-12 h-12' },
  xl: { container: 'w-20 h-20', svg: 'w-18 h-18' },
  hero: { container: 'w-32 h-32', svg: 'w-28 h-28' },
  full: { container: 'w-full h-full aspect-square', svg: 'w-[90%] h-[90%]' },
};

export interface AvatarSvgProps {
  color?: string;
  bodyId?: string;
  faceId?: string;
  size?: AvatarSize;
  mode?: 'full' | 'face-only' | 'body-only';
  projected?: boolean;
  selected?: boolean;
  interactive?: boolean;
  showRings?: boolean;       // Permite remover facilmente todos os anéis/rings (padrão: true)
  bare?: boolean;            // Renderiza estritamente o avatar vetorial, sem fundo circular, bordas, sombras ou rings (padrão: false)
  className?: string;
  showBackground?: boolean;  // Tint circular de fundo no SVG (desativado automaticamente quando bare=true)
  followMouse?: boolean;
  onClick?: () => void;
  title?: string;
}

export const AvatarSvg: React.FC<AvatarSvgProps> = ({
  color = '#6D8B75',
  bodyId = DEFAULT_BODY_ID,
  faceId = DEFAULT_FACE_ID,
  size = 'md',
  mode = 'full',
  projected = false,
  selected = false,
  interactive = false,
  showRings = true,
  bare = false,
  className = '',
  showBackground = true,
  followMouse = false,
  onClick,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ bodyX: 0, bodyY: 0, faceX: 0, faceY: 0 });
  const currentRef = useRef({ bodyX: 0, bodyY: 0, faceX: 0, faceY: 0 });
  const animRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const sizeToken = AVATAR_SIZE_MAP[size] || AVATAR_SIZE_MAP.md;

  const bodyMarkup = useMemo(() => {
    const item = getBodyItem(bodyId);
    return item.markup.replaceAll('__AVATAR_COLOR__', color);
  }, [bodyId, color]);

  const faceMarkup = useMemo(() => {
    return getFaceItem(faceId).markup;
  }, [faceId]);

  // High-performance 120 FPS GPU parallax: zero React re-renders, direct CSS variables + LERP
  useEffect(() => {
    if (!followMouse) return;

    const startLoop = () => {
      const loop = () => {
        const cur = currentRef.current;
        const tar = targetRef.current;

        // Linear interpolation (damping)
        cur.bodyX += (tar.bodyX - cur.bodyX) * 0.15;
        cur.bodyY += (tar.bodyY - cur.bodyY) * 0.15;
        cur.faceX += (tar.faceX - cur.faceX) * 0.18;
        cur.faceY += (tar.faceY - cur.faceY) * 0.18;

        if (containerRef.current) {
          containerRef.current.style.setProperty('--av-bx', `${cur.bodyX.toFixed(2)}px`);
          containerRef.current.style.setProperty('--av-by', `${cur.bodyY.toFixed(2)}px`);
          containerRef.current.style.setProperty('--av-fx', `${cur.faceX.toFixed(2)}px`);
          containerRef.current.style.setProperty('--av-fy', `${cur.faceY.toFixed(2)}px`);
        }

        const delta =
          Math.abs(tar.bodyX - cur.bodyX) +
          Math.abs(tar.bodyY - cur.bodyY) +
          Math.abs(tar.faceX - cur.faceX) +
          Math.abs(tar.faceY - cur.faceY);

        if (delta > 0.05) {
          animRef.current = requestAnimationFrame(loop);
        } else {
          cur.bodyX = tar.bodyX;
          cur.bodyY = tar.bodyY;
          cur.faceX = tar.faceX;
          cur.faceY = tar.faceY;
          if (containerRef.current) {
            containerRef.current.style.setProperty('--av-bx', `${tar.bodyX.toFixed(2)}px`);
            containerRef.current.style.setProperty('--av-by', `${tar.bodyY.toFixed(2)}px`);
            containerRef.current.style.setProperty('--av-fx', `${tar.faceX.toFixed(2)}px`);
            containerRef.current.style.setProperty('--av-fy', `${tar.faceY.toFixed(2)}px`);
          }
          isRunningRef.current = false;
          animRef.current = null;
        }
      };
      animRef.current = requestAnimationFrame(loop);
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      const maxDist = 450;
      const clampedDist = Math.min(distance, maxDist);
      const norm = clampedDist / maxDist;
      const angle = Math.atan2(deltaY, deltaX);

      targetRef.current = {
        bodyX: Math.cos(angle) * norm * 12,
        bodyY: Math.sin(angle) * norm * 8,
        faceX: Math.cos(angle) * norm * 30,
        faceY: Math.sin(angle) * norm * 22,
      };

      if (!isRunningRef.current) {
        isRunningRef.current = true;
        startLoop();
      }
    };

    const handleMouseLeave = () => {
      targetRef.current = { bodyX: 0, bodyY: 0, faceX: 0, faceY: 0 };
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        startLoop();
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [followMouse]);

  // Framed vs Bare logic
  const hasFraming = !bare;
  const enableRings = showRings && hasFraming;
  const renderBackgroundCircle = showBackground && hasFraming;

  // Standardized styling classes
  const frameClasses = hasFraming
    ? 'rounded-full bg-calm-100 border border-calm-200/80 shadow-soft overflow-hidden'
    : 'overflow-visible';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:scale-105 active:scale-95'
    : '';

  const selectionClasses = selected && enableRings
    ? 'ring-2 ring-calm-800 ring-offset-2 ring-offset-white shadow-md scale-105'
    : interactive && enableRings
    ? 'opacity-85 hover:opacity-100 hover:ring-1 hover:ring-calm-400'
    : '';

  const projectionClasses = projected && !selected && enableRings
    ? 'ring-2 ring-white ring-offset-2 ring-offset-calm-100'
    : '';

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      title={title}
      className={`relative inline-flex items-center justify-center select-none shrink-0 transition-all duration-200 ${sizeToken.container} ${frameClasses} ${interactiveClasses} ${selectionClasses} ${projectionClasses} ${className}`}
    >
      <svg
        viewBox={mode === 'face-only' ? '150 85 200 200' : '0 0 500 500'}
        className={`${sizeToken.svg} ${projected && mode !== 'face-only' && hasFraming ? 'translate-y-0.5' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Background Tint (omitted when bare=true or showBackground=false) */}
        {renderBackgroundCircle && (
          <circle
            cx={250}
            cy={mode === 'face-only' ? 185 : 250}
            r={mode === 'face-only' ? 95 : 230}
            fill={color}
            fillOpacity="0.12"
          />
        )}

        {/* Layer 1: Legs (only in full mode; remain stationary) */}
        {mode === 'full' && (
          <g id="avatar-legs" dangerouslySetInnerHTML={{ __html: LEGS_DEFAULT_MARKUP }} />
        )}

        {/* Layer 2: Cloud Body (full or body-only modes) */}
        {mode !== 'face-only' && (
          <g
            id="avatar-body"
            style={
              followMouse
                ? {
                    transform: 'translate3d(var(--av-bx, 0px), var(--av-by, 0px), 0)',
                    willChange: 'transform',
                  }
                : undefined
            }
            dangerouslySetInnerHTML={{ __html: bodyMarkup }}
          />
        )}

        {/* Layer 3: Face Expression (full or face-only modes) */}
        {mode !== 'body-only' && (
          <g
            id="avatar-face"
            style={
              followMouse
                ? {
                    transform: 'translate3d(var(--av-fx, 0px), var(--av-fy, 0px), 0)',
                    willChange: 'transform',
                  }
                : undefined
            }
            dangerouslySetInnerHTML={{ __html: faceMarkup }}
          />
        )}
      </svg>
    </div>
  );
};

export default AvatarSvg;
