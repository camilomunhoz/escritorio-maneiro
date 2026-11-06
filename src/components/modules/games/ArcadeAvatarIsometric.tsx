import React, { useRef, useEffect } from 'react';
import { UserAvatar } from '../../ui/UserAvatar';

export interface ArcadeAvatarIsometricProps {
  avatarColor?: string;
  avatarBody?: string;
  userId?: string;
}

export const ArcadeAvatarIsometric: React.FC<ArcadeAvatarIsometricProps> = ({
  avatarColor,
  avatarBody,
  userId,
}) => {
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reproduz em tempo real o canvas do jogo ativo na tela do fliperama
  useEffect(() => {
    let animId: number;
    let idleTick = 0;

    const render = () => {
      const targetCanvas = miniCanvasRef.current;
      if (!targetCanvas) return;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const sourceCanvas = document.getElementById('active-game-canvas') as HTMLCanvasElement | null;

      if (sourceCanvas && sourceCanvas.width > 0 && sourceCanvas.height > 0) {
        // Limpa a tela com a cor de fundo padrao do fliperama
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

        // Simulacao estrita de object-fit: contain sem stretch nem cortes
        const srcW = sourceCanvas.width;
        const srcH = sourceCanvas.height;
        const dstW = targetCanvas.width;
        const dstH = targetCanvas.height;

        const srcRatio = srcW / srcH;
        const dstRatio = dstW / dstH;

        let drawW = dstW;
        let drawH = dstH;
        let drawX = 0;
        let drawY = 0;

        if (srcRatio > dstRatio) {
          // Fonte mais larga que a proporcao do monitor: letterbox (barras superior e inferior)
          drawW = dstW;
          drawH = dstW / srcRatio;
          drawY = (dstH - drawH) / 2;
        } else {
          // Fonte mais quadrada ou vertical: pillarbox (barras laterais)
          drawH = dstH;
          drawW = dstH * srcRatio;
          drawX = (dstW - drawW) / 2;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(sourceCanvas, drawX, drawY, drawW, drawH);
      } else {
        // Tela retro de standby quando fora de partida
        idleTick++;
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

        // Grade sutil de scanlines
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        for (let y = 0; y < targetCanvas.height; y += 6) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(targetCanvas.width, y);
          ctx.stroke();
        }

        // Texto pulsante em tom esmeralda retro
        if (Math.floor(idleTick / 30) % 2 === 0) {
          ctx.fillStyle = '#34D399';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('INSERT COIN', targetCanvas.width / 2, targetCanvas.height / 2);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-3 select-none">
      {/* Cenario Isometrico Ampliado do Fliperama com o Avatar */}
      <div className="relative w-56 sm:w-60 h-72 sm:h-80 flex items-center justify-center">
        {/* Sombra da base isometrica */}
        <div className="absolute bottom-3 w-48 h-14 bg-calm-400/25 rounded-full blur-[4px]" />

        {/* Gabinete do Fliperama em SVG Vetorial */}
        <svg
          viewBox="0 0 200 240"
          className="absolute inset-0 w-full h-full drop-shadow-md pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gabinete Lateral / Traseiro com perspectiva */}
          <path
            d="M36 26 L86 12 L164 12 L164 196 L116 216 L36 216 Z"
            fill="#94A3B8"
            opacity="0.28"
          />

          {/* Corpo do Arcade Principal */}
          <path
            d="M45 35 L155 35 L155 205 L45 205 Z"
            fill="#475569"
            rx="8"
          />

          {/* Marquee Superior Iluminado */}
          <rect x="56" y="44" width="88" height="20" rx="3" fill="#E2E8F0" />
          <text
            x="100"
            y="58"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#334155"
            letterSpacing="1.5"
          >
            ARCADE
          </text>

          {/* Moldura Externa da Tela do Monitor */}
          <rect x="52" y="68" width="96" height="70" rx="5" fill="#0F172A" />

          {/* Fundo do Monitor */}
          <rect x="56" y="72" width="88" height="62" rx="3" fill="#1E293B" />

          {/* Painel de Controle com Joystick e Botoes */}
          <path d="M42 144 L158 144 L164 168 L36 168 Z" fill="#334155" />

          {/* Base e Haste do Joystick */}
          <circle cx="74" cy="156" r="6" fill="#1E293B" />
          <line x1="74" y1="156" x2="77" y2="147" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <circle cx="77" cy="146" r="4.5" fill="#EF4444" className="animate-pulse" />

          {/* Botoes de Acao do Fliperama */}
          <circle cx="108" cy="157" r="3.5" fill="#38BDF8" />
          <circle cx="120" cy="153" r="3.5" fill="#34D399" />
          <circle cx="132" cy="157" r="3.5" fill="#FBBF24" />

          {/* Painel Frontal Inferior com Entrada de Ficha */}
          <rect x="74" y="176" width="52" height="24" rx="2" fill="#334155" />
          <rect x="94" y="180" width="12" height="16" rx="1" fill="#1E293B" />
          <line x1="100" y1="183" x2="100" y2="192" stroke="#94A3B8" strokeWidth="1.5" />
        </svg>

        {/* Tela do Arcade com Reproducao ao Vivo do Jogo */}
        <div
          className="absolute overflow-hidden rounded-[3px] bg-slate-950 border border-slate-700/80 shadow-inner pointer-events-none"
          style={{
            left: '28%',
            top: '30%',
            width: '44%',
            height: '25.83%',
          }}
        >
          <canvas
            ref={miniCanvasRef}
            width={176}
            height={124}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Linhas de scanline sutis sobre a tela do monitor */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none opacity-60" />
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.4) 2px, rgba(0, 0, 0, 0.4) 4px)',
            }}
          />
        </div>

        {/* Avatar Posicionado de Costas (noFace, sem followMouse) em frente ao Arcade */}
        <div className="absolute bottom-2 right-3 z-10 flex items-center justify-center pointer-events-none">
          <UserAvatar
            userId={userId}
            color={avatarColor}
            bodyId={avatarBody}
            size="xxl"
            bare
            noFace={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ArcadeAvatarIsometric;
