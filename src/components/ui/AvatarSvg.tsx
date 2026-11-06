import React, { useMemo, useEffect, useRef } from 'react';
import {
  LEGS_DEFAULT_MARKUP,
  getBodyItem,
  getFaceItem,
  DEFAULT_BODY_ID,
  DEFAULT_FACE_ID,
} from '../../data/avatarRegistry';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'hero' | 'full';

const AVATAR_SIZE_MAP: Record<AvatarSize, { container: string; svg: string }> = {
  xs: { container: 'w-6 h-6', svg: 'w-5 h-5' },
  sm: { container: 'w-8 h-8', svg: 'w-7 h-7' },
  md: { container: 'w-10 h-10', svg: 'w-9 h-9' },
  lg: { container: 'w-14 h-14', svg: 'w-12 h-12' },
  xl: { container: 'w-20 h-20', svg: 'w-18 h-18' },
  xxl: { container: 'w-24 h-24', svg: 'w-22 h-22' },
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
  showRings?: boolean;       // Permite remover facilmente todos os aneis/rings (padrao: true)
  bare?: boolean;            // Renderiza estritamente o avatar vetorial, sem fundo circular, bordas, sombras ou rings (padrao: false)
  className?: string;
  showBackground?: boolean;  // Tint circular de fundo no SVG (desativado automaticamente quando bare=true)
  followMouse?: boolean;
  noFace?: boolean;
  onClick?: () => void;
  title?: string;
}

// Global mouse tracker with singleton listeners to prevent duplicate window events and tab freezing
let globalPointerX = -9999;
let globalPointerY = -9999;
let globalIsInside = true;
const globalFollowers = new Set<() => void>();

function onGlobalPointerMove(e: MouseEvent) {
  globalPointerX = e.clientX;
  globalPointerY = e.clientY;
  globalIsInside = true;
  globalFollowers.forEach(notify => notify());
}

function onGlobalMouseLeave() {
  globalIsInside = false;
  globalFollowers.forEach(notify => notify());
}

function subscribeGlobalPointer(notify: () => void): () => void {
  globalFollowers.add(notify);
  if (globalFollowers.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('mousemove', onGlobalPointerMove, { passive: true });
    window.addEventListener('mouseleave', onGlobalMouseLeave);
  }

  return () => {
    globalFollowers.delete(notify);
    if (globalFollowers.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('mousemove', onGlobalPointerMove);
      window.removeEventListener('mouseleave', onGlobalMouseLeave);
    }
  };
}

export const AvatarSvg: React.FC<AvatarSvgProps> = React.memo(({
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
  noFace = false,
  onClick,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ bodyX: 0, bodyY: 0, faceX: 0, faceY: 0 });
  const currentRef = useRef({ bodyX: 0, bodyY: 0, faceX: 0, faceY: 0 });

  const sizeToken = AVATAR_SIZE_MAP[size] || AVATAR_SIZE_MAP.md;

  const bodyMarkup = useMemo(() => {
    const item = getBodyItem(bodyId);
    return item.markup.replaceAll('__AVATAR_COLOR__', color);
  }, [bodyId, color]);

  const faceMarkup = useMemo(() => {
    return getFaceItem(faceId).markup;
  }, [faceId]);

  // High-performance 120 FPS GPU parallax: zero forced reflows, cached center, and RAF-driven
  useEffect(() => {
    if (!followMouse) return;

    let centerPos: { x: number; y: number } | null = null;
    let animId: number | null = null;
    let isLoopRunning = false;
    let resizeTimer: any = null;

    const measureCenter = () => {
      const el = containerRef.current;
      if (!el || !el.isConnected || el.offsetParent === null) {
        centerPos = null;
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        centerPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };

    // Mede centro inicialmente apos montagem e renderizacao
    const initTimer = requestAnimationFrame(measureCenter);

    const loop = () => {
      const el = containerRef.current;
      if (!el || !el.isConnected) {
        isLoopRunning = false;
        animId = null;
        return;
      }

      const cur = currentRef.current;
      const tar = targetRef.current;

      cur.bodyX += (tar.bodyX - cur.bodyX) * 0.15;
      cur.bodyY += (tar.bodyY - cur.bodyY) * 0.15;
      cur.faceX += (tar.faceX - cur.faceX) * 0.18;
      cur.faceY += (tar.faceY - cur.faceY) * 0.18;

      el.style.setProperty('--av-bx', `${cur.bodyX.toFixed(1)}px`);
      el.style.setProperty('--av-by', `${cur.bodyY.toFixed(1)}px`);
      el.style.setProperty('--av-fx', `${cur.faceX.toFixed(1)}px`);
      el.style.setProperty('--av-fy', `${cur.faceY.toFixed(1)}px`);

      const delta =
        Math.abs(tar.bodyX - cur.bodyX) +
        Math.abs(tar.bodyY - cur.bodyY) +
        Math.abs(tar.faceX - cur.faceX) +
        Math.abs(tar.faceY - cur.faceY);

      if (delta > 0.08) {
        animId = requestAnimationFrame(loop);
      } else {
        isLoopRunning = false;
        animId = null;
      }
    };

    const onPointerUpdate = () => {
      const el = containerRef.current;
      if (!el || !el.isConnected || el.offsetParent === null) return;

      if (!centerPos) {
        measureCenter();
      }

      if (centerPos) {
        if (globalIsInside && globalPointerX >= 0 && globalPointerY >= 0) {
          const deltaX = globalPointerX - centerPos.x;
          const deltaY = globalPointerY - centerPos.y;
          const distance = Math.hypot(deltaX, deltaY);
          const maxDist = 450;
          const clampedDist = Math.min(distance, maxDist);
          const norm = clampedDist / maxDist;
          const angle = Math.atan2(deltaY, deltaX);

          targetRef.current = {
            bodyX: Math.cos(angle) * norm * 10,
            bodyY: Math.sin(angle) * norm * 6,
            faceX: Math.cos(angle) * norm * 24,
            faceY: Math.sin(angle) * norm * 18,
          };
        } else {
          targetRef.current = { bodyX: 0, bodyY: 0, faceX: 0, faceY: 0 };
        }
      }

      if (!isLoopRunning) {
        isLoopRunning = true;
        animId = requestAnimationFrame(loop);
      }
    };

    const unsubscribe = subscribeGlobalPointer(onPointerUpdate);

    const onWindowResizeOrScroll = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measureCenter, 150);
    };

    window.addEventListener('resize', onWindowResizeOrScroll, { passive: true });
    window.addEventListener('scroll', onWindowResizeOrScroll, { passive: true });

    return () => {
      cancelAnimationFrame(initTimer);
      if (animId) cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      unsubscribe();
      window.removeEventListener('resize', onWindowResizeOrScroll);
      window.removeEventListener('scroll', onWindowResizeOrScroll);
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

        {/* Layer 3: Face Expression (full or face-only modes, omitted when noFace=true) */}
        {mode !== 'body-only' && !noFace && (
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
});

AvatarSvg.displayName = 'AvatarSvg';

export default AvatarSvg;
